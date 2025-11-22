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
  const prompt = `Analyze this image to find the main subject(s). If there are multiple subjects, ensure the crop includes all of them. Identify the horizon line or the most prominent straight line in the background. Use this line to calculate the rotation needed to straighten the image. Suggest a slight rotation correction (in degrees, between -15 and 15) to straighten the image if it's skewed. Suggest a crop (bounding box with x, y, width, height as percentages from 0 to 100) that centers the subject(s) and improves composition. CRITICAL: The crop MUST be strictly within the original image boundaries. If a rotation is applied, the crop MUST be smaller than the original image to avoid any black empty corners or edges. Do not include any areas outside the valid image data. Provide your answer as a JSON object with 'rotation' and 'crop' keys only.`;

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
