import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";
import { CropParams } from "../types";

let faceDetector: FaceDetector | null = null;
let isInitializing = false;

async function initializeFaceDetector() {
  if (faceDetector) return;
  if (isInitializing) {
      // Avoid race conditions if called multiple times
      await new Promise(resolve => {
          const interval = setInterval(() => {
              if (faceDetector || !isInitializing) {
                  clearInterval(interval);
                  resolve(null);
              }
          }, 100);
      });
      return;
  }
  isInitializing = true;
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );
    faceDetector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
        delegate: "GPU",
      },
      runningMode: "IMAGE",
    });
  } catch (error) {
    console.error("Failed to initialize FaceDetector:", error);
    throw new Error("error.faceDetectorInit");
  } finally {
      isInitializing = false;
  }
}

export async function detectFaces(image: HTMLImageElement): Promise<CropParams[]> {
  await initializeFaceDetector();
  if (!faceDetector) {
    throw new Error("Face detector is not initialized.");
  }

  const result = faceDetector.detect(image);
  
  if (!result || result.detections.length === 0) {
    return [];
  }

  return result.detections.map(detection => {
    const box = detection.boundingBox;
    if (!box) return null;
    
    const { originX, originY, width, height } = box;
    
    // Ensure the bounding box is within the image dimensions
    const x = Math.max(0, Math.round(originX));
    const y = Math.max(0, Math.round(originY));
    const w = Math.min(Math.round(width), image.naturalWidth - x);
    const h = Math.min(Math.round(height), image.naturalHeight - y);

    return { x, y, width: w, height: h };
  }).filter((box): box is CropParams => box !== null && box.width > 0 && box.height > 0);
}
