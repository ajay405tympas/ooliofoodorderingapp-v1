package storage

import (
	"log"
	"os/exec"
)

func PullLatestConfig() {
	cmd := exec.Command("git", "pull")
	err := cmd.Run()
	if err != nil {
		log.Println("Git pull failed:", err)
	} else {
		log.Println("Config updated from Git")
	}
}
