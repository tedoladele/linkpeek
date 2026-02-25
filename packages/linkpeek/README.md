# linkpeek

Framework-agnostic rich link preview popover library.

## Installation

```bash
npm install linkpeek
```

## Usage

```js
import { attachLinkPreviews, injectStyles } from 'linkpeek';

// Inject default styles into document head
injectStyles();

// Attach to a container
const cleanup = attachLinkPreviews(document.getElementById('content'), {
  resolve: async (url) => {
    const res = await fetch(`/api/preview?url=${encodeURIComponent(url)}`);
    return res.json();
  },
  theme: 'system',
  openDelay: 150,
  closeDelay: 200,
  interactive: true,
});

// Remove all listeners and popover DOM
cleanup();
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `resolve` | `ResolveFn` | required | Async function to fetch preview data |
| `selector` | `string` | `"a[href]"` | CSS selector for target links |
| `openDelay` | `number` | `150` | ms before showing popover |
| `closeDelay` | `number` | `200` | ms before hiding popover |
| `maxWidth` | `number` | `420` | Max popover width in px |
| `placement` | `string` | `"bottom"` | Preferred placement |
| `interactive` | `boolean` | `true` | Allow hovering into popover |
| `theme` | `string` | `"system"` | `"light"`, `"dark"`, or `"system"` |
| `fetchOn` | `string` | `"enter"` | When to start fetching |
| `cache` | `object` | enabled, 24h, 100 | LRU cache config |
| `render` | `function` | built-in | Custom popover renderer |
| `shouldPreview` | `function` | built-in | Filter which links get previews |
| `onOpen` | `function` | - | Callback when popover opens |
| `onClose` | `function` | - | Callback when popover closes |

## CSS Customization

Override CSS variables on `.linkpeek-popover`:

```css
.linkpeek-popover {
  --lp-bg: #ffffff;
  --lp-border: rgba(0, 0, 0, 0.08);
  --lp-title-color: #1a1a1a;
  --lp-desc-color: #6b6b6b;
  --lp-meta-color: #9b9b9b;
  --lp-radius: 12px;
  --lp-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  --lp-font-family: system-ui, -apple-system, sans-serif;
}
```

## Accessibility

- Uses `role="dialog"` (interactive content, not a tooltip)
- `aria-describedby` linking between anchor and popover
- Keyboard navigable: focus shows popover, Escape closes
- Respects `prefers-reduced-motion`
