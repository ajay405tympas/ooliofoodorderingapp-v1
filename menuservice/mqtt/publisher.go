package mqtt

import (
	"encoding/json"
	"log"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

var Client mqtt.Client

func InitMQTT(broker string) {
	opts := mqtt.NewClientOptions().AddBroker(broker)
	Client = mqtt.NewClient(opts)

	if token := Client.Connect(); token.Wait() && token.Error() != nil {
		log.Fatal(token.Error())
	}
}

func Publish(topic string, payload interface{}) {
	data, _ := json.Marshal(payload)
	Client.Publish(topic, 0, false, data)
}
