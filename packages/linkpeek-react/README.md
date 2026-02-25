# linkpeek-react

React wrapper for [linkpeek](../linkpeek) rich link previews.

## Installation

```bash
npm install linkpeek-react linkpeek
```

## Usage

```tsx
import { LinkPreviewProvider, LinkPreviewRoot } from 'linkpeek-react';

const resolve = async (url: string) => {
  const res = await fetch(`/api/preview?url=${encodeURIComponent(url)}`);
  return res.json();
};

function App() {
  return (
    <LinkPreviewProvider resolve={resolve} options={{ theme: 'system' }}>
      <LinkPreviewRoot>
        <article>
          <a href="https://github.com">GitHub</a>
        </article>
      </LinkPreviewRoot>
    </LinkPreviewProvider>
  );
}
```

## Components

### `<LinkPreviewProvider>`

Wraps your app and provides the resolver + options via context.

| Prop | Type | Description |
|------|------|-------------|
| `resolve` | `ResolveFn` | Required resolver function |
| `options` | `Omit<AttachOptions, 'resolve'>` | Options for linkpeek |

### `<LinkPreviewRoot>`

Renders a `<div>` that auto-attaches link previews to all links inside it.

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | Optional CSS class |

### `useLinkPreview()`

Hook to access the resolver and options from context.

## Next.js App Router

All components include the `'use client'` directive. Works with Next.js app router out of the box.
