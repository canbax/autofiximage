import React from 'react';
import { CropParams } from '../types';

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
