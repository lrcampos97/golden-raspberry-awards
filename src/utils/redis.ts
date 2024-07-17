import Redis from 'ioredis';

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});

export const getCache = async (key: string): Promise<string | null> => {
  return await redis.get(key);
};

export const setCache = async (key: string, value: string): Promise<void> => {
  await redis.set(key, value, 'EX', 1800); // 30 minutes
};

export const clearCache = async (key: string): Promise<void> => {
  await redis.del(key);
};
