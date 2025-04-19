import Link from 'next/link';
import { Button } from '@/app/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md rounded-lg border border-white/10 bg-black/20 p-8 backdrop-blur-md">
        <h1 className="mb-2 text-4xl font-bold text-white">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-white">Page Not Found</h2>
        <p className="mb-6 text-gray-300">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button href="/" variant="primary">
            Return Home
          </Button>
          <Button href="/dashboard" variant="outline">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
} 