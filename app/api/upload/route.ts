import "server-only";
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { created, apiError } from "@/lib/api-response";

export const runtime = "nodejs";

// File upload validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];

export async function POST(req: NextRequest) {
  try {
    // Check for file first (before authentication)
    const form = await req.formData().catch(() => new FormData());
    const file = form.get("file") as File | null;
    if (!file) return apiError("VALIDATION_ERROR", "No file provided", 400);

    // Validate file is actually a File object
    if (!(file instanceof File)) {
      return apiError("VALIDATION_ERROR", "Invalid file upload", 400);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return apiError(
        "VALIDATION_ERROR",
        `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
        400,
      );
    }

    // Validate file size is not zero
    if (file.size === 0) {
      return apiError("VALIDATION_ERROR", "File is empty", 400);
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return apiError(
        "VALIDATION_ERROR",
        `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}`,
        400,
      );
    }

    // Validate file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext),
    );
    if (!hasValidExtension) {
      return apiError(
        "VALIDATION_ERROR",
        `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
        400,
      );
    }

    // Now check authentication
    await requireAdmin();

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UNSIGNED_PRESET;
    if (!cloudName || !uploadPreset) {
      return apiError("BAD_REQUEST", "Image upload not available", 501);
    }

    const body = new FormData();
    body.append("file", file);
    body.append("upload_preset", uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body,
      },
    );
    const data = await res.json();
    if (!res.ok) return apiError("INTERNAL_ERROR", "Upload failed", 400);

    return created({
      url: data.secure_url || data.url,
      publicId: data.public_id,
    });
  } catch (e: any) {
    return handleApiError(e);
  }
}
