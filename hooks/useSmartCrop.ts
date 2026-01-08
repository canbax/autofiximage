import { useState, useEffect } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs'; // Loads the backend (WebGL)

interface CropBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const useSmartCrop = (enabled: boolean = false) => {
    const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
    const [isReady, setIsReady] = useState(false);

    // Load the model only when enabled (e.g. when image is uploaded)
    useEffect(() => {
        if (!enabled || model) return; // Don't load if not enabled or already loaded

        const loadModel = async () => {
            try {
                // 'lite_mobilenet_v2' is faster and smaller than default
                const loadedModel = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
                setModel(loadedModel);
                setIsReady(true);
            } catch (err) {
                console.error("Failed to load AI model", err);
            }
        };
        loadModel();
    }, [enabled, model]);

    const getSmartCrop = async (
        imgElement: HTMLImageElement,
        aspectRatio: number = 1 // e.g., 16/9
    ): Promise<CropBox> => {
        if (!model) throw new Error("AI Model not loaded");

        // 1. AI Detection
        const predictions = await model.detect(imgElement);

        // 2. Fallback: If no objects found, return center crop
        if (predictions.length === 0) {
            return getCenterCrop(imgElement.width, imgElement.height, aspectRatio);
        }

        // 3. Find Union Box of all detected objects
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        predictions.forEach(pred => {
            // pred.bbox = [x, y, width, height]
            const [x, y, w, h] = pred.bbox;
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x + w > maxX) maxX = x + w;
            if (y + h > maxY) maxY = y + h;
        });

        // 4. Aesthetic Expansion (Add 20% padding)
        const padding = 0.2;
        const unionW = maxX - minX;
        const unionH = maxY - minY;

        let cropX = Math.max(0, minX - unionW * padding);
        let cropY = Math.max(0, minY - unionH * padding);
        let cropW = Math.min(imgElement.width, unionW * (1 + padding * 2));
        let cropH = Math.min(imgElement.height, unionH * (1 + padding * 2));

        // 5. Force Aspect Ratio
        // Adjust the box to match requested aspect ratio while keeping the subject centered
        const currentRatio = cropW / cropH;

        if (currentRatio < aspectRatio) {
            // Box is too tall, make it wider
            const newWidth = cropH * aspectRatio;
            const diff = newWidth - cropW;

            // Expand evenly from center
            let leftExpansion = diff / 2;
            let rightExpansion = diff / 2;

            // If expanding left goes out of bounds, push right
            if (cropX - leftExpansion < 0) {
                const overflow = Math.abs(cropX - leftExpansion);
                rightExpansion += overflow;
                leftExpansion = cropX; // reduce to 0
            }

            // If expanding right goes out of bounds, push left
            if (cropX + cropW + rightExpansion > imgElement.width) {
                const overflow = (cropX + cropW + rightExpansion) - imgElement.width;
                leftExpansion += overflow;
                rightExpansion = (imgElement.width - (cropX + cropW));
            }

            cropX = Math.max(0, cropX - leftExpansion);
            cropW = newWidth;
        } else {
            // Box is too wide, make it taller
            const newHeight = cropW / aspectRatio;
            const diff = newHeight - cropH;

            let topExpansion = diff / 2;
            let bottomExpansion = diff / 2;

            if (cropY - topExpansion < 0) {
                const overflow = Math.abs(cropY - topExpansion);
                bottomExpansion += overflow;
                topExpansion = cropY;
            }

            if (cropY + cropH + bottomExpansion > imgElement.height) {
                const overflow = (cropY + cropH + bottomExpansion) - imgElement.height;
                topExpansion += overflow;
                bottomExpansion = (imgElement.height - (cropY + cropH));
            }

            cropY = Math.max(0, cropY - topExpansion);
            cropH = newHeight;
        }

        // 6. Boundary Checks (Ensure we didn't go outside image)
        // The ratio adjustment logic above tries to handle this, but as a final safety:
        if (cropX < 0) cropX = 0;
        if (cropY < 0) cropY = 0;
        if (cropX + cropW > imgElement.width) {
            if (aspectRatio >= 1) { // Landscape or Square
                // If width is constrained, we might have to sacrifice aspect ratio or scale down.
                // For now, let's clamp width and re-adjust height to maintain aspect ratio if possible,
                // or just clamp both.
                cropW = imgElement.width - cropX;
                cropH = cropW / aspectRatio; // Maintain ratio
            } else {
                cropW = imgElement.width - cropX;
            }
        }
        if (cropY + cropH > imgElement.height) {
            if (aspectRatio < 1) { // Portrait
                cropH = imgElement.height - cropY;
                cropW = cropH * aspectRatio;
            } else {
                cropH = imgElement.height - cropY;
            }
        }

        // Final clamp to be absolutely sure
        cropW = Math.min(cropW, imgElement.width);
        cropH = Math.min(cropH, imgElement.height);


        return { x: cropX, y: cropY, width: cropW, height: cropH };
    };

    return { isReady, getSmartCrop };
};

// Simple helper for fallback
const getCenterCrop = (imgW: number, imgH: number, aspect: number): CropBox => {
    let w = imgW;
    let h = w / aspect;
    if (h > imgH) {
        h = imgH;
        w = h * aspect;
    }
    return {
        x: (imgW - w) / 2,
        y: (imgH - h) / 2,
        width: w,
        height: h
    };
};
