# POS Selling Microservice (Go)

## Features
- Consumes order/finalized from MQTT
- Calculates total
- Stores session in Redis
- Publishes payment/initiate
- Listens to payment/confirmed
- Sends kitchen/orders

## Structure
- main.go
- Dockerfile
- go.mod

## Run locally

### Prereqs
- Go
- Redis
- PostgreSQL
- MQTT (Mosquitto)

### Run
go mod tidy
go run main.go

## Docker
docker build -t pos-service .
docker run pos-service
