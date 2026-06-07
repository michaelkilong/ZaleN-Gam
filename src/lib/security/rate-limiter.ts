import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const memoryStore = new Map<string, { count: number; resetTime: number }>();

export async function rateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const key = `rate_limit:${identifier}`;

  if (redis) {
    const current = await redis.get<{ count: number; resetTime: number }>(key);

    if (!current || now > current.resetTime) {
      const resetTime = now + windowMs;
      await redis.set(key, { count: 1, resetTime }, { px: windowMs });
      return { allowed: true, remaining: limit - 1, resetTime };
    }

    if (current.count >= limit) {
      return { allowed: false, remaining: 0, resetTime: current.resetTime };
    }

    await redis.set(key, { count: current.count + 1, resetTime: current.resetTime }, { px: windowMs });
    return { 
      allowed: true, 
      remaining: limit - current.count - 1, 
      resetTime: current.resetTime 
    };
  }

  // Memory fallback
  const current = memoryStore.get(key);

  if (!current || now > current.resetTime) {
    const resetTime = now + windowMs;
    memoryStore.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: limit - 1, resetTime };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }

  current.count += 1;
  return { allowed: true, remaining: limit - current.count, resetTime: current.resetTime };
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || 'unknown';
}
