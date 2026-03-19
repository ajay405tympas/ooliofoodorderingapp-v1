package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

var client mqtt.Client

type PaymentRequest struct {
	OrderID string  `json:"orderId"`
	Amount  float64 `json:"amount"`
}

type WebhookRequest struct {
	OrderID string `json:"orderId"`
	Status  string `json:"status"`
}

func main() {
	broker := getEnv("MQTT_BROKER", "tcp://mosquitto:1883")

	opts := mqtt.NewClientOptions().AddBroker(broker)
	opts.SetClientID("payment-service")

	client = mqtt.NewClient(opts)
	if token := client.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

	http.HandleFunc("/payment", handlePayment)
	http.HandleFunc("/webhook", handleWebhook)

	log.Println("Payment service running on :8081")
	log.Fatal(http.ListenAndServe(":8081", nil))
}

func handlePayment(w http.ResponseWriter, r *http.Request) {
	var req PaymentRequest
	json.NewDecoder(r.Body).Decode(&req)

	log.Println("Payment initiated:", req.OrderID)

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Payment initiated",
	})
}

func handleWebhook(w http.ResponseWriter, r *http.Request) {
	var req WebhookRequest
	json.NewDecoder(r.Body).Decode(&req)

	log.Println("Webhook:", req.OrderID, req.Status)

	if req.Status == "SUCCESS" {
		publish(req.OrderID)
	}

	w.WriteHeader(http.StatusOK)
}

func publish(orderID string) {
	topic := "payment/confirmed"
	payload := map[string]string{
		"orderId": orderID,
		"status":  "CONFIRMED",
	}
	data, _ := json.Marshal(payload)

	token := client.Publish(topic, 0, false, data)
	token.Wait()

	log.Println("Published:", string(data))
}

func getEnv(key, fallback string) string {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	return val
}
