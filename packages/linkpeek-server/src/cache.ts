import type { CacheStats, LinkPreview } from './types';

interface CacheEntry {
  value: LinkPreview;
  expiresAt: number;
  /** Insertion order key for LRU tracking */
  accessOrder: number;
}

const DEFAULT_SUCCESS_TTL = 24 * 60 * 60 * 1000; // 24 hours
const FAILURE_TTL = 5 * 60 * 1000; // 5 minutes

export class LRUCache {
  private map = new Map<string, CacheEntry>();
  private maxSize: number;
  private successTtl: number;
  private accessCounter = 0;
  private hits = 0;
  private misses = 0;

  constructor(options?: { max?: number; ttlMs?: number }) {
    this.maxSize = options?.max ?? 100;
    this.successTtl = options?.ttlMs ?? DEFAULT_SUCCESS_TTL;
  }

  get(key: string): LinkPreview | undefined {
    const entry = this.map.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      this.misses++;
      return undefined;
    }

    // Update access order (mark as recently used)
    entry.accessOrder = ++this.accessCounter;
    this.hits++;
    return entry.value;
  }

  set(key: string, value: LinkPreview, isFailure = false): void {
    const ttl = isFailure ? FAILURE_TTL : this.successTtl;
    const expiresAt = Date.now() + ttl;

    // If key already exists, just update it
    if (this.map.has(key)) {
      this.map.set(key, {
        value,
        expiresAt,
        accessOrder: ++this.accessCounter,
      });
      return;
    }

    // Evict LRU entry if at capacity
    if (this.map.size >= this.maxSize) {
      this.evictLRU();
    }

    this.map.set(key, {
      value,
      expiresAt,
      accessOrder: ++this.accessCounter,
    });
  }

  has(key: string): boolean {
    const entry = this.map.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return false;
    }
    return true;
  }

  clear(): void {
    this.map.clear();
    this.hits = 0;
    this.misses = 0;
    this.accessCounter = 0;
  }

  getStats(): CacheStats {
    // Prune expired before reporting size
    this.pruneExpired();
    return {
      size: this.map.size,
      hits: this.hits,
      misses: this.misses,
    };
  }

  private evictLRU(): void {
    let oldestKey: string | undefined;
    let oldestOrder = Infinity;

    for (const [key, entry] of this.map) {
      // Also opportunistically remove expired entries
      if (Date.now() > entry.expiresAt) {
        this.map.delete(key);
        return; // Freed a slot, no need to evict a live entry
      }
      if (entry.accessOrder < oldestOrder) {
        oldestOrder = entry.accessOrder;
        oldestKey = key;
      }
    }

    if (oldestKey !== undefined) {
      this.map.delete(oldestKey);
    }
  }

  private pruneExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.map) {
      if (now > entry.expiresAt) {
        this.map.delete(key);
      }
    }
  }
}
