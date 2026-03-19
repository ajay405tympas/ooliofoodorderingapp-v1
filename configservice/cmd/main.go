package main

import (
	"log"
	"time"

	"config-service/config"
	"config-service/mqtt"
	"config-service/storage"
)

func main() {
	configPath := "config.yaml"

	config.LoadConfig(configPath)
	config.WatchConfig(configPath)

	mqtt.Init(config.AppConfig.MQTT.Broker)

	go func() {
		for {
			time.Sleep(50 * time.Second)
			storage.PullLatestConfig()
		}
	}()

	//Just checking teh comment.
	log.Println("Config Service running...")
	select {}
}
