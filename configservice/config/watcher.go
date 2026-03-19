package config

import (
	"log"

	"github.com/fsnotify/fsnotify"
)

func WatchConfig(path string) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal(err)
	}

	go func() {
		for {
			select {
			case event := <-watcher.Events:
				if event.Op&fsnotify.Write == fsnotify.Write {
					log.Println("Config updated, reloading...")
					LoadConfig(path)
				}
			case err := <-watcher.Errors:
				log.Println("Watcher error:", err)
			}
		}
	}()

	watcher.Add(path)
}
