# MQTT Service (Broker + Go Client)

## Overview
Provides MQTT broker (Mosquitto) + reusable Go client for all services.

---

## 📦 Components

- MQTT Broker (Mosquitto Docker)
- Kubernetes Deployment
- Go MQTT Client Library
- Integration examples for Menu & Config services

---

## 🐳 Build & Run Broker

cd broker
docker build -t mqtt-broker .
docker run -d -p 1883:1883 --name mqtt mqtt-broker

---

## ☸️ Kubernetes

kubectl apply -f k8s/mqtt-deployment.yaml
kubectl apply -f k8s/mqtt-service.yaml

Broker accessible at:
tcp://mqtt-service:1883

---

## 🧩 Go Client Usage

Import client:

import "mqtt-client"

client := mqtt.NewClient("tcp://localhost:1883")

### Publish
client.Publish("topic", []byte("message"))

### Subscribe
client.Subscribe("topic", func(payload []byte) {
    fmt.Println(string(payload))
})

---

## 📡 Topics

menu/request → Menu service listens  
menu/response → Menu publishes  

config/request → Config listens  
config/response → Config publishes  

---

## 🧪 Test

docker run -d -p 1883:1883 eclipse-mosquitto

mosquitto_pub -t menu/request -m '{}'
mosquitto_sub -t menu/response

---

## 👨‍💻 Notes

- Use QoS 1 for reliability
- Use structured topics: store/{storeId}/menu
- MQTT broker is infra, not business logic
