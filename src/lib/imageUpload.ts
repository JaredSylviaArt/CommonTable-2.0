import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload an image to Firebase Storage
 * @param file - The image file to upload
 * @param folder - Storage folder (e.g., 'listings', 'profiles')
 * @param userId - User ID for organizing files
 * @returns Promise with download URL and storage path
 */
export async function uploadImage(
  file: File, 
  folder: string = 'listings', 
  userId: string
): Promise<UploadResult> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }

  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error('Image must be less than 5MB');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${timestamp}_${cleanFileName}`;
  
  // Create storage reference
  const storagePath = `${folder}/${userId}/${fileName}`;
  const storageRef = ref(storage, storagePath);

  try {
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      path: storagePath
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
}

/**
 * Delete an image from Firebase Storage
 * @param storagePath - Path to the file in storage
 */
export async function deleteImage(storagePath: string): Promise<void> {
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw error for deletion failures - they're not critical
  }
}

/**
 * Resize and compress image before upload
 * @param file - Original image file
 * @param maxWidth - Maximum width in pixels
 * @param maxHeight - Maximum height in pixels
 * @param quality - JPEG quality (0-1)
 * @returns Promise with compressed file
 */
export function compressImage(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 600,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Generate a thumbnail URL from Firebase Storage URL
 * @param originalUrl - Original Firebase Storage URL
 * @param size - Thumbnail size (e.g., '200x200')
 * @returns Thumbnail URL (for future use with Firebase Extensions)
 */
export function getThumbnailUrl(originalUrl: string, size: string = '200x200'): string {
  // For now, return original URL
  // In production, you could use Firebase Extensions to generate thumbnails
  // or implement your own thumbnail generation
  return originalUrl;
}

/**
 * Upload multiple images
 * @param files - Array of image files
 * @param folder - Storage folder
 * @param userId - User ID
 * @param onProgress - Progress callback
 * @returns Promise with array of upload results
 */
export async function uploadMultipleImages(
  files: File[],
  folder: string = 'listings',
  userId: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      // Compress image before upload
      const compressedFile = await compressImage(file);
      
      // Upload compressed image
      const result = await uploadImage(compressedFile, folder, userId);
      results.push(result);
      
      // Report progress
      if (onProgress) {
        onProgress(((i + 1) / files.length) * 100);
      }
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      throw new Error(`Failed to upload ${file.name}`);
    }
  }
  
  return results;
}
