import { downsampleImageToData, convertImageDataToGrayscale } from './imageUtils';

/**
 * Analyzes an image to find the dominant skew angle using the Hough Transform.
 *
 * Algorithm Overview:
 * 1. Downsample: Reduces image size for faster processing.
 * 2. Grayscale: Converts to luminance.
 * 3. Edge Detection (Sobel): Creates a binary edge map, ignoring weak edges.
 * 4. Hough Transform:
 *    - Uses a voting system to find straight lines.
 *    - Restricted to angles near 0° (vertical), 90° (horizontal), and 180° (vertical).
 *    - Ignores diagonal lines to avoid false positives from composition/perspective.
 * 5. Peak Detection: Identifies the strongest line (most votes).
 * 6. Angle Calculation: Converts the Hough angle to a rotation correction angle.
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
    // We downsample to keep processing fast (Hough is expensive O(N*M))
    const downsampled = downsampleImageToData(img, downsampleSize);
    if (!downsampled) {
        return 0;
    }
    const { width: w, height: h, data } = downsampled;

    // --- 2. Convert to Grayscale ---
    const gray = convertImageDataToGrayscale(data, w, h);

    // --- 3. Edge Detection (Sobel) ---
    // We need a binary edge map for Hough. We'll use a thresholded gradient magnitude.
    const edges = new Uint8ClampedArray(w * h); // 1 = edge, 0 = background
    const MAGNITUDE_THRESHOLD = 50;
    let edgePointCount = 0;

    // Iterate excluding border pixels
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x;

            // Simple Sobel kernel application
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

            const gx = -tl + tr - 2 * l + 2 * r - bl + br;
            const gy = -tl - 2 * t - tr + bl + 2 * b + br;
            const mag = Math.sqrt(gx * gx + gy * gy);

            if (mag > MAGNITUDE_THRESHOLD) {
                edges[idx] = 1;
                edgePointCount++;
            }
        }
    }

    // Optimization: If too few edges, return 0 (plain image)
    if (edgePointCount < 100) return 0;

    // --- 4. Hough Transform ---

    // Configuration
    const ANGLE_STEP = 0.5; // Precision in degrees
    // We only scan angles that correspond to "almost horizontal" or "almost vertical" lines.
    // In Hough space (normal representation):
    // Theta   0° (+/- 20) -> Vertical lines (Normal is Horizontal 0°)
    // Theta  90° (+/- 20) -> Horizontal lines (Normal is Vertical 90°)
    // Theta 180° (+/- 20) -> Vertical lines (Normal is Horizontal 180°)

    // We'll define a list of theta ranges to scan.
    // Ranges: [min, max]
    const SCAN_RANGES = [
        [0, 20],        // Vertical (0-20)
        [70, 110],      // Horizontal
        [160, 180]      // Vertical (160-180)
    ];

    // Precompute Trig Tables for scanned angles
    // This maps a linear index `t` to { cos, sin, originalAngle }
    const lookupTable: { cos: number; sin: number; angle: number }[] = [];

    SCAN_RANGES.forEach(([start, end]) => {
        for (let deg = start; deg < end; deg += ANGLE_STEP) {
            const rad = (deg * Math.PI) / 180.0;
            lookupTable.push({
                cos: Math.cos(rad),
                sin: Math.sin(rad),
                angle: deg
            });
        }
    });

    // Accumulator Dimensions
    // Max Rho is diagonal distance
    const maxRho = Math.ceil(Math.sqrt(w * w + h * h));
    const rhoCount = 2 * maxRho + 1; // -maxRho to +maxRho
    const thetaCount = lookupTable.length;

    // Flattened accumulator array: [thetaIndex][rhoIndex]
    const accumulator = new Int32Array(thetaCount * rhoCount);

    // Vote
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (edges[y * w + x] === 1) {
                // For each edge point, cast votes for all possible angles
                for (let t = 0; t < thetaCount; t++) {
                    const { cos, sin } = lookupTable[t];
                    const rho = x * cos + y * sin;
                    const rhoIndex = Math.round(rho + maxRho);

                    if (rhoIndex >= 0 && rhoIndex < rhoCount) {
                        accumulator[t * rhoCount + rhoIndex]++;
                    }
                }
            }
        }
    }

    // --- 5. Find Peak ---
    // We look for the single bucket with the most votes.

    let maxVotes = 0;
    let bestThetaIndex = -1;

    for (let t = 0; t < thetaCount; t++) {
        for (let r = 0; r < rhoCount; r++) {
            const votes = accumulator[t * rhoCount + r];
            if (votes > maxVotes) {
                maxVotes = votes;
                bestThetaIndex = t;
            }
        }
    }

    // Threshold: If the best line isn't "long" enough, ignore.
    const MIN_VOTE_THRESHOLD = w * 0.2; // e.g., line must be at least 20% of image width
    if (maxVotes < MIN_VOTE_THRESHOLD) {
        return 0;
    }

    // --- 6. Calculate Skew Correcton ---
    const bestThetaDeg = lookupTable[bestThetaIndex].angle; // e.g., 88.5 or 2.0

    // Convert Normal Angle (Theta) to Skew Deviation
    // Vertical line (normal approx 0° or 180°) -> rotate image to align with Y axis
    // Horizontal line (normal approx 90°) -> rotate image to align with X axis

    let skew = 0;

    if (bestThetaDeg >= 0 && bestThetaDeg <= 45) {
        // Near vertical (0°)
        // If theta is 2°, line normal is 2°, line itself is 92° (vertical-ish).
        // To make it vertical (90°), we need to rotate?
        // Wait, Hough Theta is the angle of the NORMAL vector (perpendicular to line).
        // If Normal is 0° (Horizontal), the Line is Vertical (90°).
        // If Normal is 90° (Vertical), the Line is Horizontal (0°).

        // If Theta = 2° (Normal is slightly tilted), Line is 92°.
        // Deviation from Vertical (90°) is +2°.
        skew = bestThetaDeg - 0;
    } else if (bestThetaDeg >= 45 && bestThetaDeg <= 135) {
        // Near horizontal (90°)
        // Normal is 90°. Line is Horizontal (0°).
        // If Theta = 92°, Normal is 92°, Line is -2°.
        // Deviation from Horizontal (0°) is...
        // Let's visualize: 
        // Theta 90 -> Line 0 (perfect horizontal).
        // Theta 88 -> Line +2.
        // Skew = Theta - 90. 
        // Example: Theta 88. Skew = -2. Rotation needed = +2 relative to horizontal.
        skew = bestThetaDeg - 90;
    } else {
        // Near vertical (180°)
        // Normal is 180°. Line is Vertical (270°/-90°).
        skew = bestThetaDeg - 180;
    }

    // We only want to correct small skews (e.g. up to 20 degrees)
    // If it detects a 45 degree line, it's probably diagonal design, not skew.
    if (Math.abs(skew) > 20) {
        return 0;
    }

    // Return negative for counter-rotation
    return -skew;
}