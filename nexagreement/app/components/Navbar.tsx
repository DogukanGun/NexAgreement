'use client'
import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { MetaMaskConnect } from './ui/MetaMaskConnect';
import { UserAuth } from './auth/UserAuth';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Memoize this calculation to prevent unnecessary re-renders
  const isInApp = useMemo(() => {
    return pathname.startsWith('/dashboard') || 
           pathname.startsWith('/listings') || 
           pathname.startsWith('/purchases');
  }, [pathname]);

  // Memoize the menu button handler
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Memoize navigation links to prevent unnecessary re-renders
  const renderDesktopNavLinks = useMemo(() => {
    if (!isInApp) {
      return (
        <div className="flex items-center">
          <UserAuth />
        </div>
      );
    }
    
    return (
      <>
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
      </>
    );
  }, [isInApp, pathname]);

  // Memoize mobile navigation links
  const renderMobileNavLinks = useMemo(() => {
    if (!isInApp) {
      return (
        <Link
          href="/dashboard"
          className="block py-3 text-center text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:opacity-90 transition-opacity"
        >
          Launch App
        </Link>
      );
    }
    
    return (
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
    );
  }, [isInApp, pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
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

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {renderDesktopNavLinks}
          </div>

          {/* User Auth */}
          {isInApp && (
            <div className="flex items-center">
              <UserAuth />
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden ml-4">
            <button
              onClick={handleMobileMenuToggle}
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
            {renderMobileNavLinks}
          </div>
        </div>
      </div>
    </nav>
  );
} 