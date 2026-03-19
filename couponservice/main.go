package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	_ "github.com/lib/pq"
	"github.com/sirupsen/logrus"
)

type ApplyCouponRequest struct {
	Version string  `json:"version"`
	Coupon  string  `json:"coupon"`
	Total   float64 `json:"total"`
	OrderID string  `json:"order_id"`
}

type ApplyCouponResponse struct {
	Version  string  `json:"version"`
	Status   string  `json:"status"`
	Coupon   string  `json:"coupon"`
	Discount float64 `json:"discount,omitempty"`
	NewTotal float64 `json:"new_total"`
	OrderID  string  `json:"order_id"`
	Reason   string  `json:"reason,omitempty"`
}

var (
	db          *sql.DB
	log         = logrus.New()
	mqttClient  mqtt.Client
	subTopic    = getEnv("MQTT_SUB_TOPIC", "pos/apply-coupon")
	pubTopic    = getEnv("MQTT_PUB_TOPIC", "pos/coupon-response")
	notifyTopic = getEnv("MQTT_NOTIFY_TOPIC", "notification/coupon-invalid")
)

func getEnv(k, def string) string {
	v := os.Getenv(k)
	if v == "" {
		return def
	}
	return v
}

func initLogger() {
	log.SetFormatter(&logrus.JSONFormatter{})
	level := getEnv("LOG_LEVEL", "info")
	lvl, err := logrus.ParseLevel(level)
	if err != nil {
		lvl = logrus.InfoLevel
	}
	log.SetLevel(lvl)
}

func initDB() error {
	dsn := getEnv("DB_DSN", "postgres://postgres:postgres@localhost:5432/coupons?sslmode=disable")
	var err error
	db, err = sql.Open("postgres", dsn)
	if err != nil {
		return err
	}
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(30 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		return err
	}

	schema := `
CREATE TABLE IF NOT EXISTS coupons (
	code TEXT PRIMARY KEY,
	type TEXT NOT NULL, -- FLAT or PERCENT
	value NUMERIC NOT NULL,
	expiry TIMESTAMP NULL,
	min_order NUMERIC DEFAULT 0,
	usage_limit INT DEFAULT 0,
	used_count INT DEFAULT 0
);`
	if _, err := db.Exec(schema); err != nil {
		return err
	}

	seed := `
INSERT INTO coupons(code, type, value, min_order, usage_limit, used_count)
VALUES 
 ('SAVE10','FLAT',10,0,0,0),
 ('OFF10P','PERCENT',10,100,0,0)
ON CONFLICT (code) DO NOTHING;`
	_, _ = db.Exec(seed)

	return nil
}

type Coupon struct {
	Code       string
	Type       string
	Value      float64
	Expiry     *time.Time
	MinOrder   float64
	UsageLimit int
	UsedCount  int
}

func fetchCoupon(ctx context.Context, code string) (*Coupon, error) {
	row := db.QueryRowContext(ctx, `
SELECT code, type, value, expiry, min_order, usage_limit, used_count
FROM coupons WHERE code = $1`, code)
	var c Coupon
	if err := row.Scan(&c.Code, &c.Type, &c.Value, &c.Expiry, &c.MinOrder, &c.UsageLimit, &c.UsedCount); err != nil {
		return nil, err
	}
	return &c, nil
}

func validateAndCompute(c *Coupon, total float64) (float64, string) {
	if c.Expiry != nil && time.Now().After(*c.Expiry) {
		return 0, "expired"
	}
	if total < c.MinOrder {
		return 0, "min_order_not_met"
	}
	if c.UsageLimit > 0 && c.UsedCount >= c.UsageLimit {
		return 0, "usage_limit_exceeded"
	}

	switch c.Type {
	case "FLAT":
		if c.Value > total {
			return total, "" // cap
		}
		return c.Value, ""
	case "PERCENT":
		return (c.Value / 100.0) * total, ""
	default:
		return 0, "invalid_type"
	}
}

