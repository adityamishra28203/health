import { createClient, RedisClientType } from 'redis';

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  enableReadyCheck?: boolean;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
}

export class RedisCacheService {
  private client: RedisClientType;
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
    this.client = createClient({
      socket: {
        host: config.host,
        port: config.port,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            return new Error('Too many reconnection attempts');
          }
          return Math.min(retries * 100, 3000);
        },
      },
      password: config.password,
      database: config.db || 0,
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
    });

    this.client.on('ready', () => {
      console.log('Redis Client Ready');
    });

    this.client.on('end', () => {
      console.log('Redis Client Disconnected');
    });
  }

  async connect(): Promise<void> {
    if (!this.client.isReady) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.client.isReady) {
      await this.client.disconnect();
    }
  }

  async isConnected(): Promise<boolean> {
    return this.client.isReady;
  }

  // Basic operations
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    try {
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Error checking existence of key ${key}:`, error);
      return false;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, ttlSeconds);
      return result;
    } catch (error) {
      console.error(`Error setting expiry for key ${key}:`, error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error(`Error getting TTL for key ${key}:`, error);
      return -1;
    }
  }

  // JSON operations
  async getJson<T>(key: string): Promise<T | null> {
    try {
      const value = await this.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting JSON for key ${key}:`, error);
      return null;
    }
  }

  async setJson(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const jsonString = JSON.stringify(value);
      return await this.set(key, jsonString, ttlSeconds);
    } catch (error) {
      console.error(`Error setting JSON for key ${key}:`, error);
      return false;
    }
  }

  // Hash operations
  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hGet(key, field);
    } catch (error) {
      console.error(`Error getting hash field ${field} for key ${key}:`, error);
      return null;
    }
  }

  async hset(key: string, field: string, value: string): Promise<boolean> {
    try {
      const result = await this.client.hSet(key, field, value);
      return result >= 0;
    } catch (error) {
      console.error(`Error setting hash field ${field} for key ${key}:`, error);
      return false;
    }
  }

  async hgetall(key: string): Promise<Record<string, string> | null> {
    try {
      return await this.client.hGetAll(key);
    } catch (error) {
      console.error(`Error getting all hash fields for key ${key}:`, error);
      return null;
    }
  }

  async hdel(key: string, field: string): Promise<boolean> {
    try {
      const result = await this.client.hDel(key, field);
      return result > 0;
    } catch (error) {
      console.error(`Error deleting hash field ${field} for key ${key}:`, error);
      return false;
    }
  }

  // List operations
  async lpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.client.lPush(key, values);
    } catch (error) {
      console.error(`Error pushing to list ${key}:`, error);
      return 0;
    }
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.client.rPush(key, values);
    } catch (error) {
      console.error(`Error pushing to list ${key}:`, error);
      return 0;
    }
  }

  async lpop(key: string): Promise<string | null> {
    try {
      return await this.client.lPop(key);
    } catch (error) {
      console.error(`Error popping from list ${key}:`, error);
      return null;
    }
  }

  async rpop(key: string): Promise<string | null> {
    try {
      return await this.client.rPop(key);
    } catch (error) {
      console.error(`Error popping from list ${key}:`, error);
      return null;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lRange(key, start, stop);
    } catch (error) {
      console.error(`Error getting list range for ${key}:`, error);
      return [];
    }
  }

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sAdd(key, members);
    } catch (error) {
      console.error(`Error adding to set ${key}:`, error);
      return 0;
    }
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sRem(key, members);
    } catch (error) {
      console.error(`Error removing from set ${key}:`, error);
      return 0;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.sMembers(key);
    } catch (error) {
      console.error(`Error getting set members for ${key}:`, error);
      return [];
    }
  }

  async sismember(key: string, member: string): Promise<boolean> {
    try {
      return await this.client.sIsMember(key, member);
    } catch (error) {
      console.error(`Error checking set membership for ${key}:`, error);
      return false;
    }
  }

  // Pattern matching
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      console.error(`Error getting keys for pattern ${pattern}:`, error);
      return [];
    }
  }

  // Batch operations
  async mget(keys: string[]): Promise<(string | null)[]> {
    try {
      return await this.client.mGet(keys);
    } catch (error) {
      console.error(`Error getting multiple keys:`, error);
      return keys.map(() => null);
    }
  }

  async mset(keyValuePairs: Record<string, string>): Promise<boolean> {
    try {
      await this.client.mSet(keyValuePairs);
      return true;
    } catch (error) {
      console.error(`Error setting multiple keys:`, error);
      return false;
    }
  }

  // Cache-specific operations
  async cacheGet<T>(key: string): Promise<T | null> {
    const cached = await this.getJson<T>(key);
    if (cached) {
      console.log(`Cache hit for key: ${key}`);
    } else {
      console.log(`Cache miss for key: ${key}`);
    }
    return cached;
  }

  async cacheSet<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<boolean> {
    const success = await this.setJson(key, value, ttlSeconds);
    if (success) {
      console.log(`Cached value for key: ${key} with TTL: ${ttlSeconds}s`);
    }
    return success;
  }

  async cacheDelete(key: string): Promise<boolean> {
    const success = await this.del(key);
    if (success) {
      console.log(`Deleted cache for key: ${key}`);
    }
    return success;
  }

  // Session management
  async setSession(sessionId: string, sessionData: any, ttlSeconds: number = 86400): Promise<boolean> {
    const key = `session:${sessionId}`;
    return await this.setJson(key, sessionData, ttlSeconds);
  }

  async getSession<T>(sessionId: string): Promise<T | null> {
    const key = `session:${sessionId}`;
    return await this.getJson<T>(key);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const key = `session:${sessionId}`;
    return await this.del(key);
  }

  // Rate limiting
  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const windowStart = now - (windowSeconds * 1000);
    
    // Remove old entries
    await this.client.zRemRangeByScore(key, '-inf', windowStart.toString());
    
    // Count current entries
    const current = await this.client.zCard(key);
    
    if (current < limit) {
      // Add current request
      await this.client.zAdd(key, { score: now, value: now.toString() });
      await this.client.expire(key, windowSeconds);
      
      return {
        allowed: true,
        remaining: limit - current - 1,
        resetTime: now + (windowSeconds * 1000)
      };
    } else {
      // Get oldest entry to calculate reset time
      const oldest = await this.client.zRange(key, 0, 0, { withScores: true });
      const resetTime = oldest.length > 0 ? oldest[0].score + (windowSeconds * 1000) : now + (windowSeconds * 1000);
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: resetTime
      };
    }
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis ping failed:', error);
      return false;
    }
  }

  async getInfo(): Promise<any> {
    try {
      return await this.client.info();
    } catch (error) {
      console.error('Error getting Redis info:', error);
      return null;
    }
  }
}

