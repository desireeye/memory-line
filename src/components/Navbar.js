'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-pastel-blue">
            Memory Line
          </Link>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <Link href="/add-memory" className="btn-primary">
                Add Memory
              </Link>
              <Link href="/memories" className="text-gray-600 hover:text-gray-900">
                My Memories
              </Link>
              <Link href="/collections" className="text-gray-600 hover:text-gray-900">
                Collections
              </Link>
              <Link href="/search" className="text-gray-600 hover:text-gray-900">
                Search
              </Link>
              <Link href="/year-review" className="text-gray-600 hover:text-gray-900">
                Year in Review
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                Profile
              </Link>
              <button
                onClick={() => signOut()}
                className="btn-secondary"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}