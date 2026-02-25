import * as cheerio from 'cheerio';
import type { LinkPreview } from './types';

/**
 * Parses HTML and extracts Open Graph, Twitter Card, and standard meta tag
 * data into a LinkPreview object.
 *
 * Extraction priority:
 *  1. Open Graph tags (og:*)
 *  2. Twitter Card tags (twitter:*)
 *  3. Standard HTML tags (<title>, meta[name="description"])
 *
 * All relative URLs (images, favicons, canonical) are resolved to absolute
 * using the final response URL as the base.
 */
export function parseHtml(
  html: string,
  responseUrl: string,
): Omit<LinkPreview, 'fetchedAt'> {
  const $ = cheerio.load(html);

  // ── Helper: read content of a <meta> tag ───────────────────────────
  const meta = (value: string): string | undefined => {
    // Try property= first (OG uses property), then name= (Twitter/standard)
    const content =
      $(`meta[property="${value}"]`).attr('content') ||
      $(`meta[name="${value}"]`).attr('content');
    return content?.trim() || undefined;
  };

  // ── Helper: resolve a potentially relative URL to absolute ─────────
  const toAbsolute = (raw: string | undefined): string | undefined => {
    if (!raw) return undefined;
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    try {
      return new URL(trimmed, responseUrl).href;
    } catch {
      return undefined;
    }
  };

  // ── Title ──────────────────────────────────────────────────────────
  // Priority: og:title > twitter:title > <title>
  const title =
    meta('og:title') ??
    meta('twitter:title') ??
    ($('title').first().text().trim() || undefined);

  // ── Description ────────────────────────────────────────────────────
  // Priority: og:description > twitter:description > meta[name="description"]
  const description =
    meta('og:description') ??
    meta('twitter:description') ??
    meta('description');

  // ── Site Name ──────────────────────────────────────────────────────
  const siteName = meta('og:site_name');

  // ── Image ──────────────────────────────────────────────────────────
  // Priority: og:image > twitter:image
  const rawImage = meta('og:image') ?? meta('twitter:image');
  const imageUrl = toAbsolute(rawImage);

  let image: LinkPreview['image'] = undefined;
  if (imageUrl) {
    const widthStr = meta('og:image:width');
    const heightStr = meta('og:image:height');
    const width = widthStr ? parseInt(widthStr, 10) : undefined;
    const height = heightStr ? parseInt(heightStr, 10) : undefined;

    image = {
      url: imageUrl,
      ...(width && !isNaN(width) ? { width } : {}),
      ...(height && !isNaN(height) ? { height } : {}),
    };
  }

  // ── Canonical URL ──────────────────────────────────────────────────
  // Priority: <link rel="canonical"> > og:url > responseUrl
  const linkCanonical = $('link[rel="canonical"]').attr('href')?.trim();
  const ogUrl = meta('og:url');

  const canonicalUrl =
    toAbsolute(linkCanonical) ?? toAbsolute(ogUrl) ?? responseUrl;

  // ── Favicon ────────────────────────────────────────────────────────
  // Priority: <link rel="icon"> > <link rel="shortcut icon"> > <link rel="apple-touch-icon">
  const faviconHref =
    $('link[rel="icon"]').attr('href') ??
    $('link[rel="shortcut icon"]').attr('href') ??
    $('link[rel="apple-touch-icon"]').attr('href');

  const favicon = toAbsolute(faviconHref);

  return {
    url: responseUrl,
    ...(canonicalUrl !== responseUrl ? { canonicalUrl } : {}),
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(siteName ? { siteName } : {}),
    ...(image ? { image } : {}),
    ...(favicon ? { favicon } : {}),
  };
}
