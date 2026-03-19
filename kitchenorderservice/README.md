
# Kitchen Order Service (Go + Docker)

## Features
- Subscribe: /paymentCompleted (HTTP simulation)
- Generate KOT (text file)
- Publish: /kitchenOrderCompleted (logs)

---

## Run Locally
go run main.go
go build -o kotService ./main.go

---

## Run with Docker
docker build -t kitchen-service .
docker run -p 8080:8080 kitchen-service

---

## Test API
curl -X POST http://localhost:8080/paymentCompleted \
-H "Content-Type: application/json" \
-d '{
  "orderId":"200",
  "items":["Dosa","Coffee"],
  "total":120
}'

---

## Output
- kot_200.txt generated
- Logs event published

---

## Folder Structure
.
├── main.go
├── Dockerfile
├── README.md

---

## Notes
- Replace logs with Kafka/MQTT
- Integrate real printer (ESC/POS)
