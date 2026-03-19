# Payment Service (Go + MQTT + Docker)

## Features
- /payment API (initiate payment)
- /webhook API (third-party callback)
- Publishes payment confirmation to MQTT

---

## Run with Docker Compose (Recommended)

docker-compose up --build

---

## Run Locally

1. Start MQTT:
docker run -d -p 1883:1883 eclipse-mosquitto

2. Run service:
go run main.go

---

## Test APIs

### Initiate Payment
curl -X POST http://localhost:8081/payment \
-H "Content-Type: application/json" \
-d '{"orderId":"123","amount":300}'

### Webhook (simulate success)
curl -X POST http://localhost:8081/webhook \
-H "Content-Type: application/json" \
-d '{"orderId":"123","status":"SUCCESS"}'

---

## MQTT Topic
payment/confirmed

---

## Folder Structure
.
├── main.go
├── go.mod
├── Dockerfile
├── docker-compose.yml
├── README.md

---

## Deployment

Build image:
docker build -t payment-service .

Run container:
docker run -p 8081:8081 payment-service
