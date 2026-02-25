import { computePosition, flip, shift, offset, arrow as arrowMiddleware } from '@floating-ui/dom';
import type { Placement } from '@floating-ui/dom';
import { LRUCache } from './cache';
import { createPopoverElement } from './render';
import { injectStyles } from './styles';
import type { AttachOptions, LinkPreview } from './types';

/** Protocols that should never get a link preview */
const SKIP_PROTOCOLS = ['mailto:', 'tel:', 'sms:', 'javascript:'];

/**
 * Determines whether a given anchor element should show a link preview.
 * Exported for testing.
 */
export function shouldShowPreview(anchor: HTMLAnchorElement): boolean {
  const href = anchor.getAttribute('href');
  if (!href) return false;

  // Skip fragment-only links
  if (href.startsWith('#')) return false;

  // Skip special protocols
  const hrefLower = href.toLowerCase();
  for (const protocol of SKIP_PROTOCOLS) {
    if (hrefLower.startsWith(protocol)) return false;
  }

  // Skip download links
  if (anchor.hasAttribute('download')) return false;

  // Skip explicitly opted-out links
  if (anchor.getAttribute('data-linkpeek') === 'off') return false;

  return true;
}

/**
 * Attaches Notion-like link preview popovers to all matching anchor elements
 * within the given root element (defaults to document.body).
 *
 * Uses event delegation for efficient handling of many links.
 *
 * @returns A cleanup function that removes all listeners and DOM nodes.
 */
