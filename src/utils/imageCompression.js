import imageCompression from 'browser-image-compression';

export async function compressImage(file) {
  // Skip compression for small files
  if (file.size < 500000) { // Skip if less than 500KB
    return file;
  }

  // Calculate target size based on original file size
  const targetSizeMB = file.size > 10000000 ? 1 : 2; // Stronger compression for files over 10MB
  
  const options = {
    maxSizeMB: targetSizeMB,
    maxWidthOrHeight: 2048,
    useWebWorker: true,
    initialQuality: 0.8,
    fileType: file.type,
    alwaysKeepResolution: false,
    onProgress: (progress) => console.log('Compression progress:', progress)
  };

  try {
    console.log('Starting compression for file:', {
      name: file.name,
      originalSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type
    });
    
    const compressedFile = await imageCompression(file, options);
    
    console.log('Compression completed:', {
      originalSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      compressedSize: (compressedFile.size / 1024 / 1024).toFixed(2) + ' MB',
      compressionRatio: ((1 - compressedFile.size / file.size) * 100).toFixed(1) + '%'
    });
    
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    return file; // fallback to original file if compression fails
  }
}