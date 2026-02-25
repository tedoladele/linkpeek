/** Metadata for a link preview */
export interface LinkPreview {
  /** The original URL */
  url: string;
  /** Canonical URL if different from original */
  canonicalUrl?: string;
  /** Page title */
  title?: string;
  /** Page description */
  description?: string;
  /** Site name (e.g., "GitHub", "YouTube") */
  siteName?: string;
  /** Preview image */
  image?: {
    url: string;
    width?: number;
    height?: number;
  };
  /** Favicon URL */
  favicon?: string;
  /** ISO date when metadata was fetched */
  fetchedAt?: string;
  /** Error info when resolver fails */
  error?: {
    code: string;
    message: string;
  };
}

/** Function that resolves a URL to preview metadata */
export type ResolveFn = (url: string) => Promise<LinkPreview | null>;

/** Options for attachLinkPreviews */
export interface AttachOptions {
  /** CSS selector for links to preview. Default: "a[href]" */
  selector?: string;
  /** Function to resolve URL to preview data (required) */
  resolve: ResolveFn;
  /** Delay before showing popover in ms. Default: 150 */
  openDelay?: number;
  /** Delay before hiding popover in ms. Default: 200 */
  closeDelay?: number;
  /** Max width of popover in px. Default: 420 */
  maxWidth?: number;
  /** Preferred placement. Default: "bottom" */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Allow hovering into the popover. Default: true */
  interactive?: boolean;
  /** Filter which links get previews */
  shouldPreview?: (anchor: HTMLAnchorElement, url: string) => boolean;
  /** Cache configuration */
  cache?: {
    enabled: boolean;
    ttlMs: number;
    max: number;
  };
  /** When to start fetching. Default: "enter" */
  fetchOn?: 'intent' | 'enter';
  /** Custom renderer for popover content */
  render?: (data: { preview: LinkPreview; anchor: HTMLAnchorElement }) => HTMLElement;
  /** Color theme. Default: "system" */
  theme?: 'light' | 'dark' | 'system';
  /** Callback when popover opens */
  onOpen?: (info: { anchor: HTMLAnchorElement; preview: LinkPreview }) => void;
  /** Callback when popover closes */
  onClose?: (info: { anchor: HTMLAnchorElement }) => void;
}

/** Cache stats for debugging */
export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
}
