import env from "~/configs/env"

// Configuration for cache system

export const cacheDriver = env.CACHE_DRIVER ?? "file";

export const cacheConfig = {
	file: {
		driver: "file",
		storagePath: "storages/cache/cache.json",
	},
    
	redis: {
		driver: "redis",
		mode: "standalone",
		username: env.REDIS_USERNAME,
		password: env.REDIS_PASSWORD,
		host: env.REDIS_HOST,
		port: env.REDIS_PORT,
	},

	memcached: {
		driver: "memcached",
		username: env.MEMCACHED_USERNAME,
		password: env.MEMCACHED_PASSWORD,
		host: env.MEMCACHED_HOST,
		port: env.MEMCACHED_PORT,
	},
};