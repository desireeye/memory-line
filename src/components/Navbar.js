'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-800">
              Memory Line
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/memories"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                My Memories
              </Link>
              <Link
                href="/add-memory"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Add Memory
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            {status === 'loading' ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {session.user.image && (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                    />
                  )}
                  <span className="text-sm text-gray-700">
                    {session.user.name || session.user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/memories"
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                My Memories
              </Link>
              <Link
                href="/add-memory"
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Add Memory
              </Link>
              {session ? (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="flex items-center px-3">
                    {session.user.image && (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                      />
                    )}
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {session.user.name || session.user.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="mt-3 text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-blue-600 text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}