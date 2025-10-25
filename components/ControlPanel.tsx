import React from 'react';
import { CropParams } from '../types';
import { Button } from './Button';
import { WandIcon, ResetIcon, DownloadIcon, RotateIcon, CropIcon, TrashIcon, AspectRatioIcon, WidthIcon, HeightIcon, ResizeIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';
import { Checkbox } from './Checkbox';
import { Select } from './Select';

interface ControlPanelProps {
  image: HTMLImageElement | null;
  rotation: number;
  setRotation: (value: number) => void;
  crop: CropParams;
  setCrop: (value: CropParams) => void;
  onAutoCorrect: () => void;
  onReset: () => void;
  onDownload: () => void;
  onClearImage: () => void;
  isLoading: boolean;
  keepCropperVertical: boolean;
  setKeepCropperVertical: (value: boolean) => void;
  aspectRatioKey: string;
  setAspectRatioKey: (value: string) => void;
  mode: 'crop-rotate' | 'resize';
  resizeWidth: number;
  setResizeWidth: (value: number) => void;
  resizeHeight: number;
  setResizeHeight: (value: number) => void;
  lockAspectRatio: boolean;
  setLockAspectRatio: (value: boolean) => void;
  resizeContain: boolean;
  setResizeContain: (value: boolean) => void;
  resizeBgColor: string;
  setResizeBgColor: (value: string) => void;
}

const InputGroup: React.FC<{ label: string; children: React.ReactNode; icon: React.ReactNode }> = ({ label, children, icon }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
            {icon}
            {label}
        </label>
        {children}
    </div>
);

const NumberInput: React.FC<{ value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; step?: number | string; min?: number | string; max?: number | string }> = ({ value, onChange, ...props }) => (
    <input
        type="number"
        value={value}
        onChange={onChange}
        onWheel={(e) => (e.target as HTMLInputElement).blur()}
        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
        {...props}
    />
);


export const ControlPanel: React.FC<ControlPanelProps> = ({
  image,
  rotation,
  setRotation,
  crop,
  setCrop,
  onAutoCorrect,
  onReset,
  onDownload,
  onClearImage,
  isLoading,
  keepCropperVertical,
  setKeepCropperVertical,
  aspectRatioKey,
  setAspectRatioKey,
  mode,
  resizeWidth,
  setResizeWidth,
  resizeHeight,
  setResizeHeight,
  lockAspectRatio,
  setLockAspectRatio,
  resizeContain,
  setResizeContain,
  resizeBgColor,
  setResizeBgColor
}) => {
  const { t } = useTranslation();

  const aspectRatioOptions = [
    { value: 'free', label: t('controls.aspectRatios.free') },
    { value: 'original', label: t('controls.aspectRatios.original') },
    { value: '1/1-square', label: t('controls.aspectRatios.square') },
    { value: '4/3', label: t('controls.aspectRatios.monitor') },
    { value: '16/9-widescreen', label: t('controls.aspectRatios.widescreen') },
    { value: '1/1-profile', label: t('controls.aspectRatios.profilePicture') },
    { value: '4/5', label: t('controls.aspectRatios.igPost') },
    { value: '9/16-vertical', label: t('controls.aspectRatios.storyReelTikTok') },
    { value: '16/9-twitter', label: t('controls.aspectRatios.twitterPost') },
    { value: '1.91/1', label: t('controls.aspectRatios.fbPost') },
    { value: '16/9-fbAd', label: t('controls.aspectRatios.fbAd') },
    { value: '3/1', label: t('controls.aspectRatios.panorama') },
    { value: '32/9', label: t('controls.aspectRatios.ultraWide') },
  ];

  const handleCropChange = (field: keyof CropParams, value: string) => {
    if (!image) return;
    const numericValue = parseInt(value, 10) || 0;
    const newCrop = { ...crop };

    switch (field) {
      case 'x':
        newCrop.x = Math.max(0, Math.min(numericValue, image.naturalWidth - newCrop.width));
        break;
      case 'y':
        newCrop.y = Math.max(0, Math.min(numericValue, image.naturalHeight - newCrop.height));
        break;
      case 'width':
        newCrop.width = Math.max(1, Math.min(numericValue, image.naturalWidth - newCrop.x));
        break;
      case 'height':
        newCrop.height = Math.max(1, Math.min(numericValue, image.naturalHeight - newCrop.y));
        break;
    }
    setCrop(newCrop);
  };

  const handleResizeChange = (dimension: 'width' | 'height', value: string) => {
    if (!image) return;
    const numericValue = parseInt(value, 10) || 0;

    let newWidth = resizeWidth;
    let newHeight = resizeHeight;
    const originalAspectRatio = image.naturalWidth / image.naturalHeight;

    if (dimension === 'width') {
      newWidth = numericValue;
      if (lockAspectRatio) {
        newHeight = Math.round(newWidth / originalAspectRatio);
      }
    } else { // height
      newHeight = numericValue;
      if (lockAspectRatio) {
        newWidth = Math.round(newHeight * originalAspectRatio);
      }
    }
    setResizeWidth(newWidth);
    setResizeHeight(newHeight);
  };

  return (
    <div className="w-full h-full bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg flex flex-col space-y-6 overflow-y-auto">
      {mode === 'crop-rotate' && (
          <>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('controls.title')}</h2>
              <div className="flex flex-col gap-6">
                <Button onClick={onAutoCorrect} isLoading={isLoading} variant="primary">
                    <WandIcon />
                    {t('controls.autoCorrect')}
                </Button>

                <InputGroup label={t('controls.rotation')} icon={<RotateIcon />}>
                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min="-180"
                            max="180"
                            step="0.1"
                            value={rotation}
                            onChange={(e) => setRotation(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <NumberInput
                            value={Number(rotation.toFixed(1))}
                            onChange={(e) => setRotation(parseFloat(e.target.value))}
                            step="0.1"
                            min="-180"
                            max="180"
                        />
                    </div>
                </InputGroup>

                <InputGroup label={t('controls.crop')} icon={<CropIcon />}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <NumberInput 
                                value={Math.round(crop.x)} 
                                onChange={e => handleCropChange('x', e.target.value)}
                                min={0} max={image?.naturalWidth || 0} step="1"
                            />
                            <p className="text-xs text-center text-gray-500 mt-1">{t('controls.cropX')}</p>
                        </div>
                        <div>
                            <NumberInput 
                                value={Math.round(crop.y)} 
                                onChange={e => handleCropChange('y', e.target.value)}
                                min={0} max={image?.naturalHeight || 0} step="1"
                            />
                            <p className="text-xs text-center text-gray-500 mt-1">{t('controls.cropY')}</p>
                        </div>
                        <div>
                            <NumberInput 
                                value={Math.round(crop.width)} 
                                onChange={e => handleCropChange('width', e.target.value)}
                                min={1} max={image?.naturalWidth || 0} step="1"
                            />
                            <p className="text-xs text-center text-gray-500 mt-1">{t('controls.cropWidth')}</p>
                        </div>
                        <div>
                            <NumberInput 
                                value={Math.round(crop.height)} 
                                onChange={e => handleCropChange('height', e.target.value)}
                                min={1} max={image?.naturalHeight || 0} step="1"
                            />
                            <p className="text-xs text-center text-gray-500 mt-1">{t('controls.cropHeight')}</p>
                        </div>
                    </div>
                </InputGroup>
                
                <InputGroup label={t('controls.aspectRatio')} icon={<AspectRatioIcon />}>
                    <Select
                        value={aspectRatioKey}
                        onChange={e => setAspectRatioKey(e.target.value)}
                        options={aspectRatioOptions}
                        searchPlaceholder={t('controls.searchPlaceholder')}
                    />
                </InputGroup>

                <div>
                  <Checkbox
                    id="keep-cropper-vertical"
                    checked={keepCropperVertical}
                    onChange={(e) => setKeepCropperVertical(e.target.checked)}
                    label={t('controls.keepVertical')}
                  />
                </div>
              </div>
          </>
      )}

      {mode === 'resize' && (
          <>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('controls.resizeImage')}</h2>
              <div className="flex flex-col gap-6">
                  <InputGroup label={t('controls.width')} icon={<WidthIcon />}>
                      <NumberInput 
                          value={Math.round(resizeWidth)} 
                          onChange={e => handleResizeChange('width', e.target.value)}
                          min={1} step="1"
                      />
                  </InputGroup>
                  <InputGroup label={t('controls.height')} icon={<HeightIcon />}>
                      <NumberInput 
                          value={Math.round(resizeHeight)} 
                          onChange={e => handleResizeChange('height', e.target.value)}
                          min={1} step="1"
                      />
                  </InputGroup>
                  <Checkbox
                      id="lock-aspect-ratio"
                      checked={lockAspectRatio}
                      onChange={(e) => setLockAspectRatio(e.target.checked)}
                      label={t('controls.lockAspectRatio')}
                  />
                  {!lockAspectRatio && (
                      <div className="flex flex-col gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <Checkbox
                              id="resize-contain"
                              checked={resizeContain}
                              onChange={(e) => setResizeContain(e.target.checked)}
                              label={t('controls.resizeContain')}
                          />
                          {resizeContain && (
                              <InputGroup label={t('controls.resizeBgColor')} icon={<div className="w-5 h-5" />}>
                                  <div className="flex items-center gap-2">
                                      <div className="relative w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden flex-shrink-0">
                                          <div className="absolute inset-0 checkerboard" />
                                          <div 
                                              className="w-full h-full"
                                              style={{ backgroundColor: resizeBgColor }}
                                          />
                                      </div>
                                      <input
                                          type="color"
                                          value={resizeBgColor === 'transparent' ? '#ffffff' : resizeBgColor}
                                          onChange={e => setResizeBgColor(e.target.value)}
                                          className="w-full h-8 p-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
                                      />
                                      <Button variant="secondary" onClick={() => setResizeBgColor('transparent')} className="text-xs px-2 py-1">
                                          {t('controls.resizeTransparent')}
                                      </Button>
                                  </div>
                              </InputGroup>
                          )}
                      </div>
                  )}
              </div>
          </>
      )}

      <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-3">
          <Button onClick={onDownload} variant="secondary">
              <DownloadIcon />
              {t('controls.download')}
          </Button>
          <Button onClick={onReset} variant="danger">
              <ResetIcon />
              {t('controls.reset')}
          </Button>
          <Button onClick={onClearImage} variant="secondary">
              <TrashIcon />
              {t('controls.clear')}
          </Button>
      </div>
    </div>
  );
};