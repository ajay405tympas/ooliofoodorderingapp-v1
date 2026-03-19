package redisclient

import (
	"context"
	"log"

	"github.com/redis/go-redis/v9"
)

var Ctx = context.Background()

type RedisClient struct {
	Client *redis.Client
}

func NewRedisClient(addr string) *RedisClient {
	rdb := redis.NewClient(&redis.Options{
		Addr: addr,
	})

	_, err := rdb.Ping(Ctx).Result()
	if err != nil {
		log.Fatal("Redis connection failed:", err)
	}

	return &RedisClient{Client: rdb}
}

func (r *RedisClient) Set(key string, value string) {
	r.Client.Set(Ctx, key, value, 0)
}

func (r *RedisClient) Get(key string) string {
	val, _ := r.Client.Get(Ctx).Result()
	return val
}
