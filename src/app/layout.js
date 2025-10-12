'use client';

import Navbar from '@/components/Navbar';
import ErrorBoundary from '@/components/ErrorBoundary';
import SessionProvider from '@/components/SessionProvider';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <SessionProvider>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="max-w-6xl mx-auto py-8 px-4">
                {children}
              </main>
            </div>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}