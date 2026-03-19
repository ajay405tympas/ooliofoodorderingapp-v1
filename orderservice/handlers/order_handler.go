package handlers

import (
	"encoding/json"
	"net/http"
	"order-service/mqtt"

	"github.com/gin-gonic/gin"
)

type Order struct {
	OrderID string `json:"orderId"`
	UserID  string `json:"userId"`
	Items   []string `json:"items"`
}

func validateOrder(o Order) bool {
	return o.OrderID != "" && o.UserID != "" && len(o.Items) > 0
}

func PlaceOrder(c *gin.Context) {
	var order Order

	if err := c.BindJSON(&order); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if !validateOrder(order) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order"})
		return
	}

	data, _ := json.Marshal(order)
	mqtt.Publish("/orderFinalized", data)

	c.JSON(http.StatusOK, gin.H{"status": "order placed"})
}

func TrackOrder(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{"orderId": id, "status": "processing"})
}
