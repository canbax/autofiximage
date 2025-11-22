// Note: This service now uses face-api.js, not MediaPipe.
import { CropParams } from "../types";

import * as faceapi from 'face-api.js';



const MODEL_URL = '/models';
let loadModelsPromise: Promise<void> | null = null;

/**
 * Loads the required face detection models from the CDN.
 * This function is called automatically by detectFaces and ensures models
 * are only loaded once.
 */
export async function loadModels() {
  if (loadModelsPromise) return loadModelsPromise;

  loadModelsPromise = (async () => {
    try {
      await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
    } catch (error) {
      console.error("Failed to load face-api.js models:", error);
      loadModelsPromise = null; // Reset promise on failure so we can try again
      // Re-use existing translation key for the error message.
      throw new Error("error.faceDetectorInit");
    }
  })();

  return loadModelsPromise;
}

/**
 * Detects faces in an image using face-api.js.
 * @param image The HTMLImageElement to detect faces in.
 * @returns A promise that resolves to an array of face bounding boxes (CropParams).
 */
export async function detectFaces(image: HTMLImageElement): Promise<CropParams[]> {
  // Ensure models are loaded before trying to detect faces.
  await loadModels();

  // Using SsdMobilenetv1Options. A lower minConfidence can detect more faces if needed.
  const detections = await faceapi.detectAllFaces(image, new faceapi.SsdMobilenetv1Options());

  // Convert detections to our app's CropParams format and add some padding
  // for a more natural blur effect.
  return detections.map((detection) => {
      const { x: _x, y: _y, width: _width, height: _height } = detection.box;
      
      const paddingW = _width * 0.1;
      const paddingH = _height * 0.2;

      const x = Math.max(0, _x - paddingW);
      const y = Math.max(0, _y - paddingH);
      
      const newWidth = Math.min(image.naturalWidth - x, _width + paddingW * 2);
      const newHeight = Math.min(image.naturalHeight - y, _height + paddingH * 2);

      return {
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(newWidth),
          height: Math.round(newHeight),
      };
  });
}
