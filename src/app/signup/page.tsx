'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { HeartIcon, ShareIcon, GiftIcon } from '@heroicons/react/24/outline';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    churchName: '',
    churchRole: '',
    zipCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signUp(formData.email, formData.password, {
        email: formData.email,
        name: formData.name,
        churchName: formData.churchName,
        churchRole: formData.churchRole,
        zipCode: formData.zipCode,
      });
      router.push('/');
    } catch (error) {
      setError('Failed to create account. Please try again.');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      router.push('/');
    } catch (error) {
      setError('Failed to sign in with Google.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#665CF0]/10 to-white flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#665CF0] text-white p-12 flex-col justify-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-6">CommonTable</h1>
          <p className="text-xl mb-8 opacity-90">
            Join a community of ministry leaders sharing resources with generosity and wisdom.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <GiftIcon className="w-8 h-8 text-[#E6FF02]" />
              <div>
                <h3 className="font-semibold">Stewardship</h3>
                <p className="text-sm opacity-80">Make the most of ministry resources</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <HeartIcon className="w-8 h-8 text-[#E6FF02]" />
              <div>
                <h3 className="font-semibold">Generosity</h3>
                <p className="text-sm opacity-80">Share abundantly with your church family</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ShareIcon className="w-8 h-8 text-[#E6FF02]" />
              <div>
                <h3 className="font-semibold">Simplicity</h3>
                <p className="text-sm opacity-80">Easy connection between ministry teams</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Join CommonTable</h2>
            <p className="text-gray-600">Create your account to start sharing</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent"
                  placeholder="Enter your email"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent"
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
                  <option value="Children's Pastor">Children's Pastor</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent"
                  placeholder="12345"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#665CF0] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#5A52E8] focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="mt-4 w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue with Google
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-[#665CF0] hover:text-[#5A52E8]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
