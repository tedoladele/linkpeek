'use client';

import { useEffect, useRef, useState } from 'react';
import { attachLinkPreviews, injectStyles } from 'linkpeek';
import type { LinkPreview, ResolveFn } from 'linkpeek';
import { Controls, type ControlValues } from '@/components/Controls';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Mock preview data
// ---------------------------------------------------------------------------
const mockPreviews: Record<string, LinkPreview> = {
  'https://github.com': {
    url: 'https://github.com',
    title: 'GitHub',
    description:
      'GitHub is where over 100 million developers shape the future of software, together.',
    siteName: 'GitHub',
    image: {
      url: 'https://github.githubassets.com/assets/home-campaign-41da2f15.webp',
    },
    favicon: 'https://github.githubassets.com/favicons/favicon.svg',
  },
  'https://notion.so': {
    url: 'https://notion.so',
    title: 'Notion - The all-in-one workspace',
    description:
      'A new tool that blends your everyday work apps into one. It\'s the all-in-one workspace for you and your team.',
    siteName: 'Notion',
    image: {
      url: 'https://www.notion.so/images/meta/default.png',
    },
    favicon: 'https://www.notion.so/images/favicon.ico',
  },
  'https://www.ycombinator.com': {
    url: 'https://www.ycombinator.com',
    title: 'Y Combinator',
    description:
      'Y Combinator created a new model for funding early stage startups. Twice a year we invest in a large number of startups.',
    siteName: 'Y Combinator',
    image: {
      url: 'https://www.ycombinator.com/og-image.png',
    },
    favicon: 'https://www.ycombinator.com/favicon.ico',
  },
  'https://react.dev': {
    url: 'https://react.dev',
    title: 'React',
    description:
      'React is the library for web and native user interfaces. Build user interfaces out of individual pieces called components written in JavaScript.',
    siteName: 'React',
    image: {
      url: 'https://react.dev/images/og-home.png',
    },
    favicon: 'https://react.dev/favicon-32x32.png',
  },
  'https://nextjs.org': {
    url: 'https://nextjs.org',
    title: 'Next.js by Vercel - The React Framework',
    description:
      'Used by some of the world\'s largest companies, Next.js enables you to create high-quality web applications with the power of React components.',
    siteName: 'Next.js',
    image: {
      url: 'https://nextjs.org/static/twitter-cards/home.jpg',
    },
    favicon: 'https://nextjs.org/static/favicon/favicon-32x32.png',
  },
  'https://tailwindcss.com': {
    url: 'https://tailwindcss.com',
    title: 'Tailwind CSS - Rapidly build modern websites without ever leaving your HTML',
    description:
      'Tailwind CSS is a utility-first CSS framework for rapidly building custom user interfaces.',
    siteName: 'Tailwind CSS',
    image: {
      url: 'https://tailwindcss.com/_next/static/media/social-card-large.a6e71726.jpg',
    },
    favicon: 'https://tailwindcss.com/favicons/favicon-32x32.png',
  },
  'https://www.typescriptlang.org': {
    url: 'https://www.typescriptlang.org',
    title: 'TypeScript: JavaScript With Syntax For Types',
    description:
      'TypeScript extends JavaScript by adding types to the language. TypeScript speeds up your development experience by catching errors and providing fixes before you even run your code.',
    siteName: 'TypeScript',
    image: {
      url: 'https://www.typescriptlang.org/images/branding/og-image.png',
    },
    favicon: 'https://www.typescriptlang.org/favicon-32x32.png',
  },
  'https://vercel.com': {
    url: 'https://vercel.com',
    title: 'Vercel: Build and deploy the best web experiences with the Frontend Cloud',
    description:
      'Vercel\'s Frontend Cloud gives developers frameworks, workflows, and infrastructure to build a faster, more personalized web.',
    siteName: 'Vercel',
    image: {
      url: 'https://vercel.com/api/www/avatar?u=vercel&s=180',
    },
    favicon: 'https://vercel.com/favicon.ico',
  },
  'https://developer.mozilla.org': {
    url: 'https://developer.mozilla.org',
    title: 'MDN Web Docs',
    description:
      'The MDN Web Docs site provides information about Open Web technologies including HTML, CSS, and APIs for both Web sites and progressive web apps.',
    siteName: 'MDN Web Docs',
    image: {
      url: 'https://developer.mozilla.org/mdn-social-share.cd6c4a5a.png',
    },
    favicon: 'https://developer.mozilla.org/favicon-48x48.png',
  },
  'https://www.wikipedia.org': {
    url: 'https://www.wikipedia.org',
    title: 'Wikipedia',
    description:
      'Wikipedia is a free online encyclopedia, created and edited by volunteers around the world and hosted by the Wikimedia Foundation.',
    siteName: 'Wikipedia',
    favicon: 'https://www.wikipedia.org/static/favicon/wikipedia.ico',
  },
};

