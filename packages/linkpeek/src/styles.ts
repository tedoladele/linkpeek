export const defaultStyles = /* css */ `
/* linkpeek - Notion-like rich link preview popover */

.linkpeek-popover {
  --lp-bg: #ffffff;
  --lp-border: rgba(0, 0, 0, 0.08);
  --lp-title-color: #1a1a1a;
  --lp-desc-color: #6b6b6b;
  --lp-meta-color: #9b9b9b;
  --lp-radius: 12px;
  --lp-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  --lp-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;

  position: absolute;
  top: 0;
  left: 0;
  z-index: 9999;
  width: max-content;
  pointer-events: auto;

  /* Entry animation */
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 150ms ease-out, transform 150ms ease-out;
}

.linkpeek-popover.linkpeek-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .linkpeek-popover {
    transform: none;
    transition: opacity 150ms ease-out;
  }
  .linkpeek-popover.linkpeek-visible {
    transform: none;
  }
}

/* Card container */
.linkpeek-card {
  display: flex;
  flex-direction: row;
  background: var(--lp-bg);
  border: 1px solid var(--lp-border);
  border-radius: var(--lp-radius);
  box-shadow: var(--lp-shadow);
  overflow: hidden;
  font-family: var(--lp-font-family);
  text-decoration: none;
  color: inherit;
}

/* Thumbnail */
.linkpeek-thumb {
  flex-shrink: 0;
  width: 120px;
  min-height: 100px;
  overflow: hidden;
}

.linkpeek-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Placeholder when no image is available */
.linkpeek-thumb-placeholder {
  width: 100%;
  height: 100%;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.linkpeek-thumb-placeholder img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  opacity: 0.5;
}

/* Content area */
.linkpeek-content {
  flex: 1;
  min-width: 0;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Title */
.linkpeek-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--lp-title-color);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}

/* Description */
.linkpeek-desc {
  font-size: 13px;
  line-height: 1.45;
  color: var(--lp-desc-color);
  margin: 4px 0 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}

/* Meta row (favicon + site name) */
.linkpeek-meta {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  min-width: 0;
}

.linkpeek-favicon {
  width: 14px;
  height: 14px;
  border-radius: 2px;
  flex-shrink: 0;
  object-fit: contain;
}

.linkpeek-site {
  font-size: 12px;
  color: var(--lp-meta-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

/* Arrow for floating-ui */
.linkpeek-arrow {
  position: absolute;
  width: 12px;
  height: 12px;
  background: var(--lp-bg);
  border: 1px solid var(--lp-border);
  transform: rotate(45deg);
  pointer-events: none;
}

/* Arrow clipping per placement */
.linkpeek-popover[data-placement^="bottom"] .linkpeek-arrow {
  top: -7px;
  border-bottom: none;
  border-right: none;
}

.linkpeek-popover[data-placement^="top"] .linkpeek-arrow {
  bottom: -7px;
  border-top: none;
  border-left: none;
}

.linkpeek-popover[data-placement^="left"] .linkpeek-arrow {
  right: -7px;
  border-left: none;
  border-bottom: none;
}

.linkpeek-popover[data-placement^="right"] .linkpeek-arrow {
  left: -7px;
  border-right: none;
  border-top: none;
}

/* Dark theme */
.linkpeek-popover.linkpeek-dark {
  --lp-bg: #2d2d2d;
  --lp-border: rgba(255, 255, 255, 0.1);
  --lp-title-color: #e8e8e8;
  --lp-desc-color: #999999;
  --lp-meta-color: #777777;
  --lp-shadow: 0 2px 16px rgba(0, 0, 0, 0.24);
}

.linkpeek-dark .linkpeek-thumb-placeholder {
  background: #3a3a3a;
}

/* Loading state */
.linkpeek-loading {
  padding: 16px 20px;
  font-size: 13px;
  color: var(--lp-meta-color);
  font-family: var(--lp-font-family);
}
`;

const STYLE_ID = 'linkpeek-injected-styles';

/**
 * Injects the default linkpeek styles into the document head.
 * Safe to call multiple times; styles are only injected once.
 */
export function injectStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = defaultStyles;
  document.head.appendChild(style);
}
