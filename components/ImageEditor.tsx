import React, { useRef, useCallback } from 'react';
import { CropParams } from '../types';

type Handle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface Interaction {
  type: 'move' | 'resize';
  handle?: Handle;
  startX: number;
  startY: number;
  startCrop: CropParams;
}

interface ImageEditorProps {
  image: HTMLImageElement | null;
  crop: CropParams;
  setCrop: (crop: CropParams) => void;
  rotation: number;
  keepCropperVertical: boolean;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ image, crop, setCrop, rotation, keepCropperVertical }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<Interaction | null>(null);

  const getTransformedCoordinates = useCallback((e: MouseEvent | React.MouseEvent): { x: number, y: number } => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const rect = containerRef.current.getBoundingClientRect();
    const rawMouseX = e.clientX - rect.left;
    const rawMouseY = e.clientY - rect.top;

    if (keepCropperVertical) {
      return { x: rawMouseX, y: rawMouseY };
    }

    // Apply the inverse rotation to the mouse coordinates to map them to the unrotated plane
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
  }, [rotation, keepCropperVertical]);


  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!interactionRef.current || !containerRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();

    const { type, handle, startX, startY, startCrop } = interactionRef.current;
    const { x: currentX, y: currentY } = getTransformedCoordinates(e);
    
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dx = currentX - startX;
    const dy = currentY - startY;

    const dxPercent = (dx / rect.width) * 100;
    const dyPercent = (dy / rect.height) * 100;

    if (type === 'move') {
      let newCrop = { ...startCrop };
      newCrop.x = startCrop.x + dxPercent;
      newCrop.y = startCrop.y + dyPercent;

      // Clamp position so the crop box stays within the 100x100 bounds
      newCrop.x = Math.max(0, Math.min(newCrop.x, 100 - newCrop.width));
      newCrop.y = Math.max(0, Math.min(newCrop.y, 100 - newCrop.height));
      setCrop(newCrop);

    } else if (type === 'resize' && handle) {
        const newCrop = { ...startCrop };
        const startRight = startCrop.x + startCrop.width;
        const startBottom = startCrop.y + startCrop.height;

        if (handle.includes('n')) {
            let newY = startCrop.y + dyPercent;
            // Clamp so we don't go past the top, or make the crop area less than 1% high
            newY = Math.max(0, Math.min(newY, startBottom - 1));
            // Recalculate height based on the new Y, keeping the bottom edge fixed
            newCrop.height = startBottom - newY;
            newCrop.y = newY;
        }

        if (handle.includes('s')) {
            let newBottom = startBottom + dyPercent;
            // Clamp so we don't go past the bottom, or make the crop area less than 1% high
            newBottom = Math.min(100, Math.max(newBottom, newCrop.y + 1));
            // Recalculate height based on new bottom
            newCrop.height = newBottom - newCrop.y;
        }

        if (handle.includes('w')) {
            let newX = startCrop.x + dxPercent;
            // Clamp so we don't go past the left, or make the crop area less than 1% wide
            newX = Math.max(0, Math.min(newX, startRight - 1));
            // Recalculate width based on the new X, keeping the right edge fixed
            newCrop.width = startRight - newX;
            newCrop.x = newX;
        }

        if (handle.includes('e')) {
            let newRight = startRight + dxPercent;
            // Clamp so we don't go past the right, or make the crop area less than 1% wide
            newRight = Math.min(100, Math.max(newRight, newCrop.x + 1));
            // Recalculate width based on new right
            newCrop.width = newRight - newCrop.x;
        }
        
        setCrop(newCrop);
    }
  }, [setCrop, getTransformedCoordinates]);

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
    
    interactionRef.current = {
      type: handle ? 'resize' : 'move',
      handle,
      startX,
      startY,
      startCrop: { ...crop },
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handles: Handle[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
  
  if (!image) return null;

  const cropperMarkup = (
    <div
      className="absolute"
      style={{
        left: `${crop.x}%`,
        top: `${crop.y}%`,
        width: `${crop.width}%`,
        height: `${crop.height}%`,
        boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.6)`,
      }}
    >
      <div
        className="w-full h-full cursor-move border-2 border-dashed border-white/70"
        onMouseDown={handleMouseDown}
      >
        {/* Rule of thirds grid */}
        <div className="absolute top-0 left-1/3 w-px h-full bg-white/40"></div>
        <div className="absolute top-0 left-2/3 w-px h-full bg-white/40"></div>
        <div className="absolute top-1/3 left-0 w-full h-px bg-white/40"></div>
        <div className="absolute top-2/3 left-0 w-full h-px bg-white/40"></div>
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
        className="relative max-w-full max-h-full touch-none"
        style={{ aspectRatio: `${image.naturalWidth} / ${image.naturalHeight}` }}
      >
        <div 
            className="w-full h-full"
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            <img src={image.src} alt="Source for cropping" className="w-full h-full object-contain pointer-events-none" draggable={false} />
            {!keepCropperVertical && cropperMarkup}
        </div>

        {keepCropperVertical && cropperMarkup}
        
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