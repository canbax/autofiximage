

export interface CropParams {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BlurRegion {
  id: string;
  selection: CropParams;
  blurAmount: number;
}