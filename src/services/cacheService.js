import fs from "fs";
import path from "path";
import redis from "redis";
import Memcached from "memcached";
import { cacheConfig, cacheDriver } from "~/configs/cache";
import { logger } from "~/configs/logging";

//     FILE     ---------------------------------------------------------

const filePath = path.resolve(cacheConfig.file.storagePath);

if (!fs.existsSync(filePath)) {
	fs.writeFileSync(filePath, JSON.stringify({}));
}

const fileCache = {
	get(key) {
		const cache = JSON.parse(fs.readFileSync(filePath, "utf-8"));
		if (cache[key].expiresAt < Date.now()) delete cache[key];
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
	},
};

//     REDIS     ---------------------------------------------------------

const redisClient = redis.createClient({
	username: cacheConfig.redis.username,
	password: cacheConfig.redis.password,
	host: cacheConfig.redis.host,
	port: cacheConfig.redis.port,
});

async function connectRedis() {
	if (!redisClient.isOpen) {
		await redisClient.connect();
	}
}

const redisCache = {
	async get(key) {
		await connectRedis();
		const value = await redisClient.get(key);
		return value ? JSON.parse(value) : null;
	},

	async set(key, value, ttl) {
		await connectRedis();
		await redisClient.set(key, JSON.stringify(value), { EX: ttl });
	},

	async del(key) {
		await connectRedis();
		await redisClient.del(key);
	},

	async getAll(pattern) {
		await connectRedis();

		const data = [];
		let cursor = "0";

		do {
			const reply = await redisClient.scan(cursor, {
				MATCH: pattern,
				COUNT: 100,
			});
			cursor = reply.cursor;
			data.push(...reply.keys);
		} while (cursor !== "0");

		return data;
	},
};

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
	},
};

//     CACHE     ---------------------------------------------------------

let cache = redisCache;

// switch (cacheDriver) {
// 	case "file":
// 		cache = fileCache;
// 		break;
// 	case "redis":
// 		cache = redisCache;
// 		break;
// 	case "memcached":
// 		cache = MemCache;
// 		break;
// 	default:
// 		throw new Error(`Unsupported cache driver: ${cacheDriver}`);
// }

export default cache;
