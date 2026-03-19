package config

import "os"

type Config struct {
	Port       string
	DBUrl      string
	MQTTBroker string
}

func LoadConfig() *Config {
	return &Config{
		Port:       getEnv("PORT", "8082"),
		DBUrl:      getEnv("DB_URL", "postgres://postgres:postgres@db:5432/menu"),
		MQTTBroker: getEnv("MQTT_BROKER", "tcp://mqtt:1883"),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
