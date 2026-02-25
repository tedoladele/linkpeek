import dns from 'node:dns';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { validateUrl, isPrivateIp, validateResolvedIp } from './ssrf';

describe('validateUrl', () => {
  it('accepts a valid HTTP URL', () => {
    expect(validateUrl('http://example.com')).toEqual({ valid: true });
  });

  it('accepts a valid HTTPS URL', () => {
    expect(validateUrl('https://example.com')).toEqual({ valid: true });
  });

  it('rejects an FTP URL', () => {
    const result = validateUrl('ftp://example.com/file');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/protocol/i);
  });

  it('rejects a file:// URL', () => {
    const result = validateUrl('file:///etc/passwd');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/protocol/i);
  });

  it('rejects a javascript: URL', () => {
    const result = validateUrl('javascript:alert(1)');
    expect(result.valid).toBe(false);
  });

  it('rejects a URL with username:password credentials', () => {
    const result = validateUrl('https://user:pass@example.com');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/credentials/i);
  });

  it('rejects a localhost URL', () => {
    const result = validateUrl('http://localhost:3000');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/localhost/i);
  });

  it('rejects a URL with no protocol (unparseable)', () => {
    const result = validateUrl('not-a-url');
    expect(result.valid).toBe(false);
  });
});

describe('isPrivateIp', () => {
  // ── IPv4 private ranges ──────────────────────────────────────────────

  describe('IPv4', () => {
    const privateCases: [string, boolean][] = [
      // Loopback
      ['127.0.0.1', true],
      ['127.0.0.2', true],

      // 10.0.0.0/8
      ['10.0.0.1', true],
      ['10.255.255.255', true],

      // 172.16.0.0/12
      ['172.16.0.1', true],
      ['172.31.255.255', true],
      ['172.15.0.1', false],  // just below the range
      ['172.32.0.1', false],  // just above the range

      // 192.168.0.0/16
      ['192.168.0.1', true],
      ['192.168.255.255', true],

      // Link-local
      ['169.254.1.1', true],

      // Unspecified
      ['0.0.0.0', true],

      // Public addresses
      ['8.8.8.8', false],
      ['1.1.1.1', false],
      ['93.184.216.34', false],
    ];

    it.each(privateCases)('%s -> %s', (ip, expected) => {
      expect(isPrivateIp(ip)).toBe(expected);
    });
  });

  // ── IPv6 ranges ──────────────────────────────────────────────────────

  describe('IPv6', () => {
    const ipv6Cases: [string, boolean][] = [
      // Loopback
      ['::1', true],

      // Unspecified
      ['::', true],

      // Unique local (fc00::/7)
      ['fc00::1', true],

      // Link-local (fe80::/10)
      ['fe80::1', true],

      // Public (Google DNS)
      ['2001:4860:4860::8888', false],
    ];

    it.each(ipv6Cases)('%s -> %s', (ip, expected) => {
      expect(isPrivateIp(ip)).toBe(expected);
    });
  });
});

describe('validateResolvedIp', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects hostnames when any DNS answer is private', async () => {
    vi.spyOn(dns.promises, 'lookup').mockResolvedValueOnce([
      { address: '93.184.216.34', family: 4 },
      { address: '127.0.0.1', family: 4 },
    ] as dns.LookupAddress[]);

    const result = await validateResolvedIp('example.com');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/private|reserved/i);
  });

  it('accepts hostnames when all DNS answers are public', async () => {
    vi.spyOn(dns.promises, 'lookup').mockResolvedValueOnce([
      { address: '93.184.216.34', family: 4 },
      { address: '2606:2800:220:1:248:1893:25c8:1946', family: 6 },
    ] as dns.LookupAddress[]);

    const result = await validateResolvedIp('example.com');
    expect(result).toEqual({ valid: true });
  });
});
