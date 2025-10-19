import React from 'react';

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Return only the base64 part, without the data URI prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });
}
