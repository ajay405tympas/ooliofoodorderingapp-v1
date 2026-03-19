package config

import (
	"log"
	"os"

	"config-service/models"
	"gopkg.in/yaml.v3"
)

var AppConfig models.Config

func LoadConfig(path string) {
	file, err := os.ReadFile(path)
	if err != nil {
		log.Fatal("Error reading config:", err)
	}

	err = yaml.Unmarshal(file, &AppConfig)
	if err != nil {
		log.Fatal("Error parsing YAML:", err)
	}

	log.Println("Config Loaded")
}
