import imageCompression from 'browser-image-compression';

export async function compressImage(file) {
  // Skip compression for small files
  if (file.size < 500000) { // Skip if less than 500KB
    return file;
  }

  const options = {
    maxSizeMB: 1.5, // increased size limit for faster compression
    maxWidthOrHeight: 1600, // reduced max dimension
    useWebWorker: true,
    initialQuality: 0.7, // slightly reduced quality for faster compression
    fileType: file.type,
    alwaysKeepResolution: false // allow resolution reduction for better compression
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Error compressing image:', error);
    return file; // fallback to original file if compression fails
  }
}