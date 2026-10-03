import { createClient } from "redis";

let redisClient;

export const getRedisClient = async () => {
    if (!redisClient) {
        redisClient = createClient({
            url: process.env.REDIS_URL || "redis://localhost:6379",
            socket: process.env.REDIS_TLS === "true" ? { tls: true } : undefined,
        });

        redisClient.on("error", (error) => {
            console.error("Redis client error:", error.message);
        });

        await redisClient.connect();
    }

    if (!redisClient.isReady) {
        throw new Error("Redis is not ready");
    }

    return redisClient;
};

export const closeRedis = async () => {
    if (redisClient?.isOpen) {
        await redisClient.quit();
    }
};
