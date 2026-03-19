package models

type Config struct {
	Stores []StoreConfig `yaml:"stores" json:"stores"`
	Redis  RedisConfig   `yaml:"redis" json:"redis"`
	MQTT   MQTTConfig    `yaml:"mqtt" json:"mqtt"`
}

type StoreConfig struct {
	StoreID  string `yaml:"storeId" json:"storeId"`
	Name     string `yaml:"name" json:"name"`
	Tax      int    `yaml:"tax" json:"tax"`
	Currency string `yaml:"currency" json:"currency"`
}

type RedisConfig struct {
	Host string `yaml:"host" json:"host"`
	Port int    `yaml:"port" json:"port"`
}

type MQTTConfig struct {
	Broker        string `yaml:"broker" json:"broker"`
	TopicResponse string `yaml:"topicResponse" json:"topicResponse"`
}
