/**
 * Layout for embeddable widgets
 * No header/footer - self-contained for iframe embedding
 */

import '../globals.css';

export const metadata = {
  robots: {
    index: false, // Don't index embed pages
    follow: true,
  },
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-transparent">
        {children}
      </body>
    </html>
  );
}
