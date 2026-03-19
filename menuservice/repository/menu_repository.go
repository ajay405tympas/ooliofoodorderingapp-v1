package repository

import (
	"context"
	"menu-service/db"
	"menu-service/models"
)

func GetMenu() ([]models.MenuItem, error) {
	rows, err := db.DB.Query(context.Background(), "SELECT id, name, price FROM menu")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var menu []models.MenuItem
	for rows.Next() {
		var item models.MenuItem
		rows.Scan(&item.ID, &item.Name, &item.Price)
		menu = append(menu, item)
	}

	return menu, nil
}
