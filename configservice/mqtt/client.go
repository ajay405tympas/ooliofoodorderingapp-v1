package mqtt

import (
	"encoding/json"
	"log"

	"config-service/config"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

var Client mqtt.Client

func Init(broker string) {
	opts := mqtt.NewClientOptions().AddBroker(broker)
	Client = mqtt.NewClient(opts)

	if token := Client.Connect(); token.Wait() && token.Error() != nil {
		log.Fatal(token.Error())
	}

	subscribe()
}

func subscribe() {
	Client.Subscribe("/getConfig", 0, func(client mqtt.Client, msg mqtt.Message) {
		log.Println("Received config request")

		payload, _ := json.Marshal(config.AppConfig)
		Client.Publish("config/response", 0, false, payload)
	})
}
