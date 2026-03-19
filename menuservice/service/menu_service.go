package service

import "menu-service/repository"

func FetchMenu() (interface{}, error) {
	return repository.GetMenu()
}
