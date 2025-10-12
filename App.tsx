import React, { useState, useEffect, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ImageEditor } from './components/ImageEditor';
import { ControlPanel } from './components/ControlPanel';
import { CropParams } from './types';
import { getAutoCorrection } from './services/geminiService';

const DEFAULT_CROP: CropParams = { x: 0, y: 0, width: 100, height: 100 };
const DEFAULT_ROTATION = 0;

const App: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState<number>(DEFAULT_ROTATION);
  const [crop, setCrop] = useState<CropParams>(DEFAULT_CROP);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [keepCropperVertical, setKeepCropperVertical] = useState<boolean>(true);


  useEffect(() => {
    if (!originalFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        handleReset();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(originalFile);
  }, [originalFile]);

  // Keyboard controls for cropper
  useEffect(() => {
    if (!image) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();

        setCrop(currentCrop => {
          const step = e.shiftKey ? 10 : 1; // Larger step with Shift key
          let newX = currentCrop.x;
          let newY = currentCrop.y;
    
          switch (e.key) {
            case 'ArrowUp':
              newY -= step;
              break;
            case 'ArrowDown':
              newY += step;
              break;
            case 'ArrowLeft':
              newX -= step;
              break;
            case 'ArrowRight':
              newX += step;
              break;
          }
    
          // Clamp position to stay within boundaries
          const clampedX = Math.max(0, Math.min(newX, 100 - currentCrop.width));
          const clampedY = Math.max(0, Math.min(newY, 100 - currentCrop.height));
          
          return {
            ...currentCrop,
            x: clampedX,
            y: clampedY,
          };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [image, setCrop]);
  
  const handleImageUpload = (file: File) => {
    setOriginalFile(file);
    setImage(null);
    setError(null);
  };

  const handleReset = useCallback(() => {
    setRotation(DEFAULT_ROTATION);
    setCrop(DEFAULT_CROP);
  }, []);

  const handleAutoCorrect = async () => {
    if (!image) return;
    setIsLoading(true);
    setError(null);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");
      ctx.drawImage(image, 0, 0);

      const dataUrl = canvas.toDataURL(originalFile?.type || 'image/jpeg');
      const base64Data = dataUrl.split(',')[1];
      
      const result = await getAutoCorrection(base64Data, originalFile?.type || 'image/jpeg');
      setRotation(result.rotation);
      setCrop(result.crop);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!image || !originalFile) {
      alert("No image to download.");
      return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      alert("Could not create canvas context for download.");
      return;
    }

    // Calculate crop dimensions in pixels
    const cropX = (crop.x / 100) * image.naturalWidth;
    const cropY = (crop.y / 100) * image.naturalHeight;
    const cropWidth = (crop.width / 100) * image.naturalWidth;
    const cropHeight = (crop.height / 100) * image.naturalHeight;

    if (keepCropperVertical) {
      // Create a temporary canvas large enough to hold the rotated image
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      const w = image.naturalWidth;
      const h = image.naturalHeight;
      const rad = rotation * Math.PI / 180;
      const sin = Math.sin(rad);
      const cos = Math.cos(rad);
      
      // Calculate the bounding box of the rotated image
      const boundingWidth = Math.ceil(Math.abs(w * cos) + Math.abs(h * sin));
      const boundingHeight = Math.ceil(Math.abs(w * sin) + Math.abs(h * cos));

      tempCanvas.width = boundingWidth;
      tempCanvas.height = boundingHeight;

      // Draw the rotated image onto the center of the temporary canvas
      tempCtx.translate(boundingWidth / 2, boundingHeight / 2);
      tempCtx.rotate(rad);
      tempCtx.drawImage(image, -w / 2, -h / 2);

      // The top-left of the original UNROTATED image space corresponds to this point on the temp canvas
      const originalImageTopLeftX = (boundingWidth - w) / 2;
      const originalImageTopLeftY = (boundingHeight - h) / 2;
      
      // Calculate where the crop selection starts on the temp canvas
      const cropSourceX = originalImageTopLeftX + cropX;
      const cropSourceY = originalImageTopLeftY + cropY;

      // Set final canvas size and copy the cropped area from the temp canvas
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      ctx.drawImage(tempCanvas, cropSourceX, cropSourceY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    } else {
      // Original logic for when cropper rotates with image
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      ctx.save();
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
      
      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0, 0,
        canvas.width,
        canvas.height
      );
      ctx.restore();
    }


    const link = document.createElement('a');
    link.download = `edited-${originalFile.name || 'image.png'}`;
    link.href = canvas.toDataURL(originalFile.type || 'image/png');
    link.click();
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
      <header className="w-full max-w-7xl mx-auto text-center mb-6">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          AI Image Auto-Corrector
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          Upload an image to manually edit or let AI perfect its rotation and crop.
        </p>
      </header>
      
      <main className="w-full max-w-7xl flex-grow">
        {!image ? (
          <div className="flex items-center justify-center h-full">
            <ImageUploader onImageUpload={handleImageUpload} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
            <div className="lg:col-span-2 h-full">
              <ImageEditor 
                image={image} 
                rotation={rotation} 
                crop={crop} 
                setCrop={setCrop} 
                keepCropperVertical={keepCropperVertical}
              />
            </div>
            <div className="lg:col-span-1 h-full">
              <ControlPanel
                rotation={rotation}
                setRotation={setRotation}
                crop={crop}
                setCrop={setCrop}
                onAutoCorrect={handleAutoCorrect}
                onReset={handleReset}
                onDownload={handleDownload}
                isLoading={isLoading}
                keepCropperVertical={keepCropperVertical}
                setKeepCropperVertical={setKeepCropperVertical}
              />
            </div>
          </div>
        )}
        {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-md text-center max-w-xl mx-auto">
                <strong>Error:</strong> {error}
            </div>
        )}
      </main>
    </div>
  );
};

export default App;