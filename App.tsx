import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ImageEditor } from './components/ImageEditor';
import { ControlPanel } from './components/ControlPanel';
import { CropParams, BlurRegion } from './types';
import { detectFaces, loadModels } from './services/mediaPipeService';
import Navbar from './components/Navbar';
import { useTranslation } from './hooks/useTranslation';
import LandingPage from './components/LandingPage';
import AdBanner from './components/AdBanner';
import { LoginDialog } from './components/LoginDialog';
import { PricingDialog } from './components/PricingDialog';
import { applyCorrection, adjustCropForRotation } from './lib/imageUtils';
import TermsPage from './components/TermsPage';
import { useSmartCrop } from './hooks/useSmartCrop';
import PrivacyPage from './components/PrivacyPage';
import ContactPage from './components/ContactPage';
import AboutPage from './components/AboutPage';
import { calculateSkewAngle } from './lib/autoStraighten';

const DEFAULT_SELECTION: CropParams = { x: 0, y: 0, width: 0, height: 0 };
const DEFAULT_ROTATION = 0;
const DEFAULT_BLUR_AMOUNT = 10;

// TODO: Replace with your own AdSense Client and Slot IDs
const AD_CLIENT = 'ca-pub-9521603226003896';
const AD_SLOT_SIDE = '1234567890';
const AD_SLOT_BOTTOM = '1234567891';

type AppMode = 'crop-rotate' | 'resize' | 'blur';

