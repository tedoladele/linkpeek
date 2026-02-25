export const defaultStyles = /* css */ `
/* linkpeek - Notion-like rich link preview popover */

.linkpeek-popover {
  --lp-bg: #ffffff;
  --lp-bg-soft: #fbfaf7;
  --lp-border: rgba(0, 0, 0, 0.08);
  --lp-title-color: #1f1f1f;
  --lp-desc-color: #6b6b6b;
  --lp-meta-color: #8f8f8f;
  --lp-radius: 16px;
  --lp-shadow: 0 14px 34px rgba(0, 0, 0, 0.12);
  --lp-font-family: "Sora", "Manrope", "Avenir Next", "Trebuchet MS", sans-serif;

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
  flex-direction: column;
  background: linear-gradient(180deg, var(--lp-bg) 0%, var(--lp-bg-soft) 100%);
  border: 1px solid var(--lp-border);
  border-radius: var(--lp-radius);
  box-shadow: var(--lp-shadow);
  overflow: hidden;
  font-family: var(--lp-font-family);
  text-decoration: none;
  color: inherit;
}

/* Thumbnail */
.linkpeek-media {
  position: relative;
  width: 100%;
  height: 168px;
  overflow: hidden;
  background: radial-gradient(circle at top left, #f2efe9 0%, #ffffff 55%);
}

.linkpeek-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Placeholder when no image is available */
.linkpeek-thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f3f1ec 0%, #ffffff 60%);
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
  padding: 16px 18px 18px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Title */
.linkpeek-title {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
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
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--lp-desc-color);
  margin: 8px 0 0;
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
  margin-top: 12px;
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

/* Dark theme */
.linkpeek-popover.linkpeek-dark {
  --lp-bg: #2b2b2b;
  --lp-bg-soft: #262626;
  --lp-border: rgba(255, 255, 255, 0.1);
  --lp-title-color: #f1f1f1;
  --lp-desc-color: #b0b0b0;
  --lp-meta-color: #8a8a8a;
  --lp-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
}

.linkpeek-dark .linkpeek-thumb-placeholder {
  background: linear-gradient(135deg, #343434 0%, #2a2a2a 70%);
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
