// Example integration snippet for Menu Service

mqttClient := mqtt.NewClient("tcp://mqtt-service:1883")

// Subscribe
mqttClient.Subscribe("menu/request", func(payload []byte) {
    menu, _ := service.FetchMenu()
    data, _ := json.Marshal(menu)
    mqttClient.Publish("menu/response", data)
})
