import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ImageEditor } from './components/ImageEditor';
import { ControlPanel } from './components/ControlPanel';
import { CropParams } from './types';
import { getAutoCorrection } from './services/geminiService';
import Navbar from './components/Navbar';
import { useTranslation } from './hooks/useTranslation';
import LandingPage from './components/LandingPage';
import AdBanner from './components/AdBanner';
import { LoginDialog } from './components/LoginDialog';
import { PricingDialog } from './components/PricingDialog';
import { ApiDocsDialog } from './components/ApiDocsDialog';
import { fileToBase64 } from './lib/utils';
import { applyCorrection } from './lib/imageUtils';
import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';
import ContactPage from './components/ContactPage';

const DEFAULT_CROP: CropParams = { x: 0, y: 0, width: 0, height: 0 };
const DEFAULT_ROTATION = 0;

// TODO: Replace with your own AdSense Client and Slot IDs
const AD_CLIENT = 'ca-pub-9521603226003896';
const AD_SLOT_SIDE = '1234567890';
const AD_SLOT_BOTTOM = '1234567891';

type AppMode = 'crop-rotate' | 'resize';

const App: React.FC = () => {
  const { t } = useTranslation();
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState<number>(DEFAULT_ROTATION);
  const [crop, setCrop] = useState<CropParams>(DEFAULT_CROP);
  const [aspectRatioKey, setAspectRatioKey] = useState('free');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [keepCropperVertical, setKeepCropperVertical] = useState<boolean>(true);
  const [route, setRoute] = useState(window.location.hash);
  const [mode, setMode] = useState<AppMode>('crop-rotate');
  const [resizeWidth, setResizeWidth] = useState(0);
  const [resizeHeight, setResizeHeight] = useState(0);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleReset = useCallback(() => {
    setRotation(DEFAULT_ROTATION);
    if (image) {
      setCrop({
        x: 0,
        y: 0,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      setResizeWidth(image.naturalWidth);
      setResizeHeight(image.naturalHeight);
    } else {
      setCrop(DEFAULT_CROP);
      setResizeWidth(0);
      setResizeHeight(0);
    }
    setAspectRatioKey('free');
    setMode('crop-rotate');
  }, [image]);


  useEffect(() => {
    if (!originalFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setRotation(DEFAULT_ROTATION);
        setCrop({
          x: 0,
          y: 0,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
        setResizeWidth(img.naturalWidth);
        setResizeHeight(img.naturalHeight);
        setAspectRatioKey('free');
        setMode('crop-rotate');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(originalFile);
  }, [originalFile]);

  const numericAspectRatio = useMemo(() => {
    if (aspectRatioKey === 'free' || !image) {
      return null;
    }
    if (aspectRatioKey === 'original') {
      return image.naturalWidth / image.naturalHeight;
    }
    const ratioString = aspectRatioKey.split('-')[0];
    const parts = ratioString.split('/');
    if (parts.length === 2) {
      const [w, h] = parts.map(Number);
      if (h > 0 && w > 0) return w / h;
    }
    return null;
  }, [aspectRatioKey, image]);

  // Adjust crop when aspect ratio changes
  useEffect(() => {
    if (numericAspectRatio === null || !image) return;

    setCrop(c => {
      const currentCenter = { x: c.x + c.width / 2, y: c.y + c.height / 2 };
      let newWidth = c.width;
      let newHeight = Math.round(newWidth / numericAspectRatio);
      
      if (currentCenter.y + newHeight / 2 > image.naturalHeight || currentCenter.y - newHeight / 2 < 0) {
        newHeight = Math.min(image.naturalHeight, Math.round(currentCenter.y * 2), Math.round((image.naturalHeight - currentCenter.y) * 2));
        newWidth = Math.round(newHeight * numericAspectRatio);
      }
      if (currentCenter.x + newWidth / 2 > image.naturalWidth || currentCenter.x - newWidth / 2 < 0) {
        newWidth = Math.min(image.naturalWidth, Math.round(currentCenter.x * 2), Math.round((image.naturalWidth - currentCenter.x) * 2));
        newHeight = Math.round(newWidth / numericAspectRatio);
      }

      let newX = Math.round(currentCenter.x - newWidth / 2);
      let newY = Math.round(currentCenter.y - newHeight / 2);
      
      // Clamp position
      if (newX < 0) newX = 0;
      if (newY < 0) newY = 0;
      if (newX + newWidth > image.naturalWidth) newX = image.naturalWidth - newWidth;
      if (newY + newHeight > image.naturalHeight) newY = image.naturalHeight - newHeight;

      return { x: newX, y: newY, width: newWidth, height: newHeight };
    });
  }, [numericAspectRatio, image]);


  // Keyboard controls for cropper
  useEffect(() => {
    if (!image || mode !== 'crop-rotate') return;

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
          const clampedX = Math.max(0, Math.min(newX, image.naturalWidth - currentCrop.width));
          const clampedY = Math.max(0, Math.min(newY, image.naturalHeight - currentCrop.height));
          
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
  }, [image, setCrop, mode]);
  
  const handleImageUpload = (file: File) => {
    setOriginalFile(file);
    setImage(null);
    setError(null);
  };
  
  const handleClearImage = () => {
    setOriginalFile(null);
    setImage(null);
    setError(null);
    handleReset();
  };

  const handleAutoCorrect = async () => {
    if (!image || !originalFile) return;
    setIsLoading(true);
    setError(null);
    setAspectRatioKey('free'); // AI correction should be free form
    try {
      const base64Data = await fileToBase64(originalFile);
      const result = await getAutoCorrection(base64Data, originalFile.type);
      const newCropInPixels = {
        x: Math.round((result.crop.x / 100) * image.naturalWidth),
        y: Math.round((result.crop.y / 100) * image.naturalHeight),
        width: Math.round((result.crop.width / 100) * image.naturalWidth),
        height: Math.round((result.crop.height / 100) * image.naturalHeight),
      };
      setRotation(result.rotation);
      setCrop(newCropInPixels);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = async () => {
    if (!image || !originalFile) {
      alert(t('alert.noImage'));
      return;
    }

    try {
        let finalImageBlob: Blob;
        let fileName = originalFile.name || 'image.png';

        if (mode === 'resize') {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error(t('alert.noContext'));
            
            canvas.width = resizeWidth;
            canvas.height = resizeHeight;
            ctx.drawImage(image, 0, 0, resizeWidth, resizeHeight);
            
            finalImageBlob = await new Promise((resolve, reject) => {
                canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Canvas to Blob conversion failed.')), originalFile.type);
            });
            fileName = `resized-${fileName}`;

        } else { // crop-rotate mode
            if (keepCropperVertical) {
                const cropInPercentage: CropParams = {
                    x: (crop.x / image.naturalWidth) * 100,
                    y: (crop.y / image.naturalHeight) * 100,
                    width: (crop.width / image.naturalWidth) * 100,
                    height: (crop.height / image.naturalHeight) * 100,
                };
                 finalImageBlob = await applyCorrection(image, rotation, cropInPercentage, originalFile.type);
            } else {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error(t('alert.noContext'));

                canvas.width = crop.width;
                canvas.height = crop.height;

                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate((rotation * Math.PI) / 180);
                ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);
                
                ctx.drawImage(image, 0, 0);

                const finalCanvas = document.createElement('canvas');
                const finalCtx = finalCanvas.getContext('2d');
                if (!finalCtx) throw new Error(t('alert.noContext'));
                
                finalCanvas.width = crop.width;
                finalCanvas.height = crop.height;

                finalCtx.drawImage(
                    canvas,
                    crop.x, crop.y, crop.width, crop.height,
                    0, 0, crop.width, crop.height
                );

                finalImageBlob = await new Promise((resolve, reject) => {
                    finalCanvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Canvas to Blob conversion failed.')), originalFile.type);
                });
            }
            fileName = `edited-${fileName}`;
        }
        
        const link = document.createElement('a');
        link.download = fileName;
        link.href = URL.createObjectURL(finalImageBlob);
        link.click();
        URL.revokeObjectURL(link.href);

    } catch (error) {
        alert(error instanceof Error ? error.message : t('alert.noContext'));
    }
  };

  const renderContent = () => {
    switch (route) {
      case '#/terms':
        return <TermsPage />;
      case '#/privacy':
        return <PrivacyPage />;
      case '#/contact':
        return <ContactPage />;
      default:
        return (
          <>
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
                    aspectRatio={numericAspectRatio}
                    keepCropperVertical={keepCropperVertical}
                    mode={mode}
                  />
                </div>
                <div className="lg:col-span-1 h-full">
                  <ControlPanel
                    image={image}
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
                    aspectRatioKey={aspectRatioKey}
                    setAspectRatioKey={setAspectRatioKey}
                    mode={mode}
                    resizeWidth={resizeWidth}
                    setResizeWidth={setResizeWidth}
                    resizeHeight={resizeHeight}
                    setResizeHeight={setResizeHeight}
                    lockAspectRatio={lockAspectRatio}
                    setLockAspectRatio={setLockAspectRatio}
                  />
                </div>
              </div>
            )}
            {error && image && (
                <div className="mt-4 p-4 bg-red-100 border border-red-300 text-red-800 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300 rounded-md text-center max-w-xl mx-auto">
                    <strong>{t('error.title')}</strong> {error === 'Failed to get auto-correction from AI. Please try again.' ? t('error.ai') : error}
                </div>
            )}
          </>
        );
    }
  };


  return (
    <>
      <Navbar image={image} mode={mode} setMode={setMode} />
      <LoginDialog />
      <PricingDialog />
      <ApiDocsDialog />
      <div className="min-h-screen text-gray-800 dark:text-gray-100 pt-16">
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

          <div className="flex-grow w-full max-w-7xl relative">
             <div 
                className="absolute inset-0 -z-10 dark:hidden"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)',
                  backgroundSize: '2rem 2rem',
                }}
              />
              <div 
                className="absolute inset-0 -z-10 hidden dark:block"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
                  backgroundSize: '2rem 2rem',
                }}
              />
            <main className="w-full min-h-[calc(100vh-4rem)] flex-grow flex flex-col justify-center py-8">
              {renderContent()}
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
        
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-20 flex items-center justify-center border-t border-gray-200 dark:border-gray-700">
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