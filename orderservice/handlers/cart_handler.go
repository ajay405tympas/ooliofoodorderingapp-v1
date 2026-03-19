package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func AddToCart(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"msg": "item added"})
}

func UpdateCart(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"msg": "cart updated"})
}

func RemoveItem(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"msg": "item removed"})
}

func GetCart(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"cart": []string{}})
}

func ClearCart(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"msg": "cart cleared"})
}
