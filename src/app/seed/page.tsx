'use client';

import { useState } from 'react';
import { seedDatabase } from '@/lib/seedData';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState('');

  const handleSeed = async () => {
    setIsSeeding(true);
    setError('');
    
    try {
      await seedDatabase();
      setIsComplete(true);
    } catch (error) {
      setError('Failed to seed database. Please try again.');
      console.error('Seeding error:', error);
    }
    
    setIsSeeding(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Seed Database</h1>
          <p className="text-gray-600 mb-6">
            Click the button below to populate the database with sample church ministry listings.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {isComplete && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              Database seeded successfully! Check the home page to see the new listings.
            </div>
          )}

          <button
            onClick={handleSeed}
            disabled={isSeeding || isComplete}
            className="w-full bg-[#665CF0] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#5A52E8] focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSeeding ? 'Seeding Database...' : isComplete ? 'Database Seeded!' : 'Seed Database'}
          </button>

          {isComplete && (
            <div className="mt-4">
              <a
                href="/"
                className="block text-center text-[#665CF0] hover:text-[#5A52E8] font-medium"
              >
                ← Back to Home
              </a>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-500">
            <p className="font-semibold mb-2">This will add:</p>
            <ul className="space-y-1">
              <li>• 4 "Give Away" listings (desks, chairs, games, supplies)</li>
              <li>• 4 "Sell" listings (projector, sound system, curriculum, pews)</li>
              <li>• 4 "Share" listings (graphics, templates, studies)</li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
