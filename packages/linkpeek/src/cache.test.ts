import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LRUCache } from './cache';
import type { LinkPreview } from './types';

function makePreview(url: string, overrides?: Partial<LinkPreview>): LinkPreview {
  return { url, title: `Title for ${url}`, ...overrides };
}

describe('LRUCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Basic get / set ──────────────────────────────────────────────────

  describe('setting and getting values', () => {
    it('returns undefined for a missing key', () => {
      const cache = new LRUCache();
      expect(cache.get('missing')).toBeUndefined();
    });

    it('stores and retrieves a value', () => {
      const cache = new LRUCache();
      const preview = makePreview('https://example.com');
      cache.set('https://example.com', preview);
      expect(cache.get('https://example.com')).toEqual(preview);
    });

    it('overwrites an existing key', () => {
      const cache = new LRUCache();
      const first = makePreview('https://example.com', { title: 'First' });
      const second = makePreview('https://example.com', { title: 'Second' });
      cache.set('https://example.com', first);
      cache.set('https://example.com', second);
      expect(cache.get('https://example.com')).toEqual(second);
    });
  });

  // ── TTL expiration ───────────────────────────────────────────────────

  describe('TTL expiration', () => {
    it('returns value before TTL expires', () => {
      const cache = new LRUCache({ ttlMs: 10_000 });
      const preview = makePreview('https://example.com');
      cache.set('https://example.com', preview);

      vi.advanceTimersByTime(9_999);
      expect(cache.get('https://example.com')).toEqual(preview);
    });

    it('returns undefined after TTL expires', () => {
      const cache = new LRUCache({ ttlMs: 10_000 });
      const preview = makePreview('https://example.com');
      cache.set('https://example.com', preview);

      vi.advanceTimersByTime(10_001);
      expect(cache.get('https://example.com')).toBeUndefined();
    });

    it('has() returns false after TTL expires', () => {
      const cache = new LRUCache({ ttlMs: 5_000 });
      cache.set('key', makePreview('https://example.com'));

      vi.advanceTimersByTime(5_001);
      expect(cache.has('key')).toBe(false);
    });
  });

  // ── Max size / LRU eviction ──────────────────────────────────────────

  describe('max size eviction (LRU order)', () => {
    it('evicts the least recently used entry when capacity is reached', () => {
      const cache = new LRUCache({ max: 3 });

      cache.set('a', makePreview('a'));
      cache.set('b', makePreview('b'));
      cache.set('c', makePreview('c'));

      // All three should be present
      expect(cache.get('a')).toBeDefined();
      expect(cache.get('b')).toBeDefined();
      expect(cache.get('c')).toBeDefined();

      // Adding a fourth should evict 'a' (oldest access, since get('a') was called first)
      // But we accessed a, b, c in order above, so 'a' was accessed first.
      // After the gets above, access order is a < b < c. Now add 'd'.
      cache.set('d', makePreview('d'));

      // 'a' was accessed earliest among the three, so it gets evicted
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBeDefined();
      expect(cache.get('c')).toBeDefined();
      expect(cache.get('d')).toBeDefined();
    });

    it('accessing an entry promotes it, protecting it from eviction', () => {
      const cache = new LRUCache({ max: 3 });

      cache.set('a', makePreview('a'));
      cache.set('b', makePreview('b'));
      cache.set('c', makePreview('c'));

      // Access 'a' to promote it – now 'b' is the LRU entry
      cache.get('a');

      cache.set('d', makePreview('d'));

      expect(cache.get('a')).toBeDefined(); // promoted, survives
      expect(cache.get('b')).toBeUndefined(); // evicted as LRU
      expect(cache.get('c')).toBeDefined();
      expect(cache.get('d')).toBeDefined();
    });
  });

  // ── Failure entries use short TTL ────────────────────────────────────

  describe('failure entries use short TTL (5 minutes)', () => {
    it('failure entry expires after 5 minutes', () => {
      const cache = new LRUCache({ ttlMs: 24 * 60 * 60 * 1000 });
      const failPreview = makePreview('https://fail.com', {
        error: { code: 'TIMEOUT', message: 'Request timed out' },
      });

      cache.set('https://fail.com', failPreview, true);

      // Still available just before 5 minutes
      vi.advanceTimersByTime(5 * 60 * 1000 - 1);
      expect(cache.get('https://fail.com')).toEqual(failPreview);

      // Gone after 5 minutes
      vi.advanceTimersByTime(2);
      expect(cache.get('https://fail.com')).toBeUndefined();
    });

    it('success entry lives much longer than failure entry', () => {
      const cache = new LRUCache({ ttlMs: 24 * 60 * 60 * 1000 });

      cache.set('success', makePreview('success'));
      cache.set('failure', makePreview('failure', {
        error: { code: 'ERR', message: 'fail' },
      }), true);

      // After 6 minutes, failure is gone but success remains
      vi.advanceTimersByTime(6 * 60 * 1000);
      expect(cache.get('success')).toBeDefined();
      expect(cache.get('failure')).toBeUndefined();
    });
  });

  // ── getStats ─────────────────────────────────────────────────────────

  describe('getStats returns correct hit/miss counts', () => {
    it('reports size, hits, and misses accurately', () => {
      const cache = new LRUCache();
      cache.set('a', makePreview('a'));
      cache.set('b', makePreview('b'));

      cache.get('a'); // hit
      cache.get('a'); // hit
      cache.get('b'); // hit
      cache.get('missing'); // miss

      const stats = cache.getStats();
      expect(stats.size).toBe(2);
      expect(stats.hits).toBe(3);
      expect(stats.misses).toBe(1);
    });

    it('prunes expired entries before reporting size', () => {
      const cache = new LRUCache({ ttlMs: 1_000 });
      cache.set('a', makePreview('a'));
      cache.set('b', makePreview('b'));

      vi.advanceTimersByTime(2_000);

      const stats = cache.getStats();
      expect(stats.size).toBe(0);
    });
  });

  // ── clear() ──────────────────────────────────────────────────────────

  describe('clear()', () => {
    it('removes all entries and resets stats', () => {
      const cache = new LRUCache();
      cache.set('a', makePreview('a'));
      cache.set('b', makePreview('b'));
      cache.get('a'); // hit
      cache.get('missing'); // miss

      cache.clear();

      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBeUndefined();

      const stats = cache.getStats();
      expect(stats.size).toBe(0);
      expect(stats.hits).toBe(0);
      // After clear, the two get() calls above register as misses on
      // the fresh counters
      expect(stats.misses).toBe(2);
    });
  });
});
