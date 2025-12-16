import { CropParams } from "../types";
import * as faceDetection from '@tensorflow-models/face-detection';
import '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

let detectorPromise: Promise<faceDetection.FaceDetector> | null = null;

/**
 * Loads the face detection model.
 * This function is called automatically by detectFaces and ensures the model
 * is only loaded once.
 */
export async function loadModels() {
  if (detectorPromise) return detectorPromise;

  detectorPromise = (async () => {
    try {
      const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
      const detectorConfig: faceDetection.MediaPipeFaceDetectorTfjsModelConfig = {
        runtime: 'tfjs',
        maxFaces: 30,
        modelType: 'full'
      };
      return await faceDetection.createDetector(model, detectorConfig);
    } catch (error) {
      console.error("Failed to load face detection model:", error);
      detectorPromise = null;
      throw new Error("error.faceDetectorInit");
    }
  })();

  return detectorPromise;
}

await loadModels();
/**
 * Detects faces in an image using TensorFlow.js face-detection.
 * @param image The HTMLImageElement to detect faces in.
 * @returns A promise that resolves to an array of face bounding boxes (CropParams).
 */
export async function detectFaces(image: HTMLImageElement): Promise<CropParams[]> {
  const detector = await loadModels();

  try {
    const faces = await detector.estimateFaces(image);

    // Convert detections to our app's CropParams format and add some padding
    return faces.map((face) => {
      const { xMin, yMin, width: _width, height: _height } = face.box;

      const paddingW = _width * 0.1;
      const paddingH = _height * 0.2;

      const x = Math.max(0, xMin - paddingW);
      const y = Math.max(0, yMin - paddingH);

      const newWidth = Math.min(image.naturalWidth - x, _width + paddingW * 2);
      const newHeight = Math.min(image.naturalHeight - y, _height + paddingH * 2);

      return {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(newWidth),
        height: Math.round(newHeight),
      };
    });
  } catch (error) {
    console.error("Error detecting faces:", error);
    return [];
  }
}
