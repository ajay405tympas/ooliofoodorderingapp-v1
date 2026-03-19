
package main

import (
	"log"
	"time"
)

// Mock MQTT subscriber
func subscribeTopics() {
	topics := []string{
		"/outbound/order",
		"/outbound/payment",
		"/outbound/notification",
	}

	for _, topic := range topics {
		go func(t string) {
			for {
				log.Println("Received message from topic:", t)
				time.Sleep(5 * time.Second)
			}
		}(topic)
	}
}
