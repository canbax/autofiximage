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
      x: { type: Type.NUMBER, description: "Top-left x-coordinate of the face bounding box as a percentage (0-100)." },
      y: { type: Type.NUMBER, description: "Top-left y-coordinate of the face bounding box as a percentage (0-100)." },
      width: { type: Type.NUMBER, description: "Width of the face bounding box as a percentage (0-100)." },
      height: { type: Type.NUMBER, description: "Height of the face bounding box as a percentage (0-100)." }
    },
    required: ["x", "y", "width", "height"]
  }
};

export async function detectFaces(
  base64ImageData: string,
  mimeType: string
): Promise<CropParams[]> {
  const prompt = `Analyze this image and identify all human faces. For each face, provide a bounding box with its top-left corner coordinates (x, y) and its dimensions (width, height). Express all values as percentages (0-100) of the total image dimensions. If no faces are found, return an empty array. Return the result as a JSON array of objects.`;

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
        responseSchema: faceDetectionSchema,
      },
    });

    const jsonString = response.text;
    const result = JSON.parse(jsonString);
    
    // Validate the result
    if (Array.isArray(result)) {
      return result.map(face => ({
        x: Math.max(0, Math.min(100, face.x)),
        y: Math.max(0, Math.min(100, face.y)),
        width: Math.max(1, Math.min(100, face.width)),
        height: Math.max(1, Math.min(100, face.height)),
      }));
    } else {
      throw new Error("Invalid format received from AI for face detection");
    }

  } catch (error) {
    console.error("Gemini service error (face detection):", error);
    throw new Error("error.ai");
  }
}