# Redis Service (Docker + Kubernetes + Go Client)

## 🚀 Overview
Redis is used as a cache layer across microservices.

---

## 🐳 Docker Setup

### Build image
docker build -t redis-service .

### Run container
docker run -d -p 6379:6379 redis-service

---

## ☸️ Kubernetes

kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/redis-service.yaml

Access via:
redis-service:6379

---

## 🧩 Go Client Usage

import "redis-client"

client := redisclient.NewRedisClient("localhost:6379")

client.Set("key", "value")

val := client.Get("key")

---

## 🧪 Test

redis-cli -h localhost -p 6379

SET test hello
GET test

---

## 📌 Notes
- Uses LRU eviction policy
- Persistence enabled (AOF)
