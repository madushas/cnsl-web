/**
 * Cloudinary Upload Utility
 * Production-ready image upload to Cloudinary CDN
 */

interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  access_mode: string;
  original_filename: string;
}

interface UploadOptions {
  folder?: string;
  public_id?: string;
  tags?: string[];
  transformation?: Record<string, any>;
  format?: 'auto' | 'jpg' | 'png' | 'webp';
  quality?: 'auto' | number;
}

/**
 * Upload image buffer/blob to Cloudinary using unsigned preset
 * @param imageData - Buffer, Blob, or base64 string
 * @param options - Upload options
 * @returns Promise<string> - Secure URL of uploaded image
 */
export async function uploadToCloudinary(
  imageData: Buffer | Blob | string,
  options: UploadOptions = {}
): Promise<string> {
  let cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  let uploadPreset = process.env.CLOUDINARY_UNSIGNED_PRESET;
  
  // If individual env vars not set, try to extract from CLOUDINARY_URL
  if (!cloudName && process.env.CLOUDINARY_URL) {
    try {
      const url = new URL(process.env.CLOUDINARY_URL);
      cloudName = url.hostname;
    } catch (error) {
      console.error('Invalid CLOUDINARY_URL format:', error);
    }
  }
  
  // For unsigned uploads, we need a preset. If not set, use a default one
  if (!uploadPreset) {
    uploadPreset = 'ml_default'; // Cloudinary's default unsigned preset
    console.warn('CLOUDINARY_UNSIGNED_PRESET not set, using default preset. This may fail if not configured in Cloudinary.');
  }
  
  console.log(`Using upload preset: ${uploadPreset}`);
  
  if (!cloudName) {
    console.error('Cloudinary configuration missing:', {
      CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_URL: !!process.env.CLOUDINARY_URL,
    });
    throw new Error('Cloudinary cloud name not found. Set CLOUDINARY_CLOUD_NAME or CLOUDINARY_URL');
  }

  console.log(`Uploading to Cloudinary: ${cloudName}, preset: ${uploadPreset}`);

  // Prepare form data
  const formData = new FormData();
  
  // Convert different input types to appropriate format
  if (imageData instanceof Buffer) {
    const blob = new Blob([new Uint8Array(imageData)], { type: 'image/png' });
    formData.append('file', blob);
  } else if (imageData instanceof Blob) {
    formData.append('file', imageData);
  } else if (typeof imageData === 'string') {
    // Handle base64 data URLs
    formData.append('file', imageData);
  } else {
    throw new Error('Unsupported image data type');
  }

  // Add upload preset (required for unsigned uploads)
  formData.append('upload_preset', uploadPreset);
  
  // Add optional parameters
  if (options.folder) {
    formData.append('folder', options.folder);
  }
  
  if (options.public_id) {
    formData.append('public_id', options.public_id);
  }
  
  if (options.tags && options.tags.length > 0) {
    formData.append('tags', options.tags.join(','));
  }

  // Note: format and quality parameters are not allowed in unsigned uploads
  // These are handled by the upload preset configuration in Cloudinary dashboard
  
  if (options.quality && options.quality !== 'auto') {
    // Only add quality if the upload preset allows it
    console.log(`Quality setting ${options.quality} will be ignored for unsigned upload`);
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary upload failed: ${response.status} ${errorText}`);
    }

    const result: CloudinaryUploadResponse = await response.json();
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}



/**
 * Upload QR code to Cloudinary
 * @param qrCodeData - QR code as data URL or buffer
 * @param ticketNumber - Ticket number for naming
 * @returns Promise<string> - CDN URL
 */
export async function uploadQRCode(
  qrCodeData: string | Buffer | Blob,
  ticketNumber: string
): Promise<string> {
  try {
    return await uploadToCloudinary(qrCodeData, {
      folder: 'tickets/qr-codes',
      public_id: `qr_${ticketNumber}`,
      tags: ['qr-code', 'ticket']
    });
  } catch (error) {
    console.warn('QR upload failed with custom preset, trying with minimal options:', error);
    // Fallback: try with minimal options (no folder, no custom public_id)
    return await uploadToCloudinary(qrCodeData, {
      tags: ['qr-code', 'ticket']
    });
  }
}

/**
 * Upload ticket image to Cloudinary
 * @param ticketBlob - Ticket image as blob
 * @param ticketNumber - Ticket number for naming
 * @returns Promise<string> - CDN URL
 */
export async function uploadTicketImage(
  ticketBlob: Blob,
  ticketNumber: string
): Promise<string> {
  try {
    return await uploadToCloudinary(ticketBlob, {
      folder: 'tickets/images',
      public_id: `ticket_${ticketNumber}`,
      tags: ['ticket', 'generated']
    });
  } catch (error) {
    console.warn('Ticket image upload failed with custom preset, trying with minimal options:', error);
    // Fallback: try with minimal options
    return await uploadToCloudinary(ticketBlob, {
      tags: ['ticket', 'generated']
    });
  }
}