'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Memory Line
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Capture, organize, and relive your life's precious moments. 
            Create a beautiful timeline of your memories with photos and videos.
          </p>
          
          {session ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                Welcome back, {session.user.name || session.user.email}!
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/memories"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View My Memories
                </Link>
                <Link
                  href="/add-memory"
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add New Memory
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-gray-700 mb-6">
                Start building your memory timeline today
              </p>
              <Link
                href="/login"
                className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">📸</div>
            <h3 className="text-xl font-semibold mb-2">Capture Moments</h3>
            <p className="text-gray-600">
              Upload photos and videos to preserve your memories forever
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Organize by Date</h3>
            <p className="text-gray-600">
              Create a beautiful timeline organized by date and year
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Keep Private</h3>
            <p className="text-gray-600">
              Choose which memories to keep private or share with others
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Memory Line?
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-2">🌍 Global Performance</h3>
              <p className="text-gray-600">
                Built with PlanetScale and Cloudinary for fast, reliable access worldwide
              </p>
            </div>
            
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-2">💰 Generous Free Tier</h3>
              <p className="text-gray-600">
                5GB database + 25GB media storage - perfect for personal use
              </p>
            </div>
            
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-2">🔒 Secure & Private</h3>
              <p className="text-gray-600">
                Your memories are encrypted and stored securely in the cloud
              </p>
            </div>
            
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-2">📱 Mobile Friendly</h3>
              <p className="text-gray-600">
                Responsive design that works perfectly on all devices
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}