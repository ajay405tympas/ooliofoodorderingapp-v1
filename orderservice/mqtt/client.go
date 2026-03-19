package mqtt

import (
	"log"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

var client mqtt.Client

func Init(broker string) {
	opts := mqtt.NewClientOptions().AddBroker(broker)
	client = mqtt.NewClient(opts)

	if token := client.Connect(); token.Wait() && token.Error() != nil {
		log.Fatal(token.Error())
	}
}

func Publish(topic string, payload []byte) {
	client.Publish(topic, 1, false, payload)
}
