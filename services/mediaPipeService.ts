// Note: This service now uses face-api.js, not MediaPipe.
import { CropParams } from "../types";

// face-api.js is loaded from a script tag in index.html, so it's available globally.
// We declare it here to make TypeScript happy.
declare const faceapi: any;

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights';
let modelsLoaded = false;

/**
 * Loads the required face detection models from the CDN.
 * This function is called automatically by detectFaces and ensures models
 * are only loaded once.
 */
async function loadModels() {
  if (modelsLoaded) return;
  try {
    // Using SsdMobilenetv1, which is more accurate than TinyFaceDetector, to improve reliability.
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    modelsLoaded = true;
  } catch (error) {
    console.error("Failed to load face-api.js models:", error);
    // Re-use existing translation key for the error message.
    throw new Error("error.faceDetectorInit");
  }
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
  return detections.map((detection: any) => {
      const { _x, _y, _width, _height } = detection.box;
      
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