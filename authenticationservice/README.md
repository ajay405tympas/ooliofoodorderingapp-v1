# Authentication Service (Go + MQTT + Docker)

## Features
- /login → initiate login
- /sendOtp → generate OTP
- /verifyOtp → validate OTP
- Publishes auth/verified on success

## 📦 Run Locally

```bash
go mod tidy
go build -o auth-service ./main.go
go run ./cmd

---

## Run with Docker
docker-compose up --build

---

## Test APIs

### Login
curl -X POST http://localhost:8082/login \
-H "Content-Type: application/json" \
-d '{"phone":"9999999999"}'

### Send OTP
curl -X POST http://localhost:8082/sendOtp \
-H "Content-Type: application/json" \
-d '{"phone":"9999999999"}'

### Verify OTP
curl -X POST http://localhost:8082/verifyOtp \
-H "Content-Type: application/json" \
-d '{"phone":"9999999999","otp":"1234"}'

---

## MQTT Topic
auth/verified

---

## Folder Structure
.
├── main.go
├── go.mod
├── Dockerfile
├── docker-compose.yml
├── README.md

---

## Notes
- Replace in-memory store with Redis/DB
- Add OTP expiry
- Secure OTP delivery (SMS/WhatsApp)
