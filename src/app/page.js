'use client';

import { useAuth } from '../hooks/useAuth';
import Link from 'next/link';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <h1 className="text-4xl font-bold mb-6">
        Welcome to Memory Line
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Create your personal timeline of memories
      </p>
      
      {user ? (
        <div className="space-y-4">
          <Link href="/memories" className="btn-primary block">
            View Your Memories
          </Link>
          <Link href="/add-memory" className="btn-secondary block">
            Add New Memory
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <Link href="/login" className="btn-primary block">
            Get Started
          </Link>
          <p className="text-sm text-gray-500">
            Create an account to start your memory line
          </p>
        </div>
      )}
    </div>
  );
}