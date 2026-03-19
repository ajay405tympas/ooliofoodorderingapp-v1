# ⚙️ Config Service (Go + MQTT + YAML + Hot Reload)

## 🚀 Overview
Config Service provides centralized configuration to all microservices via MQTT.
It supports:
- YAML-based configuration
- Hot reload (no restart)
- Git-based config sync
- Store-level configuration
- Redis & MQTT config distribution

---

## 📋 Prerequisites

Make sure the following are installed:

- Go 1.22+
- Docker
- Git
- MQTT Broker (Mosquitto)

---

## 📁 Project Structure

config-service/
├── cmd/
├── config/
├── mqtt/
├── models/
├── storage/
├── config.yaml
├── go.mod
└── Dockerfile

---

## ⚙️ Configuration File

Edit `config.yaml`:

stores:
  - storeId: "store-1"
    name: "Ajay Foods"
    tax: 5
    currency: "INR"

redis:
  host: "localhost"
  port: 6379

mqtt:
  broker: "tcp://localhost:1883"
  topicResponse: "config/response"

---

## ▶️ Build & Run

### 1. Install dependencies
go mod tidy
go build -o configservice /cmd


### 2. Run locally
go run cmd/main.go

### 3. Build binary
go build -o config-service ./cmd
./config-service

---

## 🐳 Run with Docker

### Build image
docker build -t config-service .

### Run container
docker run -p 8085:8085 config-service

---

## 📡 MQTT Setup

Start MQTT broker:

docker run -d -p 1883:1883 eclipse-mosquitto

---

## 🧪 Test Config Service

### Publish request
mosquitto_pub -t /getConfig -m '{}'

### Subscribe response
mosquitto_sub -t config/response

---

## 🔄 Hot Reload

- Modify `config.yaml`
- Changes are automatically picked up
- No restart required

---

## 🔁 Git Sync (Mock)

- Service runs `git pull` every 30 seconds
- Updates local config.yaml automatically

---

## ⚠️ Troubleshooting

### Config not updating
- Ensure file is saved (watcher triggers on write)

### MQTT not working
- Check broker is running on port 1883

### Git pull failing
- Ensure repo is initialized and has remote

---

## 🚀 Future Improvements

- Store-specific config filtering
- Redis caching
- Secure secrets (Vault)
- Versioned configs
- Admin UI

---

## 👨‍💻 Author
Ajay K
