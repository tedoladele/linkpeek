import type { LinkPreview } from './types';

let popoverIdCounter = 0;

/**
 * Creates the popover DOM element for a link preview card.
 *
 * The card uses a vertical layout: media on top, content below,
 * matching the YC-style preview card in the reference.
 */
export function createPopoverElement(
  preview: LinkPreview,
  maxWidth: number,
  theme: 'light' | 'dark' | 'system',
): HTMLElement {
  const popover = document.createElement('div');
  const id = `linkpeek-popover-${++popoverIdCounter}`;
  popover.id = id;
  popover.className = 'linkpeek-popover';

  // Apply theme class
  const resolvedTheme = resolveTheme(theme);
  if (resolvedTheme === 'dark') {
    popover.classList.add('linkpeek-dark');
  }

  popover.style.maxWidth = `${maxWidth}px`;

  // We use role="dialog" rather than "tooltip" because the popover is interactive
  // (contains links, images) and persists on hover. Tooltips are meant for
  // non-interactive supplementary text per WAI-ARIA guidelines.
  popover.setAttribute('role', 'dialog');

  const displayUrl = preview.canonicalUrl || preview.url;
  const hostname = extractHostname(displayUrl);
  const titleText = preview.title || hostname;
  popover.setAttribute('aria-label', `Link preview: ${titleText}`);

  // Build card
  const card = document.createElement('div');
  card.className = 'linkpeek-card';

  // Media area
  const media = document.createElement('div');
  media.className = 'linkpeek-media';

  if (preview.image?.url) {
    const img = document.createElement('img');
    img.src = preview.image.url;
    img.alt = '';
    img.loading = 'lazy';
    img.setAttribute('aria-hidden', 'true');
    // On error, replace with placeholder
    img.onerror = () => {
      media.innerHTML = '';
      media.appendChild(createPlaceholder(preview.favicon));
    };
    media.appendChild(img);
  } else {
    media.appendChild(createPlaceholder(preview.favicon));
  }

  card.appendChild(media);

  // Content area
  const content = document.createElement('div');
  content.className = 'linkpeek-content';

  // Title
  if (titleText) {
    const title = document.createElement('div');
    title.className = 'linkpeek-title';
    title.textContent = titleText;
    content.appendChild(title);
  }

  // Description
  if (preview.description) {
    const desc = document.createElement('div');
    desc.className = 'linkpeek-desc';
    desc.textContent = preview.description;
    content.appendChild(desc);
  }

  // Meta row: favicon + site name
  const meta = document.createElement('div');
  meta.className = 'linkpeek-meta';

  if (preview.favicon) {
    const favicon = document.createElement('img');
    favicon.className = 'linkpeek-favicon';
    favicon.src = preview.favicon;
    favicon.alt = '';
    favicon.setAttribute('aria-hidden', 'true');
    favicon.onerror = () => {
      favicon.style.display = 'none';
    };
    meta.appendChild(favicon);
  }

  const site = document.createElement('span');
  site.className = 'linkpeek-site';
  site.textContent = preview.siteName || hostname;
  meta.appendChild(site);

  content.appendChild(meta);
  card.appendChild(content);
  popover.appendChild(card);

  return popover;
}

function createPlaceholder(faviconUrl?: string): HTMLElement {
  const placeholder = document.createElement('div');
  placeholder.className = 'linkpeek-thumb-placeholder';

  if (faviconUrl) {
    const img = document.createElement('img');
    img.src = faviconUrl;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.onerror = () => {
      img.style.display = 'none';
    };
    placeholder.appendChild(img);
  }

  return placeholder;
}

function extractHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function resolveTheme(theme: 'light' | 'dark' | 'system'): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
