
import React, { useRef } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';

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

  return (
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
            Or upload a photo
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
             <button
              onClick={triggerFileInput}
              disabled={isLoading}
              className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <UploadIcon className="w-8 h-8 mb-2" />
              <span className="font-semibold">Click to upload</span>
            </button>
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
  );
};
