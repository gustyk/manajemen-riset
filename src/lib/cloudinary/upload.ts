// Utility untuk mengunggah file kuitansi/bukti belanja ke Cloudinary dari Server Action

export async function uploadToCloudinary(
  file: File,
  folder: string = 'sim_riset_receipts'
): Promise<{ secure_url: string; public_id: string } | { error: string }> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return { error: 'Kredensial Cloudinary belum lengkap di environment variable.' };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    const timestamp = Math.round(new Date().getTime() / 1000);

    // Buat signature SHA-1 untuk autentikasi API
    const crypto = await import('crypto');
    const signatureStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

    const formData = new FormData();
    formData.append('file', dataUri);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('folder', folder);
    formData.append('signature', signature);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error?.message || 'Gagal mengunggah file ke Cloudinary' };
    }

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (err: any) {
    return { error: err.message || 'Gagal memproses upload ke Cloudinary' };
  }
}
