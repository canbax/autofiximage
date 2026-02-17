# AutoFix Image

<div align="center">
  <img width="250" height="250" alt="AutoFix Image Banner" src="public/favicon.ico" />
</div>

A privacy-focused, browser-based AI image correction tool. AutoFix Image leverages the power of TensorFlow.js and MediaPipe to provide intelligent image editing features directly in your browser without uploading your photos to a server.

## Features

- **Smart Auto-Crop**: Automatically detects the subject in your image using the COCO-SSD object detection model and crops to the optimal composition.
- **Privacy-First Face Blurring**: Detects faces using MediaPipe and applies a blur effect to protect privacy. All processing happens locally on your device.
- **Intelligent Resize**: Resize images with content-aware background filling (smart resizing) or standard scaling.
- **Auto-Straightening**: Automatically corrects skewed images to ensure horizons are level.
- **Manual Adjustments**: Fine-tune crops, rotation, and blur regions with intuitive controls.
- **Local Processing**: Your images never leave your browser for processing, ensuring complete privacy and security.

## Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS 4
- **AI/ML**: TensorFlow.js, MediaPipe, COCO-SSD
- **Deployment**: Cloudflare Workers

## Getting Started

### Prerequisites

- Node.js (v22.x or later recommended)
- npm (v10.x or later)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/canbax/autofiximage.git
    cd autofiximage
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Set up environment variables:
    Create a `.env.local` file based on `.env` and add your keys if necessary.
    > Note: This project uses client-side AI models, so API keys for image processing are generally not required unless you are using specific cloud services.

### Running Locally

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` (or the URL shown in your terminal) to view the app.

### Building for Production

Build the application for production:

```bash
npm run build
```

Previews the production build:

```bash
npm run preview
```

## Deployment

This project is configured for deployment on Cloudflare Workers.

1.  Login to Cloudflare:

    ```bash
    npx wrangler login
    ```

2.  Deploy to Cloudflare:
    ```bash
    npm run deploy
    ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
