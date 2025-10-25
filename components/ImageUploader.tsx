import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';
import Spinner from './Spinner';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isProcessing?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, isProcessing = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useTranslation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessing) return;
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isProcessing) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (e.dataTransfer.files[0].type.startsWith('image/')) {
        onImageUpload(e.dataTransfer.files[0]);
      } else {
        alert('Please upload an image file.');
      }
    }
  }, [onImageUpload, isProcessing]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) {
      setIsDragging(true);
    }
  }, [isProcessing]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);


  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex justify-center items-center w-full px-6 py-12 border-2 border-dashed rounded-lg transition-colors duration-300 ${isProcessing ? 'cursor-wait' : ''} ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-gray-800' : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'}`}
      >
        {isProcessing ? (
          <div className="text-center">
            <Spinner />
            <p className="mt-5 text-lg font-semibold text-gray-800 dark:text-gray-300">
              {t('uploader.processing.title')}
            </p>
            <p className="mt-1 text-sm text-gray-500">{t('uploader.processing.subtitle')}</p>
          </div>
        ) : (
          <div className="text-center">
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <p className="mt-5 text-lg font-semibold text-gray-800 dark:text-gray-300">
              {t('uploader.dragDrop')}
            </p>
            <p className="mt-1 text-sm text-gray-500">{t('uploader.or')}</p>
            <label htmlFor="file-upload" className="relative cursor-pointer mt-4 inline-block">
              <span className="px-4 py-2 rounded-md font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-500 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-gray-900 focus-within:ring-indigo-500 transition-colors">
                {t('uploader.browse')}
              </span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" disabled={isProcessing}/>
            </label>
            <p className="mt-4 text-xs text-gray-500">{t('uploader.formats')}</p>
          </div>
        )}
      </div>
    </div>
  );
};