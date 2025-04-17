'use client'
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isInApp = pathname.startsWith('/dashboard') || pathname.startsWith('/listings') || pathname.startsWith('/purchases');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 glow rounded-xl overflow-hidden">
                <Image
                  src="/nexagreement-logo.svg"
                  alt="NexAgreement"
                  fill
                  className="object-contain p-2 group-hover:scale-110 transition-transform"
                />
              </div>
              <span className="text-xl font-bold animate-gradient-text">
                NexAgreement
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {!isInApp && (
              <Link
                href="/dashboard"
                className="relative px-8 py-3 overflow-hidden rounded-xl"
              >
                <span className="relative z-10 text-white font-semibold">
                  Launch App
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-100 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent animate-ripple" />
                </div>
              </Link>
            )}
            {isInApp && (
              <div className="flex items-center space-x-6">
                <Link
                  href="/dashboard"
                  className={`transition-colors ${pathname === '/dashboard' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/marketplace"
                  className={`transition-colors ${pathname === '/dashboard/marketplace' || pathname.startsWith('/dashboard/marketplace/') ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                >
                  Marketplace
                </Link>
                <Link
                  href="/dashboard/listings"
                  className={`transition-colors ${pathname === '/dashboard/listings' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                >
                  Listings
                </Link>
                <Link
                  href="/dashboard/purchases"
                  className={`transition-colors ${pathname === '/dashboard/purchases' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                >
                  Purchases
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          } overflow-hidden`}
        >
          <div className="py-4 space-y-4">
            {!isInApp && (
              <Link
                href="/dashboard"
                className="block py-3 text-center text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:opacity-90 transition-opacity"
              >
                Launch App
              </Link>
            )}
            {isInApp && (
              <>
                <Link
                  href="/dashboard"
                  className={`block py-2 transition-colors ${pathname === '/dashboard' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/marketplace"
                  className={`block py-2 transition-colors ${pathname === '/dashboard/marketplace' || pathname.startsWith('/dashboard/marketplace/') ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                >
                  Marketplace
                </Link>
                <Link
                  href="/dashboard/listings"
                  className={`block py-2 transition-colors ${pathname === '/dashboard/listings' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                >
                  Listings
                </Link>
                <Link
                  href="/dashboard/purchases"
                  className={`block py-2 transition-colors ${pathname === '/dashboard/purchases' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                >
                  Purchases
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 