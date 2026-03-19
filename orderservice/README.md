# Order Service (Go + MQTT)

## APIs

POST /cart/add  
PUT /cart/update  
DELETE /cart/remove  
GET /cart  
DELETE /cart/clear  

POST /order  
GET /order/{orderId}  

## Features

- Order validation
- MQTT publish (/orderFinalized)
- Cart APIs

## Run

go mod tidy
go run cmd/main.go

## Docker

docker build -t order-service .
docker run -p 8083:8083 order-service

## Test

curl -X POST http://localhost:8083/order -d '{"orderId":"1","userId":"u1","items":["burger"]}' -H "Content-Type: application/json"

## MQTT

Topic: /orderFinalized
