package main

import (
	"menu-service/config"
	"menu-service/db"
	"menu-service/handlers"
	"menu-service/mqtt"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadConfig()

	db.InitDB(cfg.DBUrl)
	mqtt.InitMQTT(cfg.MQTTBroker)

	r := gin.Default()
	r.GET("/menu", handlers.GetMenu)

	r.Run(":" + cfg.Port)
}
