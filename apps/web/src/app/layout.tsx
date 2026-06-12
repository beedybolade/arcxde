/**
 * Root layout.
 *
 *   - Applies font CSS variables to <body> so Tailwind utilities can
 *     reference --font-sans / --font-serif / --font-mono.
 *   - Sets metadata defaults that every page can extend.
 *   - Adds a paper-grain background utility class for editorial feel.
 */
import type { Metadata } from 'next';

import { fontVariables } from '@/lib/fonts';
import { ReactQueryProvider } from '@/lib/react-query-provider';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'),
  title: {
    default: 'arcxde',
    template: '%s · arcxde',
  },
  description: 'A learning platform for teams who actually want to learn.',
  applicationName: 'arcxde',
  authors: [{ name: 'arcxde' }],
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: 'website',
    title: 'arcxde',
    description: 'A learning platform for teams who actually want to learn.',
  },
};

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en" suppressHydrationWarning  className="h-full">
// {/* <body className="min-h-[100dvh] overflow-y-auto"> */}
//       <body className={`${fontVariables}  antialiased bg-background bg-grain text-foreground`}>
//         <ReactQueryProvider>{children}</ReactQueryProvider>
//       </body>
//     </html>
//   );
// }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontVariables} antialiased bg-background bg-grain text-foreground`}
        style={{ background: '#272727' }}
      >
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
