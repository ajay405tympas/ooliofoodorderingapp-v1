package handlers

import (
	"net/http"
	"menu-service/mqtt"
	"menu-service/service"

	"github.com/gin-gonic/gin"
)

func GetMenu(c *gin.Context) {
	menu, err := service.FetchMenu()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	mqtt.Publish("menu/response", menu)
	c.JSON(http.StatusOK, menu)
}
