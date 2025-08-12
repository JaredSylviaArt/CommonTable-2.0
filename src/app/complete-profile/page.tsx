'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CompleteProfilePage() {
  const [formData, setFormData] = useState({
    name: '',
    churchName: '',
    churchRole: '',
    zipCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { firebaseUser, refreshUser } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firebaseUser) {
      setError('No user found. Please sign in again.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: formData.name,
        churchName: formData.churchName,
        churchRole: formData.churchRole,
        zipCode: formData.zipCode,
        createdAt: new Date(),
      });
      
      // Refresh user data in context
      await refreshUser();
      
      router.push('/dashboard');
    } catch {
      setError('Failed to complete profile. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#665CF0]/10 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
          <p className="text-gray-600">Tell us a bit about yourself to get started</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent placeholder:text-gray-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="churchName" className="block text-sm font-medium text-gray-700 mb-1">
              Church Name *
            </label>
            <input
              id="churchName"
              name="churchName"
              type="text"
              value={formData.churchName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent placeholder:text-gray-500"
              placeholder="Enter your church name"
            />
          </div>

          <div>
            <label htmlFor="churchRole" className="block text-sm font-medium text-gray-700 mb-1">
              Church Role *
            </label>
            <select
              id="churchRole"
              name="churchRole"
              value={formData.churchRole}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent"
            >
              <option value="">Select your role</option>
              <option value="Pastor">Pastor</option>
              <option value="Associate Pastor">Associate Pastor</option>
              <option value="Youth Pastor">Youth Pastor</option>
              <option value="Children's Pastor">Children&apos;s Pastor</option>
              <option value="Worship Leader">Worship Leader</option>
              <option value="Admin Staff">Admin Staff</option>
              <option value="Ministry Leader">Ministry Leader</option>
              <option value="Volunteer Coordinator">Volunteer Coordinator</option>
              <option value="Other Staff">Other Staff</option>
            </select>
          </div>

          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code *
            </label>
            <input
              id="zipCode"
              name="zipCode"
              type="text"
              value={formData.zipCode}
              onChange={handleChange}
              required
              pattern="[0-9]{5}"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent placeholder:text-gray-500"
              placeholder="12345"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#665CF0] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#5A52E8] focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Completing Profile...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