func incrementUsage(ctx context.Context, code string) {
	_, _ = db.ExecContext(ctx, `UPDATE coupons SET used_count = used_count + 1 WHERE code = $1`, code)
}

func handleMessage(client mqtt.Client, msg mqtt.Message) {
	var req ApplyCouponRequest
	if err := json.Unmarshal(msg.Payload(), &req); err != nil {
		log.WithError(err).Error("invalid json")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	c, err := fetchCoupon(ctx, req.Coupon)
	var res ApplyCouponResponse
	res.Version = "v1"
	res.Coupon = req.Coupon
	res.OrderID = req.OrderID

	if err != nil {
		res.Status = "invalid"
		res.NewTotal = req.Total
		res.Reason = "not_found"
		publishJSON(client, pubTopic, res)
		publishJSON(client, notifyTopic, map[string]interface{}{
			"event": "coupon.invalid",
			"order_id": req.OrderID,
			"coupon": req.Coupon,
			"reason": res.Reason,
		})
		return
	}

	discount, reason := validateAndCompute(c, req.Total)
	if reason != "" {
		res.Status = "invalid"
		res.NewTotal = req.Total
		res.Reason = reason
		publishJSON(client, pubTopic, res)
		publishJSON(client, notifyTopic, map[string]interface{}{
			"event": "coupon.invalid",
			"order_id": req.OrderID,
			"coupon": req.Coupon,
			"reason": res.Reason,
		})
		return
	}

	newTotal := req.Total - discount
	if newTotal < 0 {
		newTotal = 0
	}

	res.Status = "valid"
	res.Discount = discount
	res.NewTotal = newTotal

	publishJSON(client, pubTopic, res)
	incrementUsage(ctx, c.Code)
	log.WithFields(logrus.Fields{"order_id": req.OrderID, "coupon": req.Coupon, "discount": discount}).Info("coupon applied")
}

func publishJSON(client mqtt.Client, topic string, v interface{}) {
	b, _ := json.Marshal(v)
	token := client.Publish(topic, 1, false, b)
	token.Wait()
}

func initMQTT() error {
	broker := getEnv("MQTT_BROKER", "tcp://localhost:1883")
	clientID := getEnv("MQTT_CLIENT_ID", "coupon-service")

	opts := mqtt.NewClientOptions().AddBroker(broker).SetClientID(clientID)
	opts.SetAutoReconnect(true)
	opts.SetConnectRetry(true)
	opts.SetConnectRetryInterval(2 * time.Second)
	opts.OnConnect = func(c mqtt.Client) {
		if token := c.Subscribe(subTopic, 1, handleMessage); token.Wait() && token.Error() != nil {
			log.WithError(token.Error()).Error("subscribe failed")
		} else {
			log.WithField("topic", subTopic).Info("subscribed")
		}
	}

	mqttClient = mqtt.NewClient(opts)
	if token := mqttClient.Connect(); token.Wait() && token.Error() != nil {
		return token.Error()
	}
	return nil
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		w.Write([]byte("db not ready"))
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("ok"))
}

func main() {
	initLogger()

	if err := initDB(); err != nil {
		log.WithError(err).Fatal("db init failed")
	}

	if err := initMQTT(); err != nil {
		log.WithError(err).Fatal("mqtt init failed")
	}

	// health server
	port := getEnv("PORT", "8080")
	mux := http.NewServeMux()
	mux.HandleFunc("/health", healthHandler)

	srv := &http.Server{Addr: ":" + port, Handler: mux}

	go func() {
		log.WithField("port", port).Info("health server started")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.WithError(err).Fatal("http server error")
		}
	}()

	// graceful shutdown
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	log.Info("shutting down")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = srv.Shutdown(ctx)
	if mqttClient != nil && mqttClient.IsConnected() {
		mqttClient.Disconnect(250)
	}
	if db != nil {
		_ = db.Close()
	}
}
