// Cloudinary configuration for client-side use
const cloudinaryConfig = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
};

export { cloudinaryConfig };

// Generate optimized image URL
export function getOptimizedImageUrl(publicId, options = {}) {
  if (!publicId) return '';
  
  const cloudName = cloudinaryConfig.cloud_name;
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto',
    width: 'auto',
    height: 'auto',
    crop: 'scale'
  };
  
  const params = { ...defaultOptions, ...options };
  const paramString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== 'auto')
    .map(([key, value]) => `${key}_${value}`)
    .join(',');
  
  return paramString ? `${baseUrl}/${paramString}/${publicId}` : `${baseUrl}/${publicId}`;
}

// Generate video thumbnail
export function getVideoThumbnail(publicId, options = {}) {
  if (!publicId) return '';
  
  const cloudName = cloudinaryConfig.cloud_name;
  const baseUrl = `https://res.cloudinary.com/${cloudName}/video/upload`;
  
  const defaultOptions = {
    format: 'jpg',
    quality: 'auto',
    width: 400,
    height: 'auto',
    crop: 'scale'
  };
  
  const params = { ...defaultOptions, ...options };
  const paramString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== 'auto')
    .map(([key, value]) => `${key}_${value}`)
    .join(',');
  
  return paramString ? `${baseUrl}/${paramString}/${publicId}` : `${baseUrl}/${publicId}`;
}