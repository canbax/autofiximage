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

    let newCrop = { ...startCrop };

    if (type === 'move') {
      newCrop.x = startCrop.x + dxPercent;
      newCrop.y = startCrop.y + dyPercent;
    } else if (type === 'resize' && handle) {
      if (handle.includes('n')) {
        const heightChange = startCrop.height - dyPercent;
        if (heightChange > 1) { // Min height 1%
          newCrop.y = startCrop.y + dyPercent;
          newCrop.height = heightChange;
        }
      }
      if (handle.includes('s')) {
        const heightChange = startCrop.height + dyPercent;
        if (heightChange > 1) newCrop.height = heightChange;
      }
      if (handle.includes('w')) {
        const widthChange = startCrop.width - dxPercent;
        if (widthChange > 1) { // Min width 1%
          newCrop.x = startCrop.x + dxPercent;
          newCrop.width = widthChange;
        }
      }
      if (handle.includes('e')) {
        const widthChange = startCrop.width + dxPercent;
        if (widthChange > 1) newCrop.width = widthChange;
      }
    }

    // Clamp values to stay within image bounds [0, 100]
    newCrop.x = Math.max(0, newCrop.x);
    newCrop.y = Math.max(0, newCrop.y);
    
    if (newCrop.x + newCrop.width > 100) {
        newCrop.width = 100 - newCrop.x;
    }
     if (newCrop.y + newCrop.height > 100) {
        newCrop.height = 100 - newCrop.y;
    }

    setCrop(newCrop);
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
    <div className="w-full h-full flex items-center justify-center bg-gray-900 p-4 rounded-lg shadow-inner select-none overflow-hidden">
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
