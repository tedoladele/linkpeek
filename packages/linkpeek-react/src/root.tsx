'use client';

import { useEffect, useRef } from 'react';
import { attachLinkPreviews, injectStyles } from 'linkpeek';
import { useLinkPreview } from './context';

export interface LinkPreviewRootProps {
  className?: string;
  children: React.ReactNode;
}

export function LinkPreviewRoot({ className, children }: LinkPreviewRootProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolve, options } = useLinkPreview();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    injectStyles();
    const cleanup = attachLinkPreviews(el, { ...options, resolve });
    return cleanup;
  }, [resolve, options]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
