
import { downsampleImageToData } from './imageUtils';

/**
 * Analyzes an image to find the dominant skew angle.
 *
 * Algorithm Overview:
 * 1. Downsample: Reduces image size for faster processing (performance optimization).
 * 2. Grayscale: Converts pixel data to luminance values (simplifies edge detection).
 * 3. Sobel Operator: Calculates gradients (Gx, Gy) to find edge strength and direction.
 * 4. Histogram Voting: Edges "vote" for their angle in a histogram, weighted by strength.
 * 5. Peak Detection: Finds the most common angle (dominant line) after smoothing.
 *
 * @param img - The source image or canvas element.
 * @param downsampleSize - The target dimension for the longest side (default: 512px).
 * @returns The angle in degrees needed to rotate the image to be straight (e.g. -2.5).
 */
export function calculateSkewAngle(
    img: HTMLImageElement | HTMLCanvasElement,
    downsampleSize = 512
): number {
    // --- 1. Setup Canvas & Downsample ---
    const downsampled = downsampleImageToData(img, downsampleSize);
    if (!downsampled) {
        return 0;
    }
    const { width: w, height: h, data } = downsampled;

    // --- 2. Convert to Grayscale ---
    // Pre-calculating luminance speeds up the loop and simplifies Sobel logic.
    // Luminance = 0.299*R + 0.587*G + 0.114*B
    const gray = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
        const offset = i * 4;
        gray[i] = 0.299 * data[offset] + 0.587 * data[offset + 1] + 0.114 * data[offset + 2];
    }

    // --- 3. Edge Detection & Histogram Voting ---

    // We count angles in buckets. Range: [-45, +45] degrees.
    const BUCKET_PRECISION = 0.5; // Each bucket represents 0.5 degrees
    const NUM_BUCKETS = Math.ceil(90 / BUCKET_PRECISION);
    const histogram = new Float32Array(NUM_BUCKETS).fill(0);

    const MAGNITUDE_THRESHOLD = 50; // Ignore weak edges (noise/texture)

    // Iterate over pixels (excluding 1px border to handle 3x3 kernel safely)
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x;

            // Get surrounding pixel values from grayscale array
            // Layout:
            // TL T TR
            // L  C  R
            // BL B BR
            const tl = gray[idx - w - 1];
            const t = gray[idx - w];
            const tr = gray[idx - w + 1];
            const l = gray[idx - 1];
            const r = gray[idx + 1];
            const bl = gray[idx + w - 1];
            const b = gray[idx + w];
            const br = gray[idx + w + 1];

            // Apply Sobel Kernels

            // Gx (Horizontal Gradient)
            // -1  0  1
            // -2  0  2
            // -1  0  1
            const gx = -tl + tr - 2 * l + 2 * r - bl + br;

            // Gy (Vertical Gradient)
            // -1 -2 -1
            //  0  0  0
            //  1  2  1
            const gy = -tl - 2 * t - tr + bl + 2 * b + br;

            // Calculate Gradient Magnitude
            const magnitude = Math.sqrt(gx * gx + gy * gy);

            if (magnitude > MAGNITUDE_THRESHOLD) {
                // Calculate gradient direction (angle) in degrees
                const rad = Math.atan2(gy, gx);
                let deg = rad * (180 / Math.PI);

                // --- 4. Normalize Angle ---
                // We want the deviation from the nearest axis (0, 90, 180, -90).

                // 1. Map to [-90, 90] range
                if (deg < -90) deg += 180;
                if (deg > 90) deg -= 180;

                // 2. Map to [-45, 45] range relative to horizontal/vertical
                // If angle is 88°, it is -2° from vertical.
                // If angle is 2°, it is +2° from horizontal.
                let deviation = deg;
                if (deviation > 45) deviation -= 90;
                if (deviation < -45) deviation += 90;

                // --- 5. Vote in Histogram ---
                const bucketIndex = Math.round((deviation + 45) / BUCKET_PRECISION);
                if (bucketIndex >= 0 && bucketIndex < NUM_BUCKETS) {
                    // Weighted vote: stronger edges contribute more
                    histogram[bucketIndex] += magnitude;
                }
            }
        }
    }

    // --- 6. Find Peak & Smooth ---
    let maxVote = 0;
    let peakIndex = -1;

    // Simple Moving Average Smoothing (Window size +/- 2 buckets)
    const SMOOTHING_RADIUS = 2;

    for (let i = SMOOTHING_RADIUS; i < NUM_BUCKETS - SMOOTHING_RADIUS; i++) {
        let sum = 0;
        for (let j = -SMOOTHING_RADIUS; j <= SMOOTHING_RADIUS; j++) {
            sum += histogram[i + j];
        }
        const smoothedVote = sum / (2 * SMOOTHING_RADIUS + 1);

        if (smoothedVote > maxVote) {
            maxVote = smoothedVote;
            peakIndex = i;
        }
    }

    if (peakIndex === -1) return 0; // No dominant lines found

    // Convert bucket index back to angle
    const detectedAngle = (peakIndex * BUCKET_PRECISION) - 45;

    // --- 7. Sanity Check & Return ---
    // If the detected skew is too large, it might be an intentional diagonal composition.
    // We limit automatic correction to small adjustments.
    const MAX_SKEW_ANGLE = 25;
    if (Math.abs(detectedAngle) > MAX_SKEW_ANGLE) {
        return 0;
    }

    // Return the negative angle to create the counter-rotation
    return -detectedAngle;
}