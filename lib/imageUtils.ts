import React from 'react';
import { CropParams } from '../types';

/**
 * Compresses and resizes an image file for AI analysis.
 * Resizes to a maximum dimension (default 1024px) and converts to JPEG.
 * This significantly reduces upload size and processing time without affecting analysis quality.
 * 
 * @param file The source file.
 * @param maxWidth The maximum width or height in pixels.
 * @param quality The JPEG quality (0 to 1).
 * @returns A Promise resolving to the base64 string (without data URI prefix).
 */
export function compressImageForAI(file: File, maxWidth = 1024, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.naturalWidth;
        let height = img.naturalHeight;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not create canvas context'));
          return;
        }

        // Draw white background in case of transparent PNGs being converted to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG for optimal compression/quality ratio for Vision tasks
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Return only the base64 part
        resolve(dataUrl.split(',')[1]);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Applies rotation and crop parameters to an image element and returns the result as a Blob.
 * This function uses the more accurate method where the cropper remains vertical while the image rotates beneath it.
 * @param image The source HTMLImageElement.
 * @param rotation The rotation angle in degrees.
 * @param crop The crop parameters as percentages.
 * @param outputFormat The desired output MIME type.
 * @returns A Promise that resolves with the resulting image Blob.
 */
export function applyCorrection(
  image: HTMLImageElement,
  rotation: number,
  crop: CropParams,
  outputFormat: string = 'image/png'
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return reject(new Error("Could not create canvas context."));
    }

    // Calculate crop dimensions in pixels
    const cropX = (crop.x / 100) * image.naturalWidth;
    const cropY = (crop.y / 100) * image.naturalHeight;
    const cropWidth = (crop.width / 100) * image.naturalWidth;
    const cropHeight = (crop.height / 100) * image.naturalHeight;

    // Create a temporary canvas large enough to hold the rotated image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      return reject(new Error("Could not create temporary canvas context."));
    }

    const w = image.naturalWidth;
    const h = image.naturalHeight;
    const rad = rotation * Math.PI / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));

    // Calculate the bounding box of the rotated image
    const boundingWidth = Math.ceil(w * cos + h * sin);
    const boundingHeight = Math.ceil(w * sin + h * cos);

    tempCanvas.width = boundingWidth;
    tempCanvas.height = boundingHeight;

    // Draw the rotated image onto the center of the temporary canvas
    tempCtx.translate(boundingWidth / 2, boundingHeight / 2);
    tempCtx.rotate(rad);
    tempCtx.drawImage(image, -w / 2, -h / 2);

    // The top-left of the original UNROTATED image space corresponds to this point on the temp canvas
    const originalImageTopLeftX = (boundingWidth - w) / 2;
    const originalImageTopLeftY = (boundingHeight - h) / 2;

    // Calculate where the crop selection starts on the temp canvas
    const cropSourceX = originalImageTopLeftX + cropX;
    const cropSourceY = originalImageTopLeftY + cropY;

    // Set final canvas size and copy the cropped area from the temp canvas
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    ctx.drawImage(tempCanvas, cropSourceX, cropSourceY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Canvas to Blob conversion failed."));
      }
    }, outputFormat, 0.95); // High quality for JPEGs

  });
}

/**
 * Computes the largest axis-aligned rectangle that stays fully inside the image
 * after rotating the image by a given angle. The rectangle is centered in the
 * image and guarantees no transparent/black corners when cropping after rotation.
 *
 * Note: This uses a well-known approximation formula which is accurate for
 * small-to-moderate angles typically produced by auto-straighten. For extreme
 * angles, the result falls back to clamping within image bounds.
 */
export function getSafeCenteredRectForRotation(
  image: { naturalWidth: number; naturalHeight: number },
  rotationDeg: number
): { x: number; y: number; width: number; height: number } {
  const w = image.naturalWidth;
  const h = image.naturalHeight;

  // Normalize angle to [0, 90] for symmetry
  let angle = Math.abs(rotationDeg % 180);
  if (angle > 90) angle = 180 - angle;
  const a = (angle * Math.PI) / 180;

  const c = Math.cos(a);
  const s = Math.sin(a);
  const denom = c * c - s * s; // = cos(2a)

  let rx: number;
  let ry: number;

  if (Math.abs(denom) < 1e-8) {
    // Near 45° the system becomes ill-conditioned. Use stable limits.
    // For a square (w == h), the exact limit is width = height = w / (c + s).
    // For non-square, fall back to intersecting constraints conservatively.
    const sum = c + s;
    if (Math.abs(w - h) < 1e-8) {
      rx = (w / sum) / 2;
      ry = (h / sum) / 2;
    } else {
      // Conservative fallback: ensure both constraints satisfied using min of per-constraint bounds.
      const rx1 = (w / 2) / Math.max(c, 1e-8); // if ry=0
      const rx2 = ((h / 2) - 0) / Math.max(s, 1e-8); // if ry=0 from second constraint
      rx = Math.min(rx1, rx2);
      const ry1 = (w / 2 - c * rx) / Math.max(s, 1e-8);
      const ry2 = (h / 2 - s * rx) / Math.max(c, 1e-8);
      ry = Math.max(0, Math.min(ry1, ry2));
    }
  } else {
    rx = (c * (w / 2) - s * (h / 2)) / denom;
    ry = (c * (h / 2) - s * (w / 2)) / denom;
  }

  // Convert half-sizes to full sizes and clamp within image bounds
  let safeW = Math.max(0, Math.min(w, 2 * rx));
  let safeH = Math.max(0, Math.min(h, 2 * ry));

  const x = Math.round((w - safeW) / 2);
  const y = Math.round((h - safeH) / 2);
  return { x, y, width: Math.round(safeW), height: Math.round(safeH) };
}