// Cache key patterns
export const CACHE_KEYS = {
  // Patient cache
  PATIENT_PROFILE: (patientId: string) => `patient:profile:${patientId}`,
  PATIENT_DOCUMENTS: (patientId: string) => `patient:documents:${patientId}`,
  PATIENT_TIMELINE: (patientId: string) => `patient:timeline:${patientId}`,
  
  // Hospital cache
  HOSPITAL_PROFILE: (hospitalId: string) => `hospital:profile:${hospitalId}`,
  HOSPITAL_PATIENTS: (hospitalId: string) => `hospital:patients:${hospitalId}`,
  HOSPITAL_STATS: (hospitalId: string) => `hospital:stats:${hospitalId}`,
  
  // Document cache
  DOCUMENT_METADATA: (documentId: string) => `document:metadata:${documentId}`,
  DOCUMENT_HASH: (documentId: string) => `document:hash:${documentId}`,
  
  // Session cache
  USER_SESSION: (sessionId: string) => `session:${sessionId}`,
  
  // Rate limiting
  RATE_LIMIT: (userId: string, action: string) => `rate_limit:${userId}:${action}`,
  
  // Search cache
  SEARCH_RESULTS: (query: string, filters: string) => `search:${Buffer.from(query + filters).toString('base64')}`,
};

// Default cache configuration
export const defaultCacheConfig: CacheConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};


