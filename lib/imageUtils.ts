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