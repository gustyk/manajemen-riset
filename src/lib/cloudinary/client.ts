// Helper Cloudinary untuk optimasi URL dan upload foto kuitansi

export function getOptimizedImageUrl(publicId: string, options: { width?: number; quality?: number | string } = {}) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return publicId;

  const widthParam = options.width ? `w_${options.width},` : '';
  const qualityParam = options.quality ? `q_${options.quality},` : 'q_auto,';

  return `https://res.cloudinary.com/${cloudName}/image/upload/${widthParam}${qualityParam}f_auto/${publicId}`;
}
