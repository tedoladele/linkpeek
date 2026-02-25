import { describe, it, expect } from 'vitest';
import { parseHtml } from './parser';

describe('parseHtml', () => {
  const BASE_URL = 'https://example.com/page';

  it('extracts full Open Graph tags', () => {
    const html = `
      <html>
        <head>
          <meta property="og:title" content="OG Title" />
          <meta property="og:description" content="OG Description" />
          <meta property="og:image" content="https://example.com/image.png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:site_name" content="Example Site" />
          <meta property="og:url" content="https://example.com/canonical" />
        </head>
        <body></body>
      </html>
    `;

    const result = parseHtml(html, BASE_URL);

    expect(result.title).toBe('OG Title');
    expect(result.description).toBe('OG Description');
    expect(result.image).toEqual({
      url: 'https://example.com/image.png',
      width: 1200,
      height: 630,
    });
    expect(result.siteName).toBe('Example Site');
    expect(result.canonicalUrl).toBe('https://example.com/canonical');
    expect(result.url).toBe(BASE_URL);
  });

  it('falls back to Twitter Card tags when OG tags are absent', () => {
    const html = `
      <html>
        <head>
          <meta name="twitter:title" content="Twitter Title" />
          <meta name="twitter:description" content="Twitter Description" />
          <meta name="twitter:image" content="https://example.com/twitter-image.jpg" />
        </head>
        <body></body>
      </html>
    `;

    const result = parseHtml(html, BASE_URL);

    expect(result.title).toBe('Twitter Title');
    expect(result.description).toBe('Twitter Description');
    expect(result.image).toEqual({ url: 'https://example.com/twitter-image.jpg' });
  });

  it('falls back to standard meta tags when OG and Twitter are absent', () => {
    const html = `
      <html>
        <head>
          <title>Page Title</title>
          <meta name="description" content="Page description from meta" />
        </head>
        <body></body>
      </html>
    `;

    const result = parseHtml(html, BASE_URL);

    expect(result.title).toBe('Page Title');
    expect(result.description).toBe('Page description from meta');
  });

  it('prefers <link rel="canonical"> over og:url for canonical URL', () => {
    const html = `
      <html>
        <head>
          <link rel="canonical" href="https://example.com/canonical-link" />
          <meta property="og:url" content="https://example.com/og-url" />
        </head>
        <body></body>
      </html>
    `;

    const result = parseHtml(html, BASE_URL);

    expect(result.canonicalUrl).toBe('https://example.com/canonical-link');
  });

  it('resolves a relative og:image URL to absolute', () => {
    const html = `
      <html>
        <head>
          <meta property="og:image" content="/images/hero.png" />
        </head>
        <body></body>
      </html>
    `;

    const result = parseHtml(html, BASE_URL);

    expect(result.image?.url).toBe('https://example.com/images/hero.png');
  });

  it('extracts favicon with correct priority', () => {
    const html = `
      <html>
        <head>
          <link rel="icon" href="/favicon.ico" />
          <link rel="shortcut icon" href="/shortcut.ico" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        </head>
        <body></body>
      </html>
    `;

    const result = parseHtml(html, BASE_URL);

    // Should prefer rel="icon" over shortcut icon and apple-touch-icon
    expect(result.favicon).toBe('https://example.com/favicon.ico');
  });

  it('falls back to shortcut icon when rel="icon" is absent', () => {
    const html = `
      <html>
        <head>
          <link rel="shortcut icon" href="/shortcut.ico" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        </head>
        <body></body>
      </html>
    `;

    const result = parseHtml(html, BASE_URL);
    expect(result.favicon).toBe('https://example.com/shortcut.ico');
  });

  it('returns only url when all metadata is missing', () => {
    const html = `
      <html>
        <head></head>
        <body><p>Hello</p></body>
      </html>
    `;

    const result = parseHtml(html, BASE_URL);

    expect(result).toEqual({ url: BASE_URL });
  });

  it('resolves a relative favicon path to absolute', () => {
    const html = `
      <html>
        <head>
          <link rel="icon" href="/assets/favicon.svg" />
        </head>
        <body></body>
      </html>
    `;

    const result = parseHtml(html, BASE_URL);

    expect(result.favicon).toBe('https://example.com/assets/favicon.svg');
  });

  it('does not set canonicalUrl when it matches the response URL', () => {
    const html = `
      <html>
        <head>
          <link rel="canonical" href="${BASE_URL}" />
        </head>
        <body></body>
      </html>
    `;

    const result = parseHtml(html, BASE_URL);

    // canonicalUrl should be omitted when it equals the response URL
    expect(result.canonicalUrl).toBeUndefined();
  });

  it('trims whitespace from meta content values', () => {
    const html = `
      <html>
        <head>
          <meta property="og:title" content="  Whitespace Title  " />
          <meta property="og:description" content="  Whitespace Desc  " />
        </head>
        <body></body>
      </html>
    `;

    const result = parseHtml(html, BASE_URL);

    expect(result.title).toBe('Whitespace Title');
    expect(result.description).toBe('Whitespace Desc');
  });
});
