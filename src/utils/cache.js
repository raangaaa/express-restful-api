import fs from 'fs';
import path from 'path';
import redis from 'redis';
import Memcached from 'memcached'
import { cacheConfig, cacheDriver } from "../../configs/cache";

//     FILE     ---------------------------------------------------------

const filePath = path.resolve(cacheConfig.file.storagePath);

if (!fs.existsSync(filePath)) {
	fs.writeFileSync(filePath, JSON.stringify({}));
}

const fileCache = {
    get(key) {
        const cache = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        return cache[key] ?? null;
    },
    
    set(key, value, ttl) {
        const cache = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        cache[key] = { value, expiresAt: Date.now() + ttl * 1000 };
        fs.writeFileSync(filePath, JSON.stringify(cache));
    },
    
    del(key) {
        const cache = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        delete cache[key];
        fs.writeFileSync(filePath, JSON.stringify(cache));
    }
}

//     REDIS     ---------------------------------------------------------

const redisClient = redis.createClient({
    username: cacheConfig.redis.username,
    password: cacheConfig.redis.password,
    host: cacheConfig.redis.host,
    port: cacheConfig.redis.port,
});

redisClient.connect();


const redisCache = {
    async get(key) {
        const value = await redisClient.get(key);
        return value ? JSON.parse(value) : null;
    },

    async set(key, value, ttl) {
        await redisClient.set(key, JSON.stringify(value), { EX: ttl });
    },

    async del(key) {
        await redisClient.del(key);
    }
}

//     MEMCACHED     ---------------------------------------------------------

const MemcachedClient = new Memcached(
	`${cacheConfig.memcached.host}:${cacheConfig.memcached.port}`
);

const MemCache = {
    get(key) {
        return new Promise((resolve, reject) => {
            MemcachedClient.get(key, (err, data) => {
                if (err) reject(err);
                else resolve(data ? JSON.parse(data) : null);
            });
        });
    },

    set(key, value, ttl) {
        return new Promise((resolve, reject) => {
            MemcachedClient.set(key, JSON.stringify(value), ttl, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    del(key) {
        return new Promise((resolve, reject) => {
            MemcachedClient.del(key, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

//     CACHE     ---------------------------------------------------------

let cache;

switch (cacheDriver) {
	case "file":
		cache = fileCache;
		break;
	case "redis":
		cache = redisCache;
		break;
	case "memcached":
		cache = MemCache;
		break;
	default:
		throw new Error(`Unsupported cache driver: ${cacheDriver}`);
}

export default cache;
