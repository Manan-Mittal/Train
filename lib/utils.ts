import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, unknown>({ max: 200, ttl: 1000 * 30 });

export async function withRetry<T>(fn: () => Promise<T>, retries = 3, baseDelayMs = 300): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      if (attempt > retries) throw error;
      const jitter = Math.floor(Math.random() * 100);
      const delay = baseDelayMs * 2 ** (attempt - 1) + jitter;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export async function cached<T>(key: string, getter: () => Promise<T>): Promise<T> {
  const existing = cache.get(key) as T | undefined;
  if (existing) return existing;
  const value = await getter();
  cache.set(key, value);
  return value;
}
