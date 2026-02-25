'use client';

import { useMemo } from 'react';
import { LinkPreviewContext } from './context';
import type { LinkPreviewProviderProps } from './types';

export function LinkPreviewProvider({ resolve, options = {}, children }: LinkPreviewProviderProps) {
  const value = useMemo(() => ({ resolve, options }), [resolve, options]);
  return (
    <LinkPreviewContext.Provider value={value}>
      {children}
    </LinkPreviewContext.Provider>
  );
}
