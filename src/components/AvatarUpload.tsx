'use client';

import { useState, useRef } from 'react';
import { uploadImage, compressImage, deleteImage as deleteImageFromStorage, UploadResult } from '@/lib/imageUpload';
import { PhotoIcon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface AvatarUploadProps {
  onAvatarUploaded: (result: UploadResult) => void;
  onAvatarRemoved?: (storagePath: string) => void;
  currentAvatarUrl?: string;
  currentAvatarPath?: string;
  userId: string;
  disabled?: boolean;
}

export default function AvatarUpload({
  onAvatarUploaded,
  onAvatarRemoved,
  currentAvatarUrl,
  currentAvatarPath,
  userId,
  disabled = false
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError('');
    setUploading(true);

    try {
      const file = files[0];

      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size (2MB limit for avatars)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        throw new Error('Avatar image must be less than 2MB');
      }

      // Compress image (avatars should be small)
      const compressedFile = await compressImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.8
      });

      // Upload to Firebase Storage in avatars folder
      const result = await uploadImage(compressedFile, 'avatars', userId);
      onAvatarUploaded(result);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    }

    setUploading(false);
  };

  const handleRemoveAvatar = async () => {
    if (!currentAvatarPath || !onAvatarRemoved) return;

    try {
      await deleteImageFromStorage(currentAvatarPath);
      onAvatarRemoved(currentAvatarPath);
    } catch (error) {
      console.error('Error removing avatar:', error);
      setError('Failed to remove avatar');
    }
  };

  const handleClick = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  return (
    <div className="space-y-4">
      {/* Current Avatar Display */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          {/* Avatar Preview */}
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
            {currentAvatarUrl ? (
              <Image
                src={currentAvatarUrl}
                alt="Profile avatar"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserCircleIcon className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Remove Button */}
          {currentAvatarUrl && onAvatarRemoved && (
            <button
              onClick={handleRemoveAvatar}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              title="Remove avatar"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}

          {/* Upload Progress Overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 mb-1">Profile Photo</h3>
          <p className="text-xs text-gray-500 mb-3">
            JPG, PNG up to 2MB. Recommended: 400x400px square image.
          </p>
          
          {/* Upload Button */}
          <button
            onClick={handleClick}
            disabled={disabled || uploading}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {currentAvatarUrl ? 'Change Photo' : 'Upload Photo'}
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="sr-only"
        disabled={disabled}
      />

      {/* Drag & Drop Area (when no avatar) */}
      {!currentAvatarUrl && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <PhotoIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            {dragActive ? 'Drop your photo here' : 'Click or drag to upload your profile photo'}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
