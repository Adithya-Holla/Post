/**
 * Image Cropper Component
 * Modal component for cropping profile images
 */
import React, { useState, useRef, useEffect } from 'react';

function ImageCropper({ imageSrc, onCropComplete, onCancel }) {
  const canvasRef = useRef(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, size: 200 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const imageRef = useRef(null);

  const clampCrop = (img, nextCrop) => {
    const minSize = 64;
    const maxSize = Math.min(img.width, img.height);

    const size = Math.max(minSize, Math.min(Number(nextCrop.size) || minSize, maxSize));
    const maxX = Math.max(0, img.width - size);
    const maxY = Math.max(0, img.height - size);

    const x = Math.max(0, Math.min(Number(nextCrop.x) || 0, maxX));
    const y = Math.max(0, Math.min(Number(nextCrop.y) || 0, maxY));

    return { x, y, size };
  };

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.onerror = () => {
        setImageLoaded(false);
        setLoadError('Could not load this image for cropping. Try using a JPG/PNG image.');
      };
      img.onload = () => {
        imageRef.current = img;
        setLoadError('');
        // Default to a slightly smaller square so portrait images can move on X/Y.
        const baseSize = Math.min(img.width, img.height);
        const size = Math.max(64, Math.floor(baseSize * 0.85));
        const initial = clampCrop(img, {
          x: (img.width - size) / 2,
          y: (img.height - size) / 2,
          size
        });
        setCrop(initial);
        setImageLoaded(true);
        drawCanvas(img, initial.x, initial.y, initial.size);
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  const drawCanvas = (img, x, y, size) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 300;

    // Draw cropped image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      img,
      x, y, size, size,
      0, 0, canvas.width, canvas.height
    );
  };

  const handleCropChange = (axis, value) => {
    const img = imageRef.current;
    if (!img) return;

    const next = clampCrop(img, { ...crop, [axis]: parseFloat(value) });
    setCrop(next);
    drawCanvas(img, next.x, next.y, next.size);
  };

  const canvasToBlob = (canvas, type, quality) =>
    new Promise((resolve) => {
      if (!canvas) return resolve(null);
      if (canvas.toBlob) {
        canvas.toBlob((blob) => resolve(blob), type, quality);
        return;
      }
      // Fallback for older Safari
      try {
        const dataUrl = canvas.toDataURL(type, quality);
        const parts = dataUrl.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || type;
        const binary = atob(parts[1]);
        const arr = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
        resolve(new Blob([arr], { type: mime }));
      } catch {
        resolve(null);
      }
    });

  const handleSave = async () => {
    if (!imageLoaded) return;
    const canvas = canvasRef.current;
    const blob = await canvasToBlob(canvas, 'image/jpeg', 0.95);
    if (!blob) {
      setLoadError('Could not export cropped image. Please try again.');
      return;
    }
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
    onCropComplete(file);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="bg-gray-900 rounded-xl shadow-lg max-w-md w-full p-6 border border-gray-800 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Crop Profile Picture
        </h3>

        {loadError && (
          <div className="mb-4 bg-red-900/20 border border-red-800 rounded-xl px-4 py-3">
            <p className="text-red-300 text-sm font-medium">{loadError}</p>
          </div>
        )}

        {/* Canvas Preview */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="rounded-full border-2 border-gray-700"
            />
          </div>
        </div>

        {imageLoaded && imageRef.current && (
          <div className="space-y-4 mb-6">
            {/* X Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Position X
              </label>
              <input
                type="range"
                min="0"
                max={Math.max(0, imageRef.current.width - crop.size)}
                value={crop.x}
                onChange={(e) => handleCropChange('x', e.target.value)}
                className="w-full"
                disabled={Math.max(0, imageRef.current.width - crop.size) === 0}
              />
            </div>

            {/* Y Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Position Y
              </label>
              <input
                type="range"
                min="0"
                max={Math.max(0, imageRef.current.height - crop.size)}
                value={crop.y}
                onChange={(e) => handleCropChange('y', e.target.value)}
                className="w-full"
                disabled={Math.max(0, imageRef.current.height - crop.size) === 0}
              />
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Zoom
              </label>
              <input
                type="range"
                min="64"
                max={Math.min(imageRef.current.width, imageRef.current.height)}
                value={crop.size}
                onChange={(e) => handleCropChange('size', e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!imageLoaded}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageCropper;
