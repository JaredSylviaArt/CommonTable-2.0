'use client';

import { useState, useRef } from 'react';
import { uploadImage, compressImage, deleteImage as deleteImageFromStorage, UploadResult } from '@/lib/imageUpload';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface ImageUploadProps {
  onImageUploaded: (result: UploadResult) => void;
  onImageRemoved?: (storagePath: string) => void;
  currentImageUrl?: string;
  currentImagePath?: string;
  userId: string;
  folder?: string;
  maxImages?: number;
  disabled?: boolean;
}

export default function ImageUpload({
  onImageUploaded,
  onImageRemoved,
  currentImageUrl,
  currentImagePath,
  userId,
  folder = 'listings',
  maxImages = 1,
  disabled = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      const file = files[0]; // For now, handle single file

      // Compress image
      setUploadProgress(25);
      const compressedFile = await compressImage(file);

      // Upload to Firebase Storage
      setUploadProgress(50);
      const result = await uploadImage(compressedFile, folder, userId);

      setUploadProgress(100);
      onImageUploaded(result);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    }

    setUploading(false);
    setUploadProgress(0);
  };

  const handleRemoveImage = async () => {
    if (!currentImagePath) return;

    try {
      await deleteImageFromStorage(currentImagePath);
      if (onImageRemoved) {
        onImageRemoved(currentImagePath);
      }
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
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

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Current Image Display */}
      {currentImageUrl && (
        <div className="relative">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={currentImageUrl}
              alt="Current image"
              fill
              className="object-cover"
            />
          </div>
          <button
            onClick={handleRemoveImage}
            disabled={disabled}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Area */}
      {!currentImageUrl && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive
              ? 'border-[#665CF0] bg-[#665CF0]/5'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="sr-only"
            disabled={disabled}
          />

          <div className="text-center">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900">
                {dragActive ? 'Drop image here' : 'Click or drag to upload image'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG up to 5MB
              </p>
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#665CF0] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        <p>• Images are automatically compressed and optimized</p>
        <p>• Recommended size: 800x600 pixels or larger</p>
        <p>• Supported formats: JPG, PNG</p>
      </div>
    </div>
  );
}
