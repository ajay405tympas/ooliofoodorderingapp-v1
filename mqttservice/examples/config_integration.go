// Example integration snippet for Config Service

mqttClient := mqtt.NewClient("tcp://mqtt-service:1883")

// Subscribe
mqttClient.Subscribe("config/request", func(payload []byte) {
    data, _ := json.Marshal(config.AppConfig)
    mqttClient.Publish("config/response", data)
})