const App: React.FC = () => {
  const { t } = useTranslation();
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState<number>(DEFAULT_ROTATION);
  const [selection, setSelection] = useState<CropParams>(DEFAULT_SELECTION);
  const [aspectRatioKey, setAspectRatioKey] = useState('free');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  const [keepCropperVertical, setKeepCropperVertical] = useState<boolean>(true);
  const [route, setRoute] = useState(window.location.hash);
  const [mode, setMode] = useState<AppMode>('crop-rotate');
  const { getSmartCrop, isReady: isSmartCropReady } = useSmartCrop();

  // Resize State
  const [resizeWidth, setResizeWidth] = useState(0);
  const [resizeHeight, setResizeHeight] = useState(0);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [resizeContain, setResizeContain] = useState(true);
  const [resizeBgColor, setResizeBgColor] = useState('transparent');

  // Blur State
  const [blurRegions, setBlurRegions] = useState<BlurRegion[]>([]);
  const [activeBlurRegionId, setActiveBlurRegionId] = useState<string | null>(null);

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
      const fullImageCrop = {
        x: 0,
        y: 0,
        width: image.naturalWidth,
        height: image.naturalHeight,
      };
      setSelection(fullImageCrop);
      setResizeWidth(image.naturalWidth);
      setResizeHeight(image.naturalHeight);

      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(image, image.naturalWidth - 1, 0, 1, 1, 0, 0, 1, 1);
          const pixelData = ctx.getImageData(0, 0, 1, 1).data;
          const hex = `#${('000000' + ((pixelData[0] << 16) | (pixelData[1] << 8) | pixelData[2]).toString(16)).slice(-6)}`;
          setResizeBgColor(hex);
        }
      } catch (e) {
        setResizeBgColor('transparent');
      }
    } else {
      setSelection(DEFAULT_SELECTION);
      setResizeWidth(0);
      setResizeHeight(0);
      setResizeBgColor('transparent');
    }
    setAspectRatioKey('free');
    setMode('crop-rotate');
    setResizeContain(true);
    setLockAspectRatio(true);
    setBlurRegions([]);
    setActiveBlurRegionId(null);
  }, [image]);

  useEffect(() => {
    if (!originalFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const fullImageCrop = {
          x: 0,
          y: 0,
          width: img.naturalWidth,
          height: img.naturalHeight,
        };
        setImage(img);
        setRotation(DEFAULT_ROTATION);
        setSelection(fullImageCrop);
        setResizeWidth(img.naturalWidth);
        setResizeHeight(img.naturalHeight);
        setAspectRatioKey('free');
        setBlurRegions([]);
        setActiveBlurRegionId(null);

        // Smartly pick a default background color from the top-right corner
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 1;
          canvas.height = 1;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(img, img.naturalWidth - 1, 0, 1, 1, 0, 0, 1, 1);
            const pixelData = ctx.getImageData(0, 0, 1, 1).data;
            const hex = `#${('000000' + ((pixelData[0] << 16) | (pixelData[1] << 8) | pixelData[2]).toString(16)).slice(-6)}`;
            setResizeBgColor(hex);
          }
        } catch (e) {
          setResizeBgColor('transparent');
        }
        setIsProcessingImage(false);
      };
      img.onerror = () => {
        setError('error.imageLoad');
        setIsProcessingImage(false);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setError('error.fileRead');
      setIsProcessingImage(false);
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

    setSelection((c) => {
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
    if (!image) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName)) {
        // An input is focused, so don't move the cropper. Let the browser handle the event.
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;

        if (mode === 'crop-rotate') {
          setSelection((currentSelection) => {
            let newX = currentSelection.x;
            let newY = currentSelection.y;

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

            const clampedX = Math.max(0, Math.min(newX, image.naturalWidth - currentSelection.width));
            const clampedY = Math.max(0, Math.min(newY, image.naturalHeight - currentSelection.height));

            return { ...currentSelection, x: clampedX, y: clampedY };
          });
        } else if (mode === 'blur' && activeBlurRegionId) {
          setBlurRegions((currentRegions) =>
            currentRegions.map((region) => {
              if (region.id === activeBlurRegionId) {
                let newX = region.selection.x;
                let newY = region.selection.y;

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

                const clampedX = Math.max(0, Math.min(newX, image.naturalWidth - region.selection.width));
                const clampedY = Math.max(0, Math.min(newY, image.naturalHeight - region.selection.height));

                return {
                  ...region,
                  selection: { ...region.selection, x: clampedX, y: clampedY },
                };
              }
              return region;
            })
          );
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [image, mode, activeBlurRegionId, setSelection, setBlurRegions]);

  const handleImageUpload = (file: File) => {
    const previousMode = mode;
    setIsProcessingImage(true);
    setOriginalFile(file);
    setImage(null);
    setError(null);

    // Logic to persist mode
    if (image) {
      // if an image was already loaded
      setMode(previousMode);
      if (previousMode === 'blur') {
        setBlurRegions([]); // Clear old blur regions
        setActiveBlurRegionId(null);
      }
    } else {
      setMode('crop-rotate'); // Default for first upload
    }
  };

  const handleAutoCorrect = async () => {
    if (!image || !originalFile) return;

    if (!isSmartCropReady) {
      alert('AI Model is still loading. Please wait a moment.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAspectRatioKey('free'); // AI correction should be free form
    setMode('crop-rotate');
    try {
      const targetRatio = numericAspectRatio || 16 / 9;
      const crop = await getSmartCrop(image, targetRatio);

      // Apply rotation estimate and then shrink crop to avoid black corners
      const skewAngle = calculateSkewAngle(image);
      setRotation(skewAngle);

      const finalCrop = keepCropperVertical ? adjustCropForRotation(image, crop, skewAngle) : crop;
      setSelection(finalCrop);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'error.unknown');
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

        if (!lockAspectRatio && resizeContain) {
          ctx.fillStyle = resizeBgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          const ratio = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
          const newWidth = image.naturalWidth * ratio;
          const newHeight = image.naturalHeight * ratio;
          const x = (canvas.width - newWidth) / 2;
          const y = (canvas.height - newHeight) / 2;
          ctx.drawImage(image, x, y, newWidth, newHeight);
        } else {
          ctx.drawImage(image, 0, 0, resizeWidth, resizeHeight);
        }

        finalImageBlob = await new Promise((resolve, reject) => {
          canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Canvas to Blob conversion failed.'))), originalFile.type);
        });
        fileName = `resized-${fileName}`;
      } else if (mode === 'blur') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error(t('alert.noContext'));
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        // Draw the original image first.
        ctx.drawImage(image, 0, 0);

        if (blurRegions.length > 0) {
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          if (!tempCtx) throw new Error(t('alert.noContext'));

          tempCanvas.width = image.naturalWidth;
          tempCanvas.height = image.naturalHeight;

          for (const region of blurRegions) {
            if (region.blurAmount > 0 && region.selection.width > 0 && region.selection.height > 0) {
              // For each region, create a blurred version on the temp canvas,
              // then clip the main canvas and draw the blurred part in.
              tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
              tempCtx.filter = `blur(${region.blurAmount}px)`;
              tempCtx.drawImage(image, 0, 0);

              ctx.save();
              ctx.beginPath();
              ctx.rect(region.selection.x, region.selection.y, region.selection.width, region.selection.height);
              ctx.clip();
              ctx.drawImage(tempCanvas, 0, 0);
              ctx.restore();
            }
          }
        }

        finalImageBlob = await new Promise((resolve, reject) => {
          canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Canvas to Blob conversion failed.'))), originalFile.type);
        });
        fileName = `blurred-${fileName}`;
      } else {
        // crop-rotate mode
        const cropInPercentage: CropParams = {
          x: (selection.x / image.naturalWidth) * 100,
          y: (selection.y / image.naturalHeight) * 100,
          width: (selection.width / image.naturalWidth) * 100,
          height: (selection.height / image.naturalHeight) * 100,
        };
        finalImageBlob = await applyCorrection(image, keepCropperVertical ? rotation : 0, cropInPercentage, originalFile.type);
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

  const handleAddBlurRegion = () => {
    if (!image) return;
    const id = Date.now().toString();
    const newRegion: BlurRegion = {
      id,
      selection: {
        x: Math.round(image.naturalWidth / 2 - image.naturalWidth * 0.125),
        y: Math.round(image.naturalHeight / 2 - image.naturalHeight * 0.125),
        width: Math.round(image.naturalWidth * 0.25),
        height: Math.round(image.naturalHeight * 0.25),
      },
      blurAmount: DEFAULT_BLUR_AMOUNT,
    };
    setBlurRegions((prev) => [...prev, newRegion]);
    setActiveBlurRegionId(id);
  };

  const handleUpdateBlurRegion = (id: string, newProps: Partial<Omit<BlurRegion, 'id'>>) => {
    setBlurRegions((prev) => prev.map((r) => (r.id === id ? { ...r, ...newProps } : r)));
  };

  const handleRemoveBlurRegion = (id: string) => {
    setBlurRegions((prev) => {
      const newRegions = prev.filter((r) => r.id !== id);
      if (activeBlurRegionId === id) {
        setActiveBlurRegionId(newRegions.length > 0 ? newRegions[newRegions.length - 1].id : null);
      }
      return newRegions;
    });
  };

  const handleSelectBlurRegion = (id: string) => {
    setActiveBlurRegionId(id);
  };

  const handleDetectFaces = async () => {
    if (!image) return;
    setIsLoading(true);
    setError(null);
    setMode('blur');

    try {
      const faces = await detectFaces(image);

      if (faces.length === 0) {
        alert(t('alert.noFaces'));
      } else {
        const newRegions: BlurRegion[] = faces.map((face) => {
          const id = `${Date.now()}-${Math.random()}`;
          return {
            id,
            selection: face,
            blurAmount: DEFAULT_BLUR_AMOUNT,
          };
        });

        setBlurRegions((prev) => [...prev, ...newRegions]);
        if (newRegions.length > 0) {
          setActiveBlurRegionId(newRegions[newRegions.length - 1].id);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'error.unknown');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (newMode: AppMode) => {
    // If switching to blur mode for the first time (no blur regions exist)
    // and a crop has been made (selection is smaller than the full image),
    // use the current crop selection as the initial blur region.
    if (newMode === 'blur' && blurRegions.length === 0 && image && (selection.width < image.naturalWidth || selection.height < image.naturalHeight)) {
      const id = Date.now().toString();
      const newRegion: BlurRegion = {
        id,
        selection: { ...selection }, // Use the crop selection
        blurAmount: DEFAULT_BLUR_AMOUNT,
      };
      setBlurRegions([newRegion]);
      setActiveBlurRegionId(id);
    }
    if (newMode === 'blur') {
      loadModels().catch(console.error);
    }
    setMode(newMode);
  };

  const renderContent = () => {
    switch (route) {
      case '#/about':
        return <AboutPage />;
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
              <LandingPage onImageUpload={handleImageUpload} isProcessing={isProcessingImage} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[75vh] w-full">
                <div className="lg:col-span-2 h-full">
                  <ImageEditor
                    image={image}
                    rotation={rotation}
                    selection={selection}
                    setSelection={setSelection}
                    aspectRatio={numericAspectRatio}
                    keepCropperVertical={keepCropperVertical}
                    mode={mode}
                    resizeWidth={resizeWidth}
                    resizeHeight={resizeHeight}
                    lockAspectRatio={lockAspectRatio}
                    resizeContain={resizeContain}
                    resizeBgColor={resizeBgColor}
                    blurRegions={blurRegions}
                    activeBlurRegionId={activeBlurRegionId}
                    onUpdateBlurRegion={handleUpdateBlurRegion}
                    onSelectBlurRegion={handleSelectBlurRegion}
                    onRemoveBlurRegion={handleRemoveBlurRegion}
                  />
                </div>
                <div className="lg:col-span-1 h-full">
                  <ControlPanel
                    image={image}
                    rotation={rotation}
                    setRotation={setRotation}
                    selection={selection}
                    setSelection={setSelection}
                    onAutoCorrect={handleAutoCorrect}
                    onReset={handleReset}
                    onDownload={handleDownload}
                    onNewImageUpload={handleImageUpload}
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
                    resizeContain={resizeContain}
                    setResizeContain={setResizeContain}
                    resizeBgColor={resizeBgColor}
                    setResizeBgColor={setResizeBgColor}
                    blurRegions={blurRegions}
                    activeBlurRegionId={activeBlurRegionId}
                    onAddBlurRegion={handleAddBlurRegion}
                    onUpdateBlurRegion={handleUpdateBlurRegion}
                    onSelectBlurRegion={handleSelectBlurRegion}
                    onDetectFaces={handleDetectFaces}
                    imageMimeType={originalFile?.type || null}
                  />
                </div>
              </div>
            )}
            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-300 text-red-800 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300 rounded-md text-center max-w-xl mx-auto">
                <strong>{t('error.title')}</strong> {t(error)}
              </div>
            )}
          </>
        );
    }
  };

  return (
    <>
      <Navbar image={image} mode={mode} setMode={handleModeChange} />
      <LoginDialog />
      <PricingDialog />
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
            <main className="w-full min-h-[calc(100vh-4rem)] flex-grow flex flex-col justify-center py-8">{renderContent()}</main>
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
