const Redis = require('ioredis');
require('dotenv').config();

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('connect', () => {
  console.log('✅ Redis connection established successfully.');
});

redis.on('error', (error) => {
  console.error('❌ Redis connection error:', error);
});

// Cache utilities
const cache = {
  async get(key) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },

  async set(key, value, ttl = 300) {
    try {
      const data = JSON.stringify(value);
      await redis.set(key, data, 'EX', ttl);
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  },

  async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  },

  async increment(key, ttl = 3600) {
    try {
      await redis.incr(key);
      await redis.expire(key, ttl);
      return true;
    } catch (error) {
      console.error('Redis INCR error:', error);
      return false;
    }
  }
};

module.exports = { redis, cache };
