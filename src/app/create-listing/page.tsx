'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { ListingType, ListingCategory, ListingCondition } from '@/types';
import { UploadResult } from '@/lib/imageUpload';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import ImageUpload from '@/components/ImageUpload';

export default function CreateListingPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as ListingCategory,
    condition: '' as ListingCondition,
          type: '' as ListingType,
      zipCode: '',
      price: '',
  });
  const [uploadedImage, setUploadedImage] = useState<UploadResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Check if user is trying to select "Sell" without payment setup
    if (name === 'type' && value === 'Sell' && user) {
      const canSell = user.stripeAccountId && 
                     user.stripeChargesEnabled && 
                     user.stripePayoutsEnabled && 
                     user.stripeDetailsSubmitted;
      
      if (!canSell) {
        // Redirect to payment setup
        router.push('/dashboard?tab=account&setup=payments');
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUploaded = (result: UploadResult) => {
    setUploadedImage(result);
    setError(''); // Clear any previous errors
  };

  const handleImageRemoved = () => {
    setUploadedImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a listing.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create listing document
              const listingData = {
          ...formData,
          price: formData.type === 'Sell' && formData.price ? parseFloat(formData.price) : undefined,
          imageUrl: uploadedImage?.url || '',
          imagePath: uploadedImage?.path || '',
          status: 'active',
        userId: user.uid,
        userRef: `users/${user.uid}`,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'listings'), listingData);
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating listing:', error);
      setError('Failed to create listing. Please try again.');
    }
    
    setLoading(false);
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#665CF0]"></div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  // Show error if user is not available
  if (!user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-red-600">Please log in to create a listing.</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Listing</h1>
            <p className="text-gray-600">Share a resource with your church community</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent"
                  placeholder="Enter a descriptive title"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent"
                  placeholder="Describe the item and any relevant details"
                />
              </div>

              {/* Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Listing Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent"
                >
                  <option value="">Select listing type</option>
                  <option value="Give Away">Give Away</option>
                  <option value="Sell">Sell</option>
                  <option value="Share">Share</option>
                                                  </select>
                
                {/* Payment setup notice for Sell option */}
                {formData.type === 'Sell' && user && (
                  !user.stripeAccountId || !user.stripeChargesEnabled || !user.stripePayoutsEnabled || !user.stripeDetailsSubmitted
                ) && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Payment account required:</strong> To sell items, you'll need to set up a payment account. 
                      Don't worry, we'll help you set this up!
                    </p>
                  </div>
                )}
              </div>

              {/* Price (only for Sell listings) */}
                {formData.type === 'Sell' && (
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent placeholder:text-gray-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}

                {/* Category and Condition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    <option value="Books & Resources">Books & Resources</option>
                    <option value="Equipment & Tech">Equipment & Tech</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Event Items">Event Items</option>
                    <option value="Creative Assets">Creative Assets</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                    Condition *
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent"
                  >
                    <option value="">Select condition</option>
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>

              {/* ZIP Code */}
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{5}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent"
                  placeholder="12345"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image (optional)
                </label>
                <ImageUpload
                  onImageUploaded={handleImageUploaded}
                  onImageRemoved={handleImageRemoved}
                  currentImageUrl={uploadedImage?.url}
                  currentImagePath={uploadedImage?.path}
                  userId={user.uid}
                  folder="listings"
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#665CF0] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#5A52E8] focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Listing...' : 'Create Listing'}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}
