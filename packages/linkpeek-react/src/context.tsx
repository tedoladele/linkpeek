'use client';

import { createContext, useContext } from 'react';
import type { LinkPreviewContextValue } from './types';

const LinkPreviewContext = createContext<LinkPreviewContextValue | null>(null);

export function useLinkPreview(): LinkPreviewContextValue {
  const ctx = useContext(LinkPreviewContext);
  if (!ctx) {
    throw new Error('useLinkPreview must be used within a <LinkPreviewProvider>');
  }
  return ctx;
}

export { LinkPreviewContext };
