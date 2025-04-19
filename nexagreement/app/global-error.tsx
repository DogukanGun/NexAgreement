'use client';

import { useEffect } from 'react';
import { Button } from '@/app/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en" className="bg-[#0a0a0a] text-white">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <div className="max-w-md rounded-lg border border-white/10 bg-black/20 p-8 backdrop-blur-md">
            <h1 className="mb-4 text-3xl font-bold text-white">Application Error</h1>
            <p className="mb-6 text-gray-300">
              We apologize, but a critical error has occurred in the application.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={reset}
                className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:opacity-90"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 