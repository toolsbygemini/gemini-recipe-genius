
import React, { useRef, useState, useEffect } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CameraIcon } from './icons/CameraIcon';

interface IngredientInputProps {
  ingredients: string;
  setIngredients: (value: string) => void;
  uploadedImage: { base64: string; mimeType: string } | null;
  setUploadedImage: (image: { base64: string; mimeType: string } | null) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const IngredientInput: React.FC<IngredientInputProps> = ({
  ingredients,
  setIngredients,
  uploadedImage,
  setUploadedImage,
  onGenerate,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        const [meta, base64] = result.split(',');
        const mimeType = meta.split(';')[0].split(':')[1];
        setUploadedImage({ base64, mimeType });
      };
      reader.readAsDataURL(file);
    }
    event.target.value = ''; // Reset file input
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleCloseCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const handleOpenCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access the camera. Please ensure you have a camera connected and have granted permission in your browser settings.");
    }
  };
  
  const handleCapturePhoto = () => {
    const canvas = document.createElement('canvas');
    if (videoRef.current) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const [meta, base64] = dataUrl.split(',');
        const mimeType = meta.split(';')[0].split(':')[1];
        setUploadedImage({ base64, mimeType });
        handleCloseCamera();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);


  return (
    <>
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-shadow hover:shadow-xl">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="ingredients"
              className="block text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200"
            >
              List your ingredients (optional)
            </label>
            <textarea
              id="ingredients"
              rows={4}
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="w-full p-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-emerald-500 dark:focus:border-emerald-400 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition duration-300 ease-in-out resize-none text-base placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="e.g., chicken breast, broccoli, rice, soy sauce"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Or add a photo
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
              accept="image/*"
              disabled={isLoading}
            />
            {uploadedImage ? (
              <div className="relative w-full h-full min-h-[120px] rounded-lg overflow-hidden group">
                  <img src={`data:${uploadedImage.mimeType};base64,${uploadedImage.base64}`} alt="Ingredients preview" className="w-full h-full object-cover" />
                  <button
                      onClick={() => setUploadedImage(null)}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-white"
                      aria-label="Remove image"
                  >
                      <TrashIcon className="w-5 h-5" />
                  </button>
              </div>
            ) : (
                <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg p-4 min-h-[120px] hover:border-emerald-500/50 transition-colors">
                  <div className="flex flex-col sm:flex-row gap-4">
                      <button
                          onClick={triggerFileInput}
                          disabled={isLoading}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors bg-white/50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-600/50 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                      >
                          <UploadIcon className="w-5 h-5" />
                          <span>Upload File</span>
                      </button>
                      <button
                          onClick={handleOpenCamera}
                          disabled={isLoading}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors bg-white/50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-600/50 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                      >
                          <CameraIcon className="w-5 h-5" />
                          <span>Use Camera</span>
                      </button>
                  </div>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onGenerate}
          disabled={isLoading || (!ingredients.trim() && !uploadedImage)}
          className="mt-4 w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-emerald-300 disabled:to-teal-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:transform-none disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:focus:ring-emerald-800"
        >
          {isLoading ? (
            'Creating magic...'
          ) : (
            <>
              <SparklesIcon className="w-6 h-6" />
              <span className="text-lg">Generate Recipe</span>
            </>
          )}
        </button>
      </div>

      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="relative bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700">
                <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-lg mb-4 aspect-video object-cover bg-gray-900"></video>
                <div className="flex justify-center">
                    <button
                        onClick={handleCapturePhoto}
                        className="w-16 h-16 rounded-full bg-white border-4 border-emerald-500 hover:bg-emerald-100 transition-colors focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:focus:ring-emerald-800"
                        aria-label="Capture photo"
                    ></button>
                </div>
                <button
                    onClick={handleCloseCamera}
                    className="absolute top-3 right-3 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                    aria-label="Close camera"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
      )}
    </>
  );
};