// ---------------------------------------------------------------------------
// Fake resolver with simulated latency
// ---------------------------------------------------------------------------
const mockResolve: ResolveFn = async (url: string) => {
  await new Promise((r) => setTimeout(r, 80 + Math.random() * 120));
  // Try exact match first, then try matching without trailing slash
  const normalized = url.replace(/\/$/, '');
  return mockPreviews[url] ?? mockPreviews[normalized] ?? null;
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function ClientDemoPage() {
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
      resolve: mockResolve,
      theme: controls.theme,
      openDelay: controls.openDelay,
      closeDelay: controls.closeDelay,
      interactive: controls.interactive,
      cache: { enabled: true, ttlMs: 60_000, max: 50 },
    });

    return cleanup;
  }, [controls]);

  return (
    <div>
      <Controls
        values={controls}
        onChange={setControls}
        modeBadge={{ label: 'Client-only mode \u2014 using mock resolver', color: '#8b5cf6' }}
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

        <h1>Client Demo</h1>
        <p style={{ color: '#6b7280', marginBottom: 32 }}>
          All previews below use mock data. Hover over any link to see the
          popover. Adjust the controls above to experiment with different
          settings.
        </p>

        <div ref={contentRef}>
          <h2>Building Modern Web Applications</h2>

          <p>
            The JavaScript ecosystem has matured significantly over the past
            decade. Tools like <a href="https://www.typescriptlang.org">TypeScript</a>{' '}
            have brought type safety to the language, catching entire classes
            of bugs before code even runs. Combined with modern frameworks,
            developers can build robust applications faster than ever.
          </p>

          <p>
            <a href="https://react.dev">React</a> remains the most popular UI
            library, powering everything from small personal projects to some of
            the largest applications on the web. Its component model and hooks
            API make it straightforward to build complex, interactive
            interfaces.
          </p>

          <p>
            For full-stack React applications, <a href="https://nextjs.org">Next.js</a>{' '}
            is the go-to framework. It provides server-side rendering, static
            site generation, API routes, and a file-based router out of the
            box. Deployed on <a href="https://vercel.com">Vercel</a>, you get
            automatic previews, edge functions, and global CDN caching.
          </p>

          <h2>Developer Tools and Resources</h2>

          <p>
            When it comes to styling, <a href="https://tailwindcss.com">Tailwind CSS</a>{' '}
            has changed how many developers think about CSS. Its utility-first
            approach eliminates the need for naming conventions and makes
            responsive design intuitive.
          </p>

          <p>
            For documentation and learning, <a href="https://developer.mozilla.org">MDN Web Docs</a>{' '}
            is the definitive reference for web standards. Whether you need to
            look up a CSS property, understand a Web API, or learn about
            browser compatibility, MDN has you covered.
          </p>

          <p>
            Open source collaboration happens primarily on{' '}
            <a href="https://github.com">GitHub</a>, where over 100 million
            developers contribute to projects. From issue tracking to pull
            requests, it provides the tools teams need to build software
            together.
          </p>

          <h2>Productivity and Knowledge</h2>

          <p>
            For project management and documentation, many teams rely on{' '}
            <a href="https://notion.so">Notion</a>. Its flexible workspace
            combines notes, databases, and wikis into a single tool that adapts
            to how your team works.
          </p>

          <p>
            The startup ecosystem thrives thanks to accelerators like{' '}
            <a href="https://www.ycombinator.com">Y Combinator</a>, which has
            funded over 4,000 companies including Stripe, Airbnb, and Dropbox.
            Their batch model and alumni network have become a template for
            startup support worldwide.
          </p>

          <p>
            And of course, <a href="https://www.wikipedia.org">Wikipedia</a>{' '}
            remains humanity&apos;s greatest collaborative knowledge project,
            with millions of articles in hundreds of languages, all maintained
            by volunteers.
          </p>
        </div>
      </main>
    </div>
  );
}
