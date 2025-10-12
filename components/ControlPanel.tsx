import React from 'react';
import { CropParams } from '../types';
import { Button } from './Button';
import { WandIcon, ResetIcon, DownloadIcon, RotateIcon, CropIcon } from './icons';

interface ControlPanelProps {
  rotation: number;
  setRotation: (value: number) => void;
  crop: CropParams;
  setCrop: (value: CropParams) => void;
  onAutoCorrect: () => void;
  onReset: () => void;
  onDownload: () => void;
  isLoading: boolean;
  keepCropperVertical: boolean;
  setKeepCropperVertical: (value: boolean) => void;
}

const InputGroup: React.FC<{ label: string; children: React.ReactNode; icon: React.ReactNode }> = ({ label, children, icon }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
            {icon}
            {label}
        </label>
        {children}
    </div>
);

// Fix: Allow step, min, and max to be strings or numbers to match usage with both number and string values.
const NumberInput: React.FC<{ value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; step?: number | string; min?: number | string; max?: number | string }> = ({ value, onChange, ...props }) => (
    <input
        type="number"
        value={value}
        onChange={onChange}
        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
        {...props}
    />
);


export const ControlPanel: React.FC<ControlPanelProps> = ({
  rotation,
  setRotation,
  crop,
  setCrop,
  onAutoCorrect,
  onReset,
  onDownload,
  isLoading,
  keepCropperVertical,
  setKeepCropperVertical,
}) => {
  return (
    <div className="w-full h-full bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg flex flex-col space-y-6 overflow-y-auto">
      <h2 className="text-xl font-bold text-white">Editor Controls</h2>
      
      <div className="flex flex-col gap-6">
        <Button onClick={onAutoCorrect} isLoading={isLoading} variant="primary">
            <WandIcon />
            Auto-Correct with AI
        </Button>

        <InputGroup label="Rotation (°)" icon={<RotateIcon />}>
            <div className="flex items-center gap-2">
                <input
                    type="range"
                    min="-180"
                    max="180"
                    step="0.1"
                    value={rotation}
                    onChange={(e) => setRotation(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
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

        <InputGroup label="Crop" icon={<CropIcon />}>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <NumberInput 
                        value={Number(crop.x.toFixed(2))} 
                        onChange={e => setCrop({...crop, x: parseFloat(e.target.value) || 0})}
                        min={0} max={100}
                    />
                    <p className="text-xs text-center text-gray-500 mt-1">X</p>
                </div>
                <div>
                    <NumberInput 
                        value={Number(crop.y.toFixed(2))} 
                        onChange={e => setCrop({...crop, y: parseFloat(e.target.value) || 0})}
                        min={0} max={100}
                    />
                    <p className="text-xs text-center text-gray-500 mt-1">Y</p>
                </div>
                <div>
                    <NumberInput 
                        value={Number(crop.width.toFixed(2))} 
                        onChange={e => setCrop({...crop, width: parseFloat(e.target.value) || 0})}
                        min={0} max={100}
                    />
                    <p className="text-xs text-center text-gray-500 mt-1">Width (%)</p>
                </div>
                <div>
                    <NumberInput 
                        value={Number(crop.height.toFixed(2))} 
                        onChange={e => setCrop({...crop, height: parseFloat(e.target.value) || 0})}
                        min={0} max={100}
                    />
                    <p className="text-xs text-center text-gray-500 mt-1">Height (%)</p>
                </div>
            </div>
        </InputGroup>

        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={keepCropperVertical}
              onChange={(e) => setKeepCropperVertical(e.target.checked)}
              className="appearance-none w-5 h-5 bg-gray-700 border-2 border-gray-600 rounded-md checked:bg-indigo-600 checked:border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition"
            />
            <span className="text-sm font-medium text-gray-300 select-none">Keep cropper area vertical</span>
          </label>
        </div>

      </div>

      <div className="mt-auto pt-6 border-t border-gray-700 flex flex-col gap-3">
          <Button onClick={onDownload} variant="secondary">
              <DownloadIcon />
              Download Image
          </Button>
          <Button onClick={onReset} variant="danger">
              <ResetIcon />
              Reset Changes
          </Button>
      </div>
    </div>
  );
};