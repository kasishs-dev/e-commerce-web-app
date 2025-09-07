// utils/imageUtils.js

// Get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-product.jpg';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a relative path starting with /uploads, prepend the backend URL
  if (imagePath.startsWith('/uploads/')) {
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${imagePath}`;
  }
  
  // If it's just a filename, assume it's in uploads
  if (!imagePath.startsWith('/')) {
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/${imagePath}`;
  }
  
  return imagePath;
};

// Get optimized image URL for Next.js Image component
export const getOptimizedImageUrl = (imagePath, width = 400, height = 400) => {
  const baseUrl = getImageUrl(imagePath);
  
  // For external URLs, return as is
  if (baseUrl.startsWith('http')) {
    return baseUrl;
  }
  
  // For local uploads, you might want to add image optimization
  return baseUrl;
};