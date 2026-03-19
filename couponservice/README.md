# Coupon Service (Go, MQTT, PostgreSQL)

## Overview
Event-driven microservice that validates coupons and calculates discounts. It communicates **only via MQTT** with the POS Selling Service and emits notifications for invalid coupons.

## Topics
- **Subscribe:** `pos/apply-coupon`
- **Publish (result):** `pos/coupon-response`
- **Publish (notify):** `notification/coupon-invalid`

## Message Contracts

### Request (POS → Coupon)
```json
{
  "version": "v1",
  "order_id": "ORD123",
  "coupon": "SAVE10",
  "total": 250
}
```

### Response (Coupon → POS)
```json
{
  "version": "v1",
  "status": "valid",
  "order_id": "ORD123",
  "coupon": "SAVE10",
  "discount": 10,
  "new_total": 240
}
```

### Invalid Notification (Coupon → Notification)
```json
{
  "event": "coupon.invalid",
  "order_id": "ORD123",
  "coupon": "BAD",
  "reason": "not_found"
}
```

## Folder Structure
```
.
├── main.go
├── go.mod
├── Dockerfile
├── docker-compose.yml
└── infra/
    └── mosquitto.conf
```

## Run Locally (Docker Compose)
```bash
docker compose up --build
```

- MQTT broker: `localhost:1883`
- Health check: `http://localhost:8080/health`

## Manual Run (without Docker)
1. Start MQTT (Mosquitto) and PostgreSQL locally
2. Set env:
```bash
export MQTT_BROKER=tcp://localhost:1883
export DB_DSN=postgres://postgres:postgres@localhost:5432/coupons?sslmode=disable
```
3. Run:
```bash
go mod download
go run main.go
```

## Notes
- Supports coupon types: `FLAT`, `PERCENT`
- Enforces: expiry, min order, usage limit
- Uses structured logging (logrus)
- Auto-reconnect MQTT
