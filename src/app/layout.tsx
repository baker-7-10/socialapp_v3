import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Chronicle — Share your story',
  description: 'A minimal, elegant social platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0d0d0d',
              color: '#faf8f3',
              borderRadius: '8px',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              border: '1px solid #28281e',
            },
            success: {
              iconTheme: { primary: '#4a9960', secondary: '#faf8f3' },
            },
            error: {
              iconTheme: { primary: '#d94f3d', secondary: '#faf8f3' },
            },
          }}
        />
      </body>
    </html>
  );
}