/**
 * Shrinks a given crop so that, after rotating the image by `rotationDeg`,
 * the cropped area is guaranteed to be fully covered by the rotated image.
 * This prevents black/transparent corners when `keepCropperVertical` is true.
 */
export function adjustCropForRotation(
  image: { naturalWidth: number; naturalHeight: number },
  crop: CropParams,
  rotationDeg: number
): CropParams {
  const safeRect = getSafeCenteredRectForRotation(image, rotationDeg);

  const nx = Math.max(crop.x, safeRect.x);
  const ny = Math.max(crop.y, safeRect.y);
  const nRight = Math.min(crop.x + crop.width, safeRect.x + safeRect.width);
  const nBottom = Math.min(crop.y + crop.height, safeRect.y + safeRect.height);

  if (nRight <= nx || nBottom <= ny) {
    // Crop lies completely outside the safe area. Fall back to safe rect.
    return { x: safeRect.x, y: safeRect.y, width: safeRect.width, height: safeRect.height };
  }

  return {
    x: Math.round(nx),
    y: Math.round(ny),
    width: Math.round(nRight - nx),
    height: Math.round(nBottom - ny),
  };
}

/**
 * Downsamples an image/canvas and returns the pixel data.
 * Used for analysis tasks like skew detection where full resolution is not needed.
 * 
 * @param img The source image or canvas.
 * @param downsampleSize The target dimension for the longest side.
 * @returns Object containing width, height, and pixel data, or null on failure.
 */
export function downsampleImageToData(
  img: HTMLImageElement | HTMLCanvasElement,
  downsampleSize: number
): { width: number; height: number; data: Uint8ClampedArray } | null {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    console.error("downsampleImageToData: Could not get canvas context");
    return null;
  }

  // Calculate scale to fit within downsampleSize
  const scale = Math.min(downsampleSize / img.width, downsampleSize / img.height);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  canvas.width = w;
  canvas.height = h;

  try {
    // Draw image resized
    ctx.drawImage(img, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);
    return { width: w, height: h, data: imageData.data };
  } catch (e) {
    console.error("downsampleImageToData: Error processing image", e);
    return null;
  }

}

/**
 * Converts ImageData to a Float32Array of grayscale luminance values.
 * Uses the formula: Luminance = 0.299*R + 0.587*G + 0.114*B
 * 
 * @param data The pixel data (RGBA)
 * @param width Width of the image
 * @param height Height of the image
 * @returns Float32Array containing grayscale values
 */
export function convertImageDataToGrayscale(
  data: Uint8ClampedArray,
  width: number,
  height: number
): Float32Array {
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const offset = i * 4;
    gray[i] = 0.299 * data[offset] + 0.587 * data[offset + 1] + 0.114 * data[offset + 2];
  }
  return gray;
}

/**
 * Applies Sobel edge detection to a grayscale image.
 * Returns a binary edge map where 1 indicates an edge and 0 indicates background.
 *
 * @param gray Grayscale image data (Float32Array or similar)
 * @param width Width of the image
 * @param height Height of the image
 * @param magnitudeThreshold Threshold for gradient magnitude to consider as an edge (default 50)
 * @returns Object containing the edge map and the count of edge points.
 */
export function applySobelEdgeDetection(
  gray: Float32Array,
  width: number,
  height: number,
  magnitudeThreshold: number = 50
): { edges: Uint8ClampedArray; edgePointCount: number } {
  const edges = new Uint8ClampedArray(width * height); // 1 = edge, 0 = background
  let edgePointCount = 0;

  // Iterate excluding border pixels
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;

      // Simple Sobel kernel application
      // TL T TR
      // L  C  R
      // BL B BR
      const tl = gray[idx - width - 1];
      const t = gray[idx - width];
      const tr = gray[idx - width + 1];
      const l = gray[idx - 1];
      const r = gray[idx + 1];
      const bl = gray[idx + width - 1];
      const b = gray[idx + width];
      const br = gray[idx + width + 1];

      const gx = -tl + tr - 2 * l + 2 * r - bl + br;
      const gy = -tl - 2 * t - tr + bl + 2 * b + br;
      const mag = Math.sqrt(gx * gx + gy * gy);

      if (mag > magnitudeThreshold) {
        edges[idx] = 1;
        edgePointCount++;
      }
    }
  }

  return { edges, edgePointCount };
}