export function attachLinkPreviews(
  root: HTMLElement = document.body,
  options: AttachOptions,
): () => void {
  const {
    selector = 'a[href]',
    resolve,
    openDelay = 150,
    closeDelay = 200,
    maxWidth = 420,
    placement = 'bottom',
    interactive = true,
    shouldPreview: userFilter,
    cache: cacheOpts = { enabled: true, ttlMs: 24 * 60 * 60 * 1000, max: 100 },
    fetchOn = 'enter',
    render: customRender,
    theme = 'system',
    onOpen,
    onClose,
  } = options;

  // Inject default styles
  injectStyles();

  // Set up cache
  const cache = cacheOpts.enabled
    ? new LRUCache({ max: cacheOpts.max, ttlMs: cacheOpts.ttlMs })
    : null;

  // State
  let openTimer: ReturnType<typeof setTimeout> | null = null;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;
  let currentPopover: HTMLElement | null = null;
  let currentAnchor: HTMLAnchorElement | null = null;
  let isDestroyed = false;

  // In-flight fetch dedup: url -> promise
  const inflightFetches = new Map<string, Promise<LinkPreview | null>>();

  function clearOpenTimer(): void {
    if (openTimer !== null) {
      clearTimeout(openTimer);
      openTimer = null;
    }
  }

  function clearCloseTimer(): void {
    if (closeTimer !== null) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  function findAnchor(event: Event): HTMLAnchorElement | null {
    const target = event.target as Element | null;
    if (!target) return null;
    const anchor = target.closest<HTMLAnchorElement>(selector);
    return anchor;
  }

  async function fetchPreview(url: string): Promise<LinkPreview | null> {
    // Check cache first
    if (cache) {
      const cached = cache.get(url);
      if (cached !== undefined) return cached;
    }

    // Deduplicate in-flight requests
    const existing = inflightFetches.get(url);
    if (existing) return existing;

    const fetchPromise = resolve(url).then(
      (result) => {
        inflightFetches.delete(url);
        if (result && cache) {
          cache.set(url, result, !!result.error);
        }
        return result;
      },
      (err) => {
        inflightFetches.delete(url);
        const failResult: LinkPreview = {
          url,
          error: {
            code: 'RESOLVE_ERROR',
            message: err instanceof Error ? err.message : String(err),
          },
        };
        if (cache) {
          cache.set(url, failResult, true);
        }
        return null;
      },
    );

    inflightFetches.set(url, fetchPromise);
    return fetchPromise;
  }

  async function showPopover(anchor: HTMLAnchorElement): Promise<void> {
    if (isDestroyed) return;

    const url = anchor.href;
    const preview = await fetchPreview(url);

    // Check if we're still hovering the same anchor after the async fetch
    if (isDestroyed || currentAnchor !== anchor || !preview || preview.error) {
      return;
    }

    // Close any existing popover
    hidePopover();

    // Create popover element
    let popoverEl: HTMLElement;
    if (customRender) {
      popoverEl = document.createElement('div');
      popoverEl.className = 'linkpeek-popover';
      if (resolveTheme(theme) === 'dark') {
        popoverEl.classList.add('linkpeek-dark');
      }
      popoverEl.style.maxWidth = `${maxWidth}px`;
      popoverEl.setAttribute('role', 'dialog');
      popoverEl.setAttribute('aria-label', `Link preview: ${preview.title || url}`);
      popoverEl.appendChild(customRender({ preview, anchor }));
      // Add arrow
      const arrow = document.createElement('div');
      arrow.className = 'linkpeek-arrow';
      popoverEl.appendChild(arrow);
    } else {
      popoverEl = createPopoverElement(preview, maxWidth, theme);
    }

    document.body.appendChild(popoverEl);
    currentPopover = popoverEl;

    // Set aria-describedby on anchor
    anchor.setAttribute('aria-describedby', popoverEl.id);

    // Position with floating-ui
    const arrowEl = popoverEl.querySelector<HTMLElement>('.linkpeek-arrow');
    const middleware = [
      offset(8),
      flip({ fallbackPlacements: getFlipPlacements(placement) }),
      shift({ padding: 8 }),
    ];
    if (arrowEl) {
      middleware.push(arrowMiddleware({ element: arrowEl, padding: 8 }));
    }

    const { x, y, placement: finalPlacement, middlewareData } = await computePosition(
      anchor,
      popoverEl,
      {
        placement: placement as Placement,
        middleware,
      },
    );

    popoverEl.style.left = `${x}px`;
    popoverEl.style.top = `${y}px`;
    popoverEl.setAttribute('data-placement', finalPlacement);

    // Position arrow
    if (arrowEl && middlewareData.arrow) {
      const { x: arrowX, y: arrowY } = middlewareData.arrow;
      Object.assign(arrowEl.style, {
        left: arrowX != null ? `${arrowX}px` : '',
        top: arrowY != null ? `${arrowY}px` : '',
      });
    }

    // Trigger entry animation on next frame
    requestAnimationFrame(() => {
      if (currentPopover === popoverEl) {
        popoverEl.classList.add('linkpeek-visible');
      }
    });

    // Add popover hover listeners for interactive mode
    if (interactive) {
      popoverEl.addEventListener('pointerenter', onPopoverPointerEnter);
      popoverEl.addEventListener('pointerleave', onPopoverPointerLeave);
      popoverEl.addEventListener('focusin', onPopoverFocusIn);
      popoverEl.addEventListener('focusout', onPopoverFocusOut);
    }

    onOpen?.({ anchor, preview });
  }

  function hidePopover(): void {
    clearOpenTimer();
    clearCloseTimer();

    if (currentPopover) {
      const popover = currentPopover;

      // Remove event listeners
      popover.removeEventListener('pointerenter', onPopoverPointerEnter);
      popover.removeEventListener('pointerleave', onPopoverPointerLeave);
      popover.removeEventListener('focusin', onPopoverFocusIn);
      popover.removeEventListener('focusout', onPopoverFocusOut);

      // Remove from DOM
      popover.remove();
      currentPopover = null;
    }

    if (currentAnchor) {
      currentAnchor.removeAttribute('aria-describedby');
      const anchor = currentAnchor;
      currentAnchor = null;
      onClose?.({ anchor });
    }
  }

  function scheduleClose(): void {
    clearCloseTimer();
    closeTimer = setTimeout(() => {
      hidePopover();
    }, closeDelay);
  }

  function scheduleOpen(anchor: HTMLAnchorElement): void {
    clearOpenTimer();
    clearCloseTimer();

    currentAnchor = anchor;

    // Begin fetching if fetchOn is "enter"
    if (fetchOn === 'enter') {
      fetchPreview(anchor.href);
    }

    openTimer = setTimeout(() => {
      if (currentAnchor === anchor) {
        showPopover(anchor);
      }
    }, openDelay);
  }

  // --- Event Handlers ---

  function onPointerEnter(event: PointerEvent): void {
    const anchor = findAnchor(event);
    if (!anchor) return;
    if (!shouldShowPreview(anchor)) return;
    if (userFilter && !userFilter(anchor, anchor.href)) return;

    // If re-entering the same anchor that already has a popover open, just cancel close
    if (currentAnchor === anchor && currentPopover) {
      clearCloseTimer();
      return;
    }

    // Close existing popover for a different link
    if (currentPopover && currentAnchor !== anchor) {
      hidePopover();
    }

    scheduleOpen(anchor);
  }

  function onPointerOut(event: PointerEvent): void {
    const anchor = findAnchor(event);
    if (!anchor) return;
    if (currentAnchor !== anchor) return;
    const relatedTarget = event.relatedTarget as Element | null;
    if (relatedTarget && anchor.contains(relatedTarget)) return;

    if (interactive && currentPopover) {
      // Give time to hover into the popover
      scheduleClose();
    } else {
      // No popover yet, or not interactive - cancel pending open
      clearOpenTimer();
      if (currentPopover) {
        scheduleClose();
      } else {
        currentAnchor = null;
      }
    }
  }

  function onPopoverPointerEnter(): void {
    clearCloseTimer();
  }

  function onPopoverPointerLeave(): void {
    scheduleClose();
  }

  function onPopoverFocusIn(): void {
    clearCloseTimer();
  }

  function onPopoverFocusOut(event: FocusEvent): void {
    const relatedTarget = event.relatedTarget as Element | null;
    // If focus moved back to the anchor, don't close
    if (relatedTarget && currentAnchor?.contains(relatedTarget)) return;
    // If focus moved within the popover, don't close
    if (relatedTarget && currentPopover?.contains(relatedTarget)) return;
    scheduleClose();
  }

  function onFocusIn(event: FocusEvent): void {
    const anchor = findAnchor(event);
    if (!anchor) return;
    if (!shouldShowPreview(anchor)) return;
    if (userFilter && !userFilter(anchor, anchor.href)) return;

    if (currentAnchor === anchor && currentPopover) {
      clearCloseTimer();
      return;
    }

    if (currentPopover && currentAnchor !== anchor) {
      hidePopover();
    }

    scheduleOpen(anchor);
  }

  function onFocusOut(event: FocusEvent): void {
    const relatedTarget = event.relatedTarget as Element | null;

    // If focus moved to the popover, keep it open
    if (relatedTarget && currentPopover?.contains(relatedTarget)) return;

    // If focus moved to a link that already has the popover, keep it open
    if (relatedTarget && currentAnchor?.contains(relatedTarget)) return;

    if (currentPopover) {
      scheduleClose();
    } else {
      clearOpenTimer();
      currentAnchor = null;
    }
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && currentPopover) {
      hidePopover();
    }
  }

  // --- Attach event delegation ---
  root.addEventListener('pointerenter', onPointerEnter, true);
  root.addEventListener('pointerout', onPointerOut, true);
  root.addEventListener('focusin', onFocusIn, true);
  root.addEventListener('focusout', onFocusOut, true);
  document.addEventListener('keydown', onKeyDown);

  // --- Cleanup ---
  return function cleanup(): void {
    isDestroyed = true;
    hidePopover();
    clearOpenTimer();
    clearCloseTimer();
    root.removeEventListener('pointerenter', onPointerEnter, true);
    root.removeEventListener('pointerout', onPointerOut, true);
    root.removeEventListener('focusin', onFocusIn, true);
    root.removeEventListener('focusout', onFocusOut, true);
    document.removeEventListener('keydown', onKeyDown);
    inflightFetches.clear();
    cache?.clear();
  };
}

function getFlipPlacements(primary: string): Placement[] {
  switch (primary) {
    case 'top':
      return ['bottom', 'left', 'right'];
    case 'bottom':
      return ['top', 'left', 'right'];
    case 'left':
      return ['right', 'top', 'bottom'];
    case 'right':
      return ['left', 'top', 'bottom'];
    default:
      return ['top', 'left', 'right'];
  }
}

function resolveTheme(theme: 'light' | 'dark' | 'system'): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
