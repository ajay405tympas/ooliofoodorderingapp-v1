
# Outbound Service (Golang)

## Overview
This service subscribes to MQTT topics `/outbound/XXXX` and sends responses to mobile UI clients via HTTP.

## Features
- Mock MQTT subscription
- HTTP health endpoint
- Dockerized

## Run Locally
```bash
go mod init outbound-service
go mod tidy
go run main.go
```

## Build Docker Image
```bash
docker build -t outbound-service:1.0 .
```

## Run Container
```bash
docker run -p 8080:8080 outbound-service:1.0
```

## Test API
```bash
curl http://localhost:8080/health
```

## Folder Structure
```
.
├── main.go
├── mqtt.go
├── Dockerfile
└── README.md
```
