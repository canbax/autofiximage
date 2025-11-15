import { GoogleGenAI, Type } from "@google/genai";
import { CropParams } from "../types";

let aiInstance: GoogleGenAI | null = null;

const getAiInstance = () => {
  if (!aiInstance) {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      // Throw an error that can be caught and displayed to the user.
      throw new Error("API_KEY environment variable not set. Auto-correction is unavailable.");
    }
    aiInstance = new GoogleGenAI({ apiKey: API_KEY });
  }
  return aiInstance;
};

const correctionSchema = {
  type: Type.OBJECT,
  properties: {
    rotation: {
      type: Type.NUMBER,
      description: "The suggested rotation angle in degrees to correct skew. Should be a small value, e.g., between -15 and 15."
    },
    crop: {
      type: Type.OBJECT,
      properties: {
        x: { type: Type.NUMBER, description: "Top-left x-coordinate of the crop box as a percentage (0-100)." },
        y: { type: Type.NUMBER, description: "Top-left y-coordinate of the crop box as a percentage (0-100)." },
        width: { type: Type.NUMBER, description: "Width of the crop box as a percentage (0-100)." },
        height: { type: Type.NUMBER, description: "Height of the crop box as a percentage (0-100)." }
      },
      required: ["x", "y", "width", "height"]
    }
  },
  required: ["rotation", "crop"]
};


export async function getAutoCorrection(
  base64ImageData: string,
  mimeType: string
): Promise<{ rotation: number; crop: CropParams }> {
  const prompt = `Analyze this image to find the main subject. Suggest a slight rotation correction (in degrees, between -15 and 15) to straighten the image if it's skewed. Also, suggest a crop (bounding box with x, y, width, height as percentages from 0 to 100) that centers the main subject and improves composition. The goal is a subtle, professional-looking adjustment. Provide your answer as a JSON object with 'rotation' and 'crop' keys only.`;

  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: correctionSchema,
      },
    });

    const jsonString = response.text;
    const result = JSON.parse(jsonString);
    
    // Basic validation
    if (
        typeof result.rotation === 'number' &&
        result.crop &&
        typeof result.crop.x === 'number' &&
        typeof result.crop.y === 'number' &&
        typeof result.crop.width === 'number' &&
        typeof result.crop.height === 'number'
    ) {
        return {
            rotation: result.rotation,
            crop: {
                x: Math.max(0, Math.min(100, result.crop.x)),
                y: Math.max(0, Math.min(100, result.crop.y)),
                width: Math.max(1, Math.min(100, result.crop.width)),
                height: Math.max(1, Math.min(100, result.crop.height)),
            }
        };
    } else {
        throw new Error("Invalid format received from AI");
    }

  } catch (error) {
    console.error("Gemini service error:", error);
    throw new Error("error.ai");
  }
}

const faceDetectionSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      x: { type: Type.INTEGER, description: "Top-left x-coordinate of the face bounding box in pixels." },
      y: { type: Type.INTEGER, description: "Top-left y-coordinate of the face bounding box in pixels." },
      width: { type: Type.INTEGER, description: "Width of the face bounding box in pixels." },
      height: { type: Type.INTEGER, description: "Height of the face bounding box in pixels." }
    },
    required: ["x", "y", "width", "height"]
  }
};

export async function detectFaces(
  base64ImageData: string,
  mimeType: string,
  imageWidth: number,
  imageHeight: number
): Promise<CropParams[]> {
  const prompt = `You are a strict face bounding box extractor.
Image size: width=${imageWidth} px, height=${imageHeight} px.
Return an array (possibly empty). Each element: { "x": INT, "y": INT, "width": INT, "height": INT }.
Constraints:
- x,y are top-left corner, origin (0,0) at top-left.
- 0 <= x <= ${imageWidth - 1}
- 0 <= y <= ${imageHeight - 1}
- width >= 1, height >= 1
- x + width <= ${imageWidth}
- y + height <= ${imageHeight}
- Integers only. No decimals. No extra fields.
If no faces: [].
Output JSON only.`;

  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData.replace(/^data:[^;]+;base64,/, ""), // sanitize
              mimeType
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: faceDetectionSchema
      }
    });

    const jsonString = response.text;
    const result = JSON.parse(jsonString);

    if (!Array.isArray(result)) throw new Error("Invalid format received from AI for face detection");

    return result
      .filter(f => Number.isFinite(f.x) && Number.isFinite(f.y) && Number.isFinite(f.width) && Number.isFinite(f.height))
      .map(f => {
        let x = Math.max(0, Math.round(f.x));
        let y = Math.max(0, Math.round(f.y));
        let w = Math.max(1, Math.round(f.width));
        let h = Math.max(1, Math.round(f.height));
        if (x + w > imageWidth) w = imageWidth - x;
        if (y + h > imageHeight) h = imageHeight - y;
        return { x, y, width: w, height: h };
      });
  } catch (error) {
    console.error("Gemini service error (face detection):", error);
    throw new Error("error.ai");
  }
}