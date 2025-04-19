'use client';

import { useEffect } from 'react';
import { Button } from '@/app/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="max-w-md rounded-lg border border-white/10 bg-black/20 p-8 backdrop-blur-md">
        <h2 className="mb-4 text-2xl font-bold text-white">Something went wrong</h2>
        <p className="mb-6 text-gray-300">
          An unexpected error occurred. Our team has been notified.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button onClick={reset} variant="primary">
            Try again
          </Button>
          <Button href="/" variant="outline">
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
} 