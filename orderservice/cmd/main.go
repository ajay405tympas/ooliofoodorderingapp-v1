package main

import (
	"order-service/handlers"
	"order-service/mqtt"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	mqtt.Init("tcp://localhost:1883")

	r.POST("/cart/add", handlers.AddToCart)
	r.PUT("/cart/update", handlers.UpdateCart)
	r.DELETE("/cart/remove", handlers.RemoveItem)
	r.GET("/cart", handlers.GetCart)
	r.DELETE("/cart/clear", handlers.ClearCart)

	r.POST("/order", handlers.PlaceOrder)
	r.GET("/order/:id", handlers.TrackOrder)

	r.Run(":8083")
}
