import React, { useRef, useCallback, useEffect } from 'react';
import { CropParams } from '../types';

type Handle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface Interaction {
  type: 'move' | 'resize';
  handle?: Handle;
  startX: number;
  startY: number;
  startSelection: CropParams;
}

interface ImageEditorProps {
  image: HTMLImageElement | null;
  crop: CropParams;
  setCrop: (crop: CropParams) => void;
  rotation: number;
  aspectRatio: number | null;
  keepCropperVertical: boolean;
  mode: 'crop-rotate' | 'resize' | 'blur';
  resizeWidth: number;
  resizeHeight: number;
  lockAspectRatio: boolean;
  resizeContain: boolean;
  resizeBgColor: string;
  blurSelection: CropParams;
  setBlurSelection: (selection: CropParams) => void;
  blurAmount: number;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ 
  image, 
  crop, setCrop, 
  rotation, 
  aspectRatio, 
  keepCropperVertical, 
  mode, 
  resizeWidth, resizeHeight, 
  lockAspectRatio, resizeContain, resizeBgColor,
  blurSelection, setBlurSelection, blurAmount
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<Interaction | null>(null);
  const resizeCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (mode === 'resize' && resizeCanvasRef.current && image && resizeWidth > 0 && resizeHeight > 0) {
      const canvas = resizeCanvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = resizeWidth;
      canvas.height = resizeHeight;

      if (ctx) {
        ctx.imageSmoothingQuality = 'high';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
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
      }
    }
  }, [mode, image, resizeWidth, resizeHeight, lockAspectRatio, resizeContain, resizeBgColor]);

  const getTransformedCoordinates = useCallback((e: MouseEvent | React.MouseEvent): { x: number, y: number } => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const rect = containerRef.current.getBoundingClientRect();
    const rawMouseX = e.clientX - rect.left;
    const rawMouseY = e.clientY - rect.top;

    if (keepCropperVertical || mode === 'blur') {
      return { x: rawMouseX, y: rawMouseY };
    }

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const angleRad = -rotation * (Math.PI / 180);
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const translatedX = rawMouseX - centerX;
    const translatedY = rawMouseY - centerY;
    const rotatedX = translatedX * cos - translatedY * sin;
    const rotatedY = translatedX * sin + translatedY * cos;
    return {
        x: rotatedX + centerX,
        y: rotatedY + centerY,
    };
  }, [rotation, keepCropperVertical, mode]);


  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!interactionRef.current || !containerRef.current || !image) return;
    
    e.preventDefault();
    e.stopPropagation();

    const { type, handle, startX, startY, startSelection } = interactionRef.current;
    const { x: currentX, y: currentY } = getTransformedCoordinates(e);
    
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const scaleX = image.naturalWidth / rect.width;
    const scaleY = image.naturalHeight / rect.height;

    const dxImage = (currentX - startX) * scaleX;
    const dyImage = (currentY - startY) * scaleY;
    
    const setSelection = mode === 'blur' ? setBlurSelection : setCrop;

    if (type === 'move') {
      let newSelection = { ...startSelection };
      newSelection.x = startSelection.x + dxImage;
      newSelection.y = startSelection.y + dyImage;

      newSelection.x = Math.max(0, Math.min(newSelection.x, image.naturalWidth - newSelection.width));
      newSelection.y = Math.max(0, Math.min(newSelection.y, image.naturalHeight - newSelection.height));
      setSelection({
        x: Math.round(newSelection.x),
        y: Math.round(newSelection.y),
        width: Math.round(newSelection.width),
        height: Math.round(newSelection.height),
      });

    } else if (type === 'resize' && handle) {
        let { x, y, width, height } = startSelection;
        const startRight = x + width;
        const startBottom = y + height;
    
        if (handle.includes('e')) width += dxImage;
        if (handle.includes('w')) { x += dxImage; width -= dxImage; }
        if (handle.includes('s')) height += dyImage;
        if (handle.includes('n')) { y += dyImage; height -= dyImage; }
        
        if (mode === 'crop-rotate' && aspectRatio) {
            if (handle.length === 2 && Math.abs(dyImage) > Math.abs(dxImage)) {
                 width = height * aspectRatio;
            } else {
                 height = width / aspectRatio;
            }
            if (handle.includes('n')) y = startBottom - height;
            if (handle.includes('w')) x = startRight - width;
        }
        
        const MIN_SIZE = 20;
        width = Math.max(MIN_SIZE, width);
        height = Math.max(MIN_SIZE, height);
        x = Math.max(0, x);
        y = Math.max(0, y);
        
        if (x + width > image.naturalWidth) {
            width = image.naturalWidth - x;
            if (mode === 'crop-rotate' && aspectRatio) {
                height = width / aspectRatio;
                if (handle.includes('n')) y = startBottom - height;
            }
        }
        if (y + height > image.naturalHeight) {
            height = image.naturalHeight - y;
            if (mode === 'crop-rotate' && aspectRatio) {
                width = height * aspectRatio;
                if (handle.includes('w')) x = startRight - width;
            }
        }
        
        if (x + width > image.naturalWidth) x = image.naturalWidth - width;
        if (y + height > image.naturalHeight) y = image.naturalHeight - height;
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        
        setSelection({ x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) });
    }
  }, [setCrop, setBlurSelection, getTransformedCoordinates, aspectRatio, image, mode]);

  const handleMouseUp = useCallback(() => {
    interactionRef.current = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const handle = (e.currentTarget as HTMLElement).dataset.handle as Handle;
    if (!containerRef.current) return;
    
    const { x: startX, y: startY } = getTransformedCoordinates(e);
    
    const startSelection = mode === 'blur' ? blurSelection : crop;

    interactionRef.current = {
      type: handle ? 'resize' : 'move',
      handle,
      startX,
      startY,
      startSelection: { ...startSelection },
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handles: Handle[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
  
  if (!image) return null;

  const renderSelectionBox = (selection: CropParams, showGrid: boolean, blurEffect: boolean) => (
    <div
      className="absolute"
      style={{
        left: `${(selection.x / image.naturalWidth) * 100}%`,
        top: `${(selection.y / image.naturalHeight) * 100}%`,
        width: `${(selection.width / image.naturalWidth) * 100}%`,
        height: `${(selection.height / image.naturalHeight) * 100}%`,
        boxShadow: showGrid ? `0 0 0 9999px rgba(0, 0, 0, 0.6)` : 'none',
      }}
    >
      <div
        className="w-full h-full cursor-move border-2 border-dashed border-white/70"
        onMouseDown={handleMouseDown}
      >
        {blurEffect && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                backdropFilter: `blur(${blurAmount}px)`
              }}
            />
        )}
        {showGrid && (
          <>
            <div className="absolute top-0 left-1/3 w-px h-full bg-white/40"></div>
            <div className="absolute top-0 left-2/3 w-px h-full bg-white/40"></div>
            <div className="absolute top-1/3 left-0 w-full h-px bg-white/40"></div>
            <div className="absolute top-2/3 left-0 w-full h-px bg-white/40"></div>
          </>
        )}
      </div>
      {handles.map((handle) => (
        <div
          key={handle}
          data-handle={handle}
          onMouseDown={handleMouseDown}
          className={`handle-${handle} absolute w-3 h-3 bg-white rounded-full border-2 border-gray-900`}
        />
      ))}
    </div>
  );

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-900 p-4 rounded-lg shadow-inner select-none overflow-hidden">
      <div
        ref={containerRef}
        className="relative max-w-full max-h-full touch-none flex items-center justify-center"
        style={{ aspectRatio: `${image.naturalWidth} / ${image.naturalHeight}` }}
      >
        {mode === 'crop-rotate' ? (
          <>
            <div 
                className="w-full h-full"
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                <img src={image.src} alt="Source for cropping" className="w-full h-full object-contain pointer-events-none" draggable={false} />
                {!keepCropperVertical && renderSelectionBox(crop, true, false)}
            </div>
            {keepCropperVertical && renderSelectionBox(crop, true, false)}
          </>
        ) : mode === 'blur' ? (
            <>
              <img src={image.src} alt="Source for blurring" className="w-full h-full object-contain pointer-events-none" draggable={false} />
              {renderSelectionBox(blurSelection, false, true)}
            </>
        ) : ( // resize mode
          <div className="w-full h-full flex items-center justify-center">
             <canvas 
                ref={resizeCanvasRef} 
                className="object-contain max-w-full max-h-full rounded-md shadow-lg"
                style={{
                  aspectRatio: `${resizeWidth} / ${resizeHeight}`,
                }}
              />
          </div>
        )}
        <style>{`
            .handle-n { top: -6px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
            .handle-s { bottom: -6px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
            .handle-w { left: -6px; top: 50%; transform: translateY(-50%); cursor: w-resize; }
            .handle-e { right: -6px; top: 50%; transform: translateY(-50%); cursor: e-resize; }
            .handle-nw { top: -6px; left: -6px; cursor: nw-resize; }
            .handle-ne { top: -6px; right: -6px; cursor: ne-resize; }
            .handle-sw { bottom: -6px; left: -6px; cursor: sw-resize; }
            .handle-se { bottom: -6px; right: -6px; cursor: se-resize; }
        `}</style>
      </div>
    </div>
  );
};