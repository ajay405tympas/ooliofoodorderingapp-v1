package mqtt

import (
	"log"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

type Client struct {
	MQTT mqtt.Client
}

func NewClient(broker string) *Client {
	opts := mqtt.NewClientOptions().AddBroker(broker)
	opts.SetClientID("service-client")

	client := mqtt.NewClient(opts)

	if token := client.Connect(); token.Wait() && token.Error() != nil {
		log.Fatal(token.Error())
	}

	return &Client{MQTT: client}
}

func (c *Client) Publish(topic string, payload []byte) {
	token := c.MQTT.Publish(topic, 1, false, payload)
	token.Wait()
}

func (c *Client) Subscribe(topic string, handler func([]byte)) {
	c.MQTT.Subscribe(topic, 1, func(client mqtt.Client, msg mqtt.Message) {
		handler(msg.Payload())
	})
}
