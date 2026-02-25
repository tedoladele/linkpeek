import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: 8 }}>linkpeek</h1>
        <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: 0 }}>
          Notion-like rich link preview popovers for the web. Hover over any
          link to see a preview card with title, description, image, and
          favicon.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}
      >
        <Link href="/client-demo" style={{ textDecoration: 'none' }}>
          <div
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: '28px 24px',
              background: '#fff',
              transition: 'border-color 200ms ease, box-shadow 200ms ease',
            }}
            className="demo-card"
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#8b5cf6',
                marginBottom: 8,
              }}
            >
              Client-only
            </div>
            <h2
              style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#1a1a1a',
                margin: '0 0 8px',
              }}
            >
              Client Demo
            </h2>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Uses mock data and a fake resolver. No server calls. Great for
              testing the popover UI and interactions.
            </p>
          </div>
        </Link>

        <Link href="/server-demo" style={{ textDecoration: 'none' }}>
          <div
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: '28px 24px',
              background: '#fff',
              transition: 'border-color 200ms ease, box-shadow 200ms ease',
            }}
            className="demo-card"
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#059669',
                marginBottom: 8,
              }}
            >
              Server mode
            </div>
            <h2
              style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#1a1a1a',
                margin: '0 0 8px',
              }}
            >
              Server Demo
            </h2>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Fetches real link metadata via the <code>/api/preview</code>{' '}
              endpoint powered by <code>linkpeek-server</code>.
            </p>
          </div>
        </Link>
      </div>

      <style>{`
        .demo-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        }
      `}</style>
    </main>
  );
}
