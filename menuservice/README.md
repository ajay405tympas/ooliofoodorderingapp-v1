# 🍽️ Menu Service (Go + PostgreSQL + MQTT)

## 🚀 Overview
Menu Service handles fetching menu from PostgreSQL and publishing results via MQTT.

---

## 📋 Prerequisites

- Go 1.22+
- Docker
- PostgreSQL (via Docker)
- MQTT Broker (Mosquitto)

---

## ⚙️ Environment Setup

Create `.env` file:

PORT=8082
DB_URL=postgres://postgres:postgres@localhost:5432/menu
MQTT_BROKER=tcp://localhost:1883

---

## 🗄️ Database Setup

### Start PostgreSQL

docker run -d -p 5432:5432 \
-e POSTGRES_PASSWORD=postgres \
-e POSTGRES_DB=menu postgres

### Run Schema

psql -U postgres -d menu -f schema.sql

---

## 📡 MQTT Setup

docker run -d -p 1883:1883 eclipse-mosquitto

---

## ▶️ Build & Run

### Local Run

go mod tidy
go build -o menu-service ./cmd
./menu-service

---

### Using Go Run

go run cmd/main.go

---

### Using Docker

docker build -t menu-service .
docker run -p 8082:8082 menu-service

---

## 🧪 Test API

curl http://localhost:8082/menu

---

## 📡 MQTT Topics

menu/response → Publishes menu data

---

## ⚠️ Troubleshooting

- Ensure PostgreSQL is running
- Ensure MQTT broker is running
- Check .env values

---

## 👨‍💻 Author
Ajay K
