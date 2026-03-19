
package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"fmt"
	"time"
)

type PaymentCompletedEvent struct {
	OrderID string   `json:"orderId"`
	Items   []string `json:"items"`
	Total   float64  `json:"total"`
}

type KitchenOrderCompletedEvent struct {
	OrderID string `json:"orderId"`
	Status  string `json:"status"`
}

func main() {
	http.HandleFunc("/paymentCompleted", handlePaymentCompleted)
	log.Println("Server started at :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func handlePaymentCompleted(w http.ResponseWriter, r *http.Request) {
	var event PaymentCompletedEvent
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		http.Error(w, "invalid payload", 400)
		return
	}

	file := generateKOT(event)
	publish(event.OrderID)

	json.NewEncoder(w).Encode(map[string]string{
		"message": "KOT generated",
		"file": file,
	})
}

func generateKOT(e PaymentCompletedEvent) string {
	filename := fmt.Sprintf("kot_%s.txt", e.OrderID)
	f, _ := os.Create(filename)
	defer f.Close()

	content := "---- KITCHEN ORDER ----\n"
	content += fmt.Sprintf("Order: %s\n", e.OrderID)
	for _, item := range e.Items {
		content += "- " + item + "\n"
	}
	content += fmt.Sprintf("Total: %.2f\nTime: %s\n", e.Total, time.Now())

	f.WriteString(content)
	return filename
}

func publish(orderID string) {
	event := KitchenOrderCompletedEvent{OrderID: orderID, Status: "READY"}
	b, _ := json.Marshal(event)
	log.Println("Publishing /kitchenOrderCompleted:", string(b))
}
