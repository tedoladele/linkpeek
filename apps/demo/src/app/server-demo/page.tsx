'use client';

import { useEffect, useRef, useState } from 'react';
import { attachLinkPreviews, injectStyles } from 'linkpeek';
import type { ResolveFn } from 'linkpeek';
import { Controls, type ControlValues } from '@/components/Controls';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Server resolver - calls our /api/preview endpoint
// ---------------------------------------------------------------------------
const serverResolve: ResolveFn = async (url: string) => {
  const res = await fetch(`/api/preview?url=${encodeURIComponent(url)}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.error) return null;
  return data;
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function ServerDemoPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [controls, setControls] = useState<ControlValues>({
    theme: 'system',
    openDelay: 150,
    closeDelay: 200,
    interactive: true,
  });

  useEffect(() => {
    if (!contentRef.current) return;

    injectStyles();

    const cleanup = attachLinkPreviews(contentRef.current, {
      resolve: serverResolve,
      theme: controls.theme,
      openDelay: controls.openDelay,
      closeDelay: controls.closeDelay,
      interactive: controls.interactive,
      cache: { enabled: true, ttlMs: 5 * 60_000, max: 100 },
    });

    return cleanup;
  }, [controls]);

  return (
    <div>
      <Controls
        values={controls}
        onChange={setControls}
        modeBadge={{
          label: 'Server mode \u2014 using /api/preview endpoint',
          color: '#059669',
        }}
      />

      <main>
        <div style={{ marginBottom: 32 }}>
          <Link
            href="/"
            style={{ fontSize: '0.875rem', color: '#6b7280' }}
            data-linkpeek="off"
          >
            &larr; Back to home
          </Link>
        </div>

        <h1>Server Demo</h1>
        <p style={{ color: '#6b7280', marginBottom: 16 }}>
          Previews are fetched in real time from the server via{' '}
          <code>/api/preview</code>. Hover over links to see live metadata
          from the actual websites.
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 8,
            fontSize: '0.8125rem',
            color: '#059669',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            marginBottom: 32,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 1v2M8 13v2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M1 8h2M13 8h2M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
          </svg>
          Caching: enabled (5 min client-side, 24 hr server-side)
        </div>

        <div ref={contentRef}>
          <h2>The Web Platform</h2>

          <p>
            The web continues to evolve at a rapid pace. The{' '}
            <a href="https://developer.mozilla.org/en-US/docs/Web/API">MDN Web API reference</a>{' '}
            documents hundreds of APIs available to developers, from the
            familiar DOM and Fetch APIs to newer additions like the Web
            Animations API and WebGPU.
          </p>

          <p>
            Modern JavaScript development was transformed by{' '}
            <a href="https://github.com/tc39/proposals">TC39 proposals</a>{' '}
            that brought features like async/await, optional chaining, and
            structured clone. The{' '}
            <a href="https://github.com">GitHub</a>{' '}
            platform hosts the TC39 repository where these proposals are
            developed in the open.
          </p>

          <h2>Open Source Ecosystem</h2>

          <p>
            The <a href="https://en.wikipedia.org/wiki/Open-source_software">open source movement</a>{' '}
            has fundamentally changed how software is built. Projects like{' '}
            <a href="https://github.com/facebook/react">React</a> and{' '}
            <a href="https://github.com/vercel/next.js">Next.js</a>{' '}
            are developed in the open, allowing anyone to contribute bug
            fixes, features, and documentation.
          </p>

          <p>
            Package registries like <a href="https://www.npmjs.com">npm</a>{' '}
            make it trivial to share and reuse code. With over two million
            packages, npm is the largest software registry in the world,
            enabling developers to stand on the shoulders of the community.
          </p>

          <h2>Learning Resources</h2>

          <p>
            For learning web development from scratch,{' '}
            <a href="https://developer.mozilla.org/en-US/docs/Learn">MDN&apos;s Learn Web Development</a>{' '}
            guide provides a structured curriculum covering HTML, CSS, and
            JavaScript fundamentals. For deeper dives,{' '}
            <a href="https://en.wikipedia.org/wiki/World_Wide_Web">Wikipedia&apos;s article on the World Wide Web</a>{' '}
            provides excellent historical context on how we got here.
          </p>

          <p>
            The <a href="https://web.dev">web.dev</a>{' '}
            site by Google offers guidance on building high-quality web
            experiences, covering performance, accessibility, and modern best
            practices. It complements the broader documentation available on{' '}
            <a href="https://developer.chrome.com">Chrome for Developers</a>.
          </p>
        </div>
      </main>
    </div>
  );
}
