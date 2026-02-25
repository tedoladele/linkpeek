// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { shouldShowPreview } from './popover';

/** Helper to create an anchor element with the given attributes. */
function makeAnchor(attrs: Record<string, string>): HTMLAnchorElement {
  const a = document.createElement('a');
  for (const [key, value] of Object.entries(attrs)) {
    a.setAttribute(key, value);
  }
  return a;
}

describe('shouldShowPreview', () => {
  it('returns false for mailto: links', () => {
    expect(shouldShowPreview(makeAnchor({ href: 'mailto:user@example.com' }))).toBe(false);
  });

  it('returns false for tel: links', () => {
    expect(shouldShowPreview(makeAnchor({ href: 'tel:+1234567890' }))).toBe(false);
  });

  it('returns false for sms: links', () => {
    expect(shouldShowPreview(makeAnchor({ href: 'sms:+1234567890' }))).toBe(false);
  });

  it('returns false for javascript: links', () => {
    expect(shouldShowPreview(makeAnchor({ href: 'javascript:void(0)' }))).toBe(false);
  });

  it('returns false for fragment-only (#) links', () => {
    expect(shouldShowPreview(makeAnchor({ href: '#section' }))).toBe(false);
  });

  it('returns false for links with a download attribute', () => {
    expect(shouldShowPreview(makeAnchor({ href: 'https://example.com/file.zip', download: '' }))).toBe(false);
  });

  it('returns false for links with data-linkpeek="off"', () => {
    expect(shouldShowPreview(makeAnchor({ href: 'https://example.com', 'data-linkpeek': 'off' }))).toBe(false);
  });

  it('returns true for a normal https URL', () => {
    expect(shouldShowPreview(makeAnchor({ href: 'https://example.com/page' }))).toBe(true);
  });

  it('returns true for a relative URL', () => {
    expect(shouldShowPreview(makeAnchor({ href: '/about' }))).toBe(true);
  });

  it('returns true for an http URL', () => {
    expect(shouldShowPreview(makeAnchor({ href: 'http://example.com' }))).toBe(true);
  });

  it('returns false when href is missing', () => {
    const a = document.createElement('a');
    expect(shouldShowPreview(a)).toBe(false);
  });

  it('is case-insensitive for protocol checks', () => {
    expect(shouldShowPreview(makeAnchor({ href: 'MAILTO:user@example.com' }))).toBe(false);
    expect(shouldShowPreview(makeAnchor({ href: 'JavaScript:void(0)' }))).toBe(false);
  });
});
