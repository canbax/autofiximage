export const translations = {
  en: {
    // Navbar
    'navbar.pricing': 'Pricing',
    'navbar.login': 'Login',

    // App Header
    'app.header': 'Upload an image to manually edit or let AI perfect its rotation and crop.',

    // Image Uploader
    'uploader.dragDrop': 'Drag & drop your image here',
    'uploader.or': 'or',
    'uploader.browse': 'Browse for a file',
    'uploader.formats': 'PNG, JPG, GIF, WEBP',
    
    // Control Panel
    'controls.title': 'Editor Controls',
    'controls.autoCorrect': 'Auto-Correct with AI',
    'controls.rotation': 'Rotation (°)',
    'controls.crop': 'Crop',
    'controls.cropX': 'X',
    'controls.cropY': 'Y',
    'controls.cropWidth': 'Width (%)',
    'controls.cropHeight': 'Height (%)',
    'controls.keepVertical': 'Keep cropper area vertical',
    'controls.download': 'Download Image',
    'controls.reset': 'Reset Changes',
    'controls.clear': 'Clear Image',

    // Errors & Alerts
    'error.title': 'Error:',
    'error.ai': 'Failed to get auto-correction from AI. Please try again.',
    'alert.noImage': 'No image to download.',
    'alert.noContext': 'Could not create canvas context for download.',

  },
  es: {
    // Navbar
    'navbar.pricing': 'Precios',
    'navbar.login': 'Iniciar sesión',

    // App Header
    'app.header': 'Sube una imagen para editarla manualmente o deja que la IA perfeccione su rotación y recorte.',
    
    // Image Uploader
    'uploader.dragDrop': 'Arrastra y suelta tu imagen aquí',
    'uploader.or': 'o',
    'uploader.browse': 'Busca un archivo',
    'uploader.formats': 'PNG, JPG, GIF, WEBP',

    // Control Panel
    'controls.title': 'Controles del Editor',
    'controls.autoCorrect': 'Autocorrección con IA',
    'controls.rotation': 'Rotación (°)',
    'controls.crop': 'Recortar',
    'controls.cropX': 'X',
    'controls.cropY': 'Y',
    'controls.cropWidth': 'Ancho (%)',
    'controls.cropHeight': 'Alto (%)',
    'controls.keepVertical': 'Mantener el área de recorte vertical',
    'controls.download': 'Descargar Imagen',
    'controls.reset': 'Restablecer Cambios',
    'controls.clear': 'Quitar Imagen',
    
    // Errors & Alerts
    'error.title': 'Error:',
    'error.ai': 'No se pudo obtener la autocorrección de la IA. Por favor, inténtalo de nuevo.',
    'alert.noImage': 'No hay imagen para descargar.',
    'alert.noContext': 'No se pudo crear el contexto del lienzo para la descarga.',
  },
};

export type Language = keyof typeof translations;
export const LANGUAGES: Language[] = ['en', 'es'];
export const DEFAULT_LANGUAGE: Language = 'en';
