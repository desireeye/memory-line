'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function YearInReview() {
  const { data: session, status } = useSession();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.user) {
      fetchYearMemories();
    }
  }, [session, selectedYear]);

  const fetchYearMemories = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/memories?userId=${session.user.id}&year=${selectedYear}`);
      const data = await response.json();
      
      if (data.success) {
        setMemories(data.memories);
      } else {
        setError(data.error || 'Failed to fetch memories');
      }
    } catch (err) {
      setError('Failed to fetch memories');
      console.error('Error fetching memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const groupMemoriesByMonth = () => {
    const grouped = {};
    memories.forEach(memory => {
      const month = new Date(memory.date).getMonth() + 1;
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(memory);
    });
    return grouped;
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Year in Review</h1>
        <p className="text-gray-600">Please sign in to view your year in review.</p>
      </div>
    );
  }

  const groupedMemories = groupMemoriesByMonth();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Year in Review</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Year
        </label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : memories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No memories for {selectedYear}</h2>
          <p className="text-gray-500 mb-4">Start adding memories to see your year in review!</p>
          <a href="/add-memory" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add Memory
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">
              {selectedYear} Summary
            </h2>
            <p className="text-blue-700">
              You have {memories.length} memories from {selectedYear}
            </p>
          </div>

          {Object.keys(groupedMemories).sort((a, b) => b - a).map(month => (
            <div key={month} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">
                {getMonthName(parseInt(month))} ({groupedMemories[month].length} memories)
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupedMemories[month].map(memory => (
                  <div key={memory.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2">{memory.title}</h4>
                    <p className="text-gray-600 text-sm mb-2">{memory.story}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(memory.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}