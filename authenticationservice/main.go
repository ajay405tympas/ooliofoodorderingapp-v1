package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

var client mqtt.Client
var otpStore = make(map[string]string)

type LoginRequest struct {
	Phone string `json:"phone"`
}

type OTPRequest struct {
	Phone string `json:"phone"`
}

type VerifyOTPRequest struct {
	Phone string `json:"phone"`
	OTP   string `json:"otp"`
}

func main() {
	broker := getEnv("MQTT_BROKER", "tcp://mosquitto:1883")

	opts := mqtt.NewClientOptions().AddBroker(broker)
	opts.SetClientID("auth-service")

	client = mqtt.NewClient(opts)
	if token := client.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

	http.HandleFunc("/login", loginHandler)
	http.HandleFunc("/sendOtp", sendOTPHandler)
	http.HandleFunc("/verifyOtp", verifyOTPHandler)

	log.Println("Auth service running on :8082")
	log.Fatal(http.ListenAndServe(":8082", nil))
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	json.NewDecoder(r.Body).Decode(&req)

	log.Println("Login request:", req.Phone)

	json.NewEncoder(w).Encode(map[string]string{
		"message": "OTP required",
	})
}

func sendOTPHandler(w http.ResponseWriter, r *http.Request) {
	var req OTPRequest
	json.NewDecoder(r.Body).Decode(&req)

	otp := generateOTP()
	otpStore[req.Phone] = otp

	log.Println("Generated OTP for", req.Phone, ":", otp)

	json.NewEncoder(w).Encode(map[string]string{
		"message": "OTP sent",
		"otp": otp, // for testing only
	})
}

func verifyOTPHandler(w http.ResponseWriter, r *http.Request) {
	var req VerifyOTPRequest
	json.NewDecoder(r.Body).Decode(&req)

	stored := otpStore[req.Phone]

	if stored == req.OTP {
		publishSuccess(req.Phone)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "OTP verified",
		})
	} else {
		http.Error(w, "Invalid OTP", 401)
	}
}

func publishSuccess(phone string) {
	topic := "auth/verified"

	payload := map[string]string{
		"phone": phone,
		"status": "VERIFIED",
	}

	data, _ := json.Marshal(payload)
	client.Publish(topic, 0, false, data)

	log.Println("Published auth verified:", string(data))
}

func generateOTP() string {
	rand.Seed(time.Now().UnixNano())
	return fmt.Sprintf("%04d", 1000+rand.Intn(9000))
}

func getEnv(key, fallback string) string {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	return val
}
