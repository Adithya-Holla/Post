/**
 * Image Cropper Component
 * Modal component for cropping profile images
 */
import React, { useState, useRef, useEffect } from 'react';

function ImageCropper({ imageSrc, onCropComplete, onCancel }) {
  const canvasRef = useRef(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, size: 200 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        // Calculate initial crop to center square
        const size = Math.min(img.width, img.height);
        setCrop({
          x: (img.width - size) / 2,
          y: (img.height - size) / 2,
          size: size
        });
        setImageLoaded(true);
        drawCanvas(img, (img.width - size) / 2, (img.height - size) / 2, size);
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

    const newCrop = { ...crop, [axis]: parseFloat(value) };
    setCrop(newCrop);
    drawCanvas(img, newCrop.x, newCrop.y, newCrop.size);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      onCropComplete(file);
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="bg-gray-900 rounded-xl shadow-lg max-w-md w-full p-6 border border-gray-800 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Crop Profile Picture
        </h3>

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
              />
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Zoom
              </label>
              <input
                type="range"
                min="100"
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
