import fs from "fs";
import path from "path";
import redis from "redis";
import Memcached from "memcached";
import { cacheConfig, cacheDriver } from "../../configs/cache.js";

//     FILE     ---------------------------------------------------------

const filePath = path.resolve("../../" + cacheConfig.file.storagePath);

if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}));
}

const fileCache = {
    /**
     * Retrieve data from the File cache.
     * @param {String} key - The key to retrieve data for.
     * @returns {Promise<Object|null>} - Parsed object data from the cache, or null if the key does not exist.
     */
    get(key) {
        const cache = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        if (cache[key].expiresAt < Date.now()) delete cache[key];
        return cache[key] ?? null;
    },

    /**
     * Store data in the File cache with a specified time-to-live (TTL).
     * @param {String} key - The key under which the data will be stored.
     * @param {Object} value - The value to store in the cache.
     * @param {Number} ttl - Time-to-live for the cache in seconds.
     * @returns {Promise<void>}
     */
    set(key, value, ttl) {
        const cache = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        cache[key] = { value, expiresAt: Date.now() + ttl * 1000 };
        fs.writeFileSync(filePath, JSON.stringify(cache));
    },

    /**
     * Delete a key-value pair from the File cache.
     * @param {String} key - The key to delete from the cache.
     * @returns {Promise<void>}
     */
    del(key) {
        const cache = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        delete cache[key];
        fs.writeFileSync(filePath, JSON.stringify(cache));
    }
};

//     REDIS     ---------------------------------------------------------

export const redisClient = redis.createClient({
    username: cacheConfig.redis.username,
    password: cacheConfig.redis.password,
    host: cacheConfig.redis.host,
    port: cacheConfig.redis.port
});

async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
}

const redisCache = {
    /**
     * Retrieve data from the Redis cache.
     * @async
     * @param {String} key - The key to retrieve data for.
     * @returns {Promise<Object|null>} - Parsed object data from the cache, or null if the key does not exist.
     */
    async get(key) {
        await connectRedis();
        const value = await redisClient.get(key);
        return value ? JSON.parse(value) : null;
    },

    /**
     * Store data in the Redis cache with a specified time-to-live (TTL).
     * @async
     * @param {String} key - The key under which the data will be stored.
     * @param {Object} value - The value to store in the cache.
     * @param {Number} ttl - Time-to-live for the cache in seconds.
     * @returns {Promise<void>}
     */
    async set(key, value, ttl) {
        await connectRedis();
        await redisClient.set(key, JSON.stringify(value), { EX: ttl });
    },

    /**
     * Delete a key-value pair from the Redis cache.
     * @async
     * @param {String} key - The key to delete from the cache.
     * @returns {Promise<void>}
     */
    async del(key) {
        await connectRedis();
        await redisClient.del(key);
    },

    /**
     * Retrieve all data matching a given pattern from the Redis cache.
     * @async
     * @param {String} pattern - The pattern to match keys against (e.g., "user:*").
     * @returns {Promise<Object[]>} - An array of parsed objects matching the pattern.
     */
    async getAll(pattern) {
        await connectRedis();

        const data = [];
        let cursor = "0";

        do {
            const reply = await redisClient.scan(cursor, {
                MATCH: pattern,
                COUNT: 100
            });
            cursor = reply.cursor;

            for (const key of reply.keys) {
                const value = await redisClient.get(key);
                data.push(JSON.parse(value));
            }
        } while (cursor !== "0");

        return data;
    }
};

//     MEMCACHED     ---------------------------------------------------------

const MemcachedClient = new Memcached(`${cacheConfig.memcached.host}:${cacheConfig.memcached.port}`);

const MemCache = {
    /**
     * Retrieve data from the Memcached cache.
     * @param {String} key - The key to retrieve data for.
     * @returns {Promise<Object|null>} - Parsed object data from the cache, or null if the key does not exist.
     */
    get(key) {
        return new Promise((resolve, reject) => {
            MemcachedClient.get(key, (err, data) => {
                if (err) reject(err);
                else resolve(data ? JSON.parse(data) : null);
            });
        });
    },

    /**
     * Store data in the Memcached cache with a specified time-to-live (TTL).
     * @param {String} key - The key under which the data will be stored.
     * @param {Object} value - The value to store in the cache.
     * @param {Number} ttl - Time-to-live for the cache in seconds.
     * @returns {Promise<void>}
     */
    set(key, value, ttl) {
        return new Promise((resolve, reject) => {
            MemcachedClient.set(key, JSON.stringify(value), ttl, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    /**
     * Delete a key-value pair from the Memcached cache.
     * @param {String} key - The key to delete from the cache.
     * @returns {Promise<void>}
     */
    del(key) {
        return new Promise((resolve, reject) => {
            MemcachedClient.del(key, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
};

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
