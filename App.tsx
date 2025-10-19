import React, { useState, useEffect, useCallback } from 'react';
import { ImageEditor } from './components/ImageEditor';
import { ControlPanel } from './components/ControlPanel';
import { CropParams } from './types';
import { getAutoCorrection } from './services/geminiService';
import Navbar from './components/Navbar';
import { useTranslation } from './hooks/useTranslation';
import LandingPage from './components/LandingPage';
import AdBanner from './components/AdBanner';

const DEFAULT_CROP: CropParams = { x: 0, y: 0, width: 100, height: 100 };
const DEFAULT_ROTATION = 0;

// TODO: Replace with your own AdSense Client and Slot IDs
const AD_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX';
const AD_SLOT_SIDE = '1234567890';
const AD_SLOT_BOTTOM = '1234567891';


const App: React.FC = () => {
  const { t } = useTranslation();
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
  
  const handleClearImage = () => {
    setOriginalFile(null);
    setImage(null);
    setError(null);
    setRotation(DEFAULT_ROTATION);
    setCrop(DEFAULT_CROP);
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
      alert(t('alert.noImage'));
      return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      alert(t('alert.noContext'));
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
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-gray-100 pt-16">
        <div className="flex justify-center w-full px-4">
          
          <aside className="hidden lg:flex w-40 sticky top-20 h-[calc(100vh-6rem)] flex-shrink-0 mr-6 items-center justify-center">
            <AdBanner
              className="w-full h-full"
              data-ad-client={AD_CLIENT}
              data-ad-slot={AD_SLOT_SIDE}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </aside>

          <div
            className="flex-grow w-full max-w-7xl"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
              backgroundSize: '2rem 2rem',
            }}
          >
            <main className="w-full min-h-[calc(100vh-4rem)] flex-grow flex flex-col justify-center py-8">
              {!image ? (
                <LandingPage onImageUpload={handleImageUpload} />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[75vh] w-full">
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
                      onClearImage={handleClearImage}
                      isLoading={isLoading}
                      keepCropperVertical={keepCropperVertical}
                      setKeepCropperVertical={setKeepCropperVertical}
                    />
                  </div>
                </div>
              )}
              {error && image && (
                  <div className="mt-4 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-md text-center max-w-xl mx-auto">
                      <strong>{t('error.title')}</strong> {error === 'Failed to get auto-correction from AI. Please try again.' ? t('error.ai') : error}
                  </div>
              )}
            </main>
          </div>
          
          <aside className="hidden lg:flex w-40 sticky top-20 h-[calc(100vh-6rem)] flex-shrink-0 ml-6 items-center justify-center">
            <AdBanner
              className="w-full h-full"
              data-ad-client={AD_CLIENT}
              data-ad-slot={AD_SLOT_SIDE}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </aside>
        </div>
        
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-gray-800/80 backdrop-blur-sm z-20 flex items-center justify-center border-t border-gray-700">
           <AdBanner
              className="w-full"
              data-ad-client={AD_CLIENT}
              data-ad-slot={AD_SLOT_BOTTOM}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
        </div>

        <div className="lg:hidden h-16"></div> 
      </div>
    </>
  );
};

export default App;
