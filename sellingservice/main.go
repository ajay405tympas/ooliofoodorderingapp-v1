package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"os"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()

type Order struct {
	OrderID string  `json:"order_id"`
	Items   []Item  `json:"items"`
	Coupon  string  `json:"coupon"`
	Session string  `json:"session_id"`
}

type Item struct {
	Name  string  `json:"name"`
	Price float64 `json:"price"`
	Qty   int     `json:"qty"`
}

type PaymentEvent struct {
	OrderID string  `json:"order_id"`
	Amount  float64 `json:"amount"`
}

var db *sql.DB
var rdb *redis.Client

func initDB() {
	dsn := os.Getenv("DB_DSN")
	var err error
	db, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal(err)
	}
}

func initRedis() {
	rdb = redis.NewClient(&redis.Options{
		Addr: "redis:6379",
	})
}

func calculateTotal(items []Item) float64 {
	total := 0.0
	for _, i := range items {
		total += i.Price * float64(i.Qty)
	}
	return total
}

func handleOrder(client mqtt.Client, msg mqtt.Message) {
	var order Order
	json.Unmarshal(msg.Payload(), &order)

	total := calculateTotal(order.Items)

	// store session
	rdb.Set(ctx, order.Session, order.OrderID, time.Hour)

	// publish payment initiation
	payment := PaymentEvent{
		OrderID: order.OrderID,
		Amount:  total,
	}
	out, _ := json.Marshal(payment)
	client.Publish("payment/initiate", 0, false, out)

	log.Println("Order processed:", order.OrderID)
}

func handlePayment(client mqtt.Client, msg mqtt.Message) {
	log.Println("Payment confirmed:", string(msg.Payload()))
	client.Publish("kitchen/orders", 0, false, msg.Payload())
}

func main() {
	initDB()
	initRedis()

	opts := mqtt.NewClientOptions().AddBroker("tcp://mosquitto:1883")
	client := mqtt.NewClient(opts)
	client.Connect()

	client.Subscribe("order/finalized", 0, handleOrder)
	client.Subscribe("payment/confirmed", 0, handlePayment)

	select {}
}
