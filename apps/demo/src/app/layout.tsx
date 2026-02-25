import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'linkpeek demo',
  description: 'Notion-like rich link preview popovers for the web',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
