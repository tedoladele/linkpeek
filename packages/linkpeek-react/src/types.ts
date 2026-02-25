import type { AttachOptions, ResolveFn } from 'linkpeek';

export interface LinkPreviewProviderProps {
  /** Resolver function */
  resolve: ResolveFn;
  /** Options passed to attachLinkPreviews (excluding resolve) */
  options?: Omit<AttachOptions, 'resolve'>;
  children: React.ReactNode;
}

export interface LinkPreviewContextValue {
  resolve: ResolveFn;
  options: Omit<AttachOptions, 'resolve'>;
}

export type { LinkPreview, ResolveFn, AttachOptions } from 'linkpeek';
