/**
 * SSRF (Server-Side Request Forgery) Protection
 *
 * This module prevents attackers from using the link preview service
 * to probe internal networks, cloud metadata endpoints, or other
 * private resources. All URL and IP validation MUST happen before
 * any network request is made.
 */

import dns from 'node:dns';

// ─── URL Validation ──────────────────────────────────────────────────────────

/**
 * Validates a raw URL string for basic safety before any network access.
 *
 * SECURITY: This is the first line of defense. It checks:
 *  - Only http/https protocols are allowed (no file://, ftp://, etc.)
 *  - No embedded credentials (user:pass@host is a common SSRF trick)
 *  - The URL is parseable
 *  - The hostname is not "localhost" or similar loopback names
 */
export function validateUrl(rawUrl: string): { valid: boolean; reason?: string } {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }

  // SECURITY: Only allow http and https protocols.
  // Allowing other protocols (file://, ftp://, gopher://, data:, etc.)
  // could lead to local file reads or protocol smuggling.
  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== 'http:' && protocol !== 'https:') {
    return { valid: false, reason: `Disallowed protocol: ${parsed.protocol}` };
  }

  // SECURITY: Reject URLs with embedded credentials.
  // URLs like http://user:pass@evil.com can be used to bypass naive
  // hostname checks or leak credentials.
  if (parsed.username || parsed.password) {
    return { valid: false, reason: 'URLs with credentials are not allowed' };
  }

  // SECURITY: Block well-known loopback/local hostnames.
  const hostname = parsed.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname === 'localhost.localdomain') {
    return { valid: false, reason: 'Localhost is not allowed' };
  }

  // Reject empty hostname
  if (!hostname) {
    return { valid: false, reason: 'Empty hostname' };
  }

  return { valid: true };
}

// ─── Private IP Detection ────────────────────────────────────────────────────

/**
 * Checks whether an IP address belongs to a private/reserved range.
 *
 * SECURITY: This MUST be checked after DNS resolution to catch DNS rebinding
 * attacks where a public hostname resolves to a private IP.
 *
 * Blocked ranges:
 *  IPv4:
 *   - 0.0.0.0          (unspecified / "this network")
 *   - 127.0.0.0/8      (loopback)
 *   - 10.0.0.0/8       (RFC 1918 private)
 *   - 172.16.0.0/12    (RFC 1918 private)
 *   - 192.168.0.0/16   (RFC 1918 private)
 *   - 169.254.0.0/16   (link-local / APIPA)
 *  IPv6:
 *   - ::               (unspecified)
 *   - ::1              (loopback)
 *   - fc00::/7         (unique local, includes fd00::/8)
 *   - fe80::/10        (link-local)
 */
export function isPrivateIp(ip: string): boolean {
  // ── IPv4 ───────────────────────────────────────────────────────────
  if (ip.includes('.') && !ip.includes(':')) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      // Malformed IPv4 -- treat as private to be safe
      return true;
    }

    const [a, b] = parts;

    // 0.0.0.0 - unspecified address
    if (ip === '0.0.0.0') return true;

    // 127.0.0.0/8 - loopback
    if (a === 127) return true;

    // 10.0.0.0/8 - private
    if (a === 10) return true;

    // 172.16.0.0/12 - private (172.16.x.x through 172.31.x.x)
    if (a === 172 && b >= 16 && b <= 31) return true;

    // 192.168.0.0/16 - private
    if (a === 192 && b === 168) return true;

    // 169.254.0.0/16 - link-local
    if (a === 169 && b === 254) return true;

    return false;
  }

  // ── IPv6 ───────────────────────────────────────────────────────────
  // Normalize the IPv6 address to a full lowercase representation
  const normalized = normalizeIpv6(ip);

  // :: (unspecified)
  if (normalized === '0000:0000:0000:0000:0000:0000:0000:0000') return true;

  // ::1 (loopback)
  if (normalized === '0000:0000:0000:0000:0000:0000:0000:0001') return true;

  // fc00::/7 - unique local addresses (fc00:: and fd00::)
  // First byte: 0xfc (1111 1100) or 0xfd (1111 1101)
  const firstWord = parseInt(normalized.substring(0, 4), 16);
  if ((firstWord & 0xfe00) === 0xfc00) return true;

  // fe80::/10 - link-local
  // First 10 bits: 1111 1110 10 => fe80 through febf
  if ((firstWord & 0xffc0) === 0xfe80) return true;

  // Check for IPv4-mapped IPv6 (::ffff:a.b.c.d)
  if (normalized.startsWith('0000:0000:0000:0000:0000:ffff:')) {
    const ipv4Hex = normalized.slice(30); // last two groups: "xxxx:xxxx"
    const [hi, lo] = ipv4Hex.split(':');
    const a = parseInt(hi.substring(0, 2), 16);
    const b = parseInt(hi.substring(2, 4), 16);
    const c = parseInt(lo.substring(0, 2), 16);
    const d = parseInt(lo.substring(2, 4), 16);
    return isPrivateIp(`${a}.${b}.${c}.${d}`);
  }

  return false;
}

/**
 * Expands an IPv6 address to its full 8-group, zero-padded form.
 * Example: "::1" -> "0000:0000:0000:0000:0000:0000:0000:0001"
 */
function normalizeIpv6(ip: string): string {
  // Remove any zone ID (e.g., %eth0)
  const raw = ip.split('%')[0].toLowerCase();

  let parts: string[];
  if (raw.includes('::')) {
    const [left, right] = raw.split('::');
    const leftParts = left ? left.split(':') : [];
    const rightParts = right ? right.split(':') : [];
    const missing = 8 - leftParts.length - rightParts.length;
    const middle = Array(missing).fill('0');
    parts = [...leftParts, ...middle, ...rightParts];
  } else {
    parts = raw.split(':');
  }

  return parts.map((p) => p.padStart(4, '0')).join(':');
}

// ─── DNS Resolution Check ────────────────────────────────────────────────────

/**
 * Resolves a hostname via DNS and validates that it does not point to a
 * private/internal IP address.
 *
 * SECURITY: DNS resolution MUST be validated because attackers can set up
 * domains that resolve to internal IPs (DNS rebinding). This check must
 * happen for every request -- caching DNS results could miss rebinding.
 */
export async function validateResolvedIp(
  hostname: string,
): Promise<{ valid: boolean; reason?: string }> {
  try {
    const { address } = await dns.promises.lookup(hostname);

    if (isPrivateIp(address)) {
      // SECURITY: Do not reveal the resolved IP in the error message
      // to avoid leaking internal network topology information.
      return {
        valid: false,
        reason: 'Hostname resolves to a private/reserved IP address',
      };
    }

    return { valid: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown DNS error';
    return { valid: false, reason: `DNS resolution failed: ${message}` };
  }
}
