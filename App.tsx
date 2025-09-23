
import React, { useState, useCallback } from 'react';
import { Recipe } from './types';
import { generateRecipe, generateRecipeImage } from './services/geminiService';
import { RecipeCard } from './components/RecipeCard';
import { IngredientInput } from './components/IngredientInput';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ChefHatIcon } from './components/icons/ChefHatIcon';
import { ErrorDisplay } from './components/ErrorDisplay';

const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<{base64: string; mimeType: string} | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateRecipe = useCallback(async () => {
    if (!ingredients.trim() && !uploadedImage) {
      setError('Please enter some ingredients or upload an image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecipe(null);
    try {
      const recipeData = await generateRecipe(
        ingredients,
        uploadedImage?.base64,
        uploadedImage?.mimeType
      );
      setRecipe(recipeData);
      setIsLoading(false); // Stop main spinner, show recipe text

      // Now generate the image
      const imageUrl = await generateRecipeImage(recipeData.recipeName, recipeData.description);
      setRecipe(currentRecipe => 
        currentRecipe ? { ...currentRecipe, imageUrl } : null
      );

    } catch (err) {
      console.error(err);
      setError('Failed to generate a recipe or image. Please check your input or try again later.');
      setIsLoading(false);
    }
  }, [ingredients, uploadedImage]);

  return (
    <div className="min-h-screen font-sans text-gray-800 dark:text-gray-200 transition-colors duration-500 bg-gray-50 dark:bg-gray-900">
      <div 
        className="absolute top-0 left-0 w-full h-full z-0 opacity-30 dark:opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle at 10% 20%, rgb(39, 173, 137) 0%, transparent 50%), radial-gradient(circle at 80% 90%, rgb(41, 128, 185) 0%, transparent 50%)'
        }}
      ></div>
      <main className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        <header className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <ChefHatIcon className="w-16 h-16 text-emerald-500 drop-shadow-lg" />
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
              Recipe Genius
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Transform pantry staples into culinary marvels. Your next favorite meal is just a click away.
          </p>
        </header>

        <div className="max-w-3xl mx-auto">
          <IngredientInput
            ingredients={ingredients}
            setIngredients={setIngredients}
            uploadedImage={uploadedImage}
            setUploadedImage={setUploadedImage}
            onGenerate={handleGenerateRecipe}
            isLoading={isLoading}
          />

          {error && <ErrorDisplay message={error} />}

          <div className="mt-10">
            {isLoading && <LoadingSpinner message="Crafting your custom recipe..." />}
            {recipe && (
              <div className="animate-fade-in">
                <RecipeCard recipe={recipe} />
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="text-center py-6 text-sm text-gray-500 dark:text-gray-400 relative z-10">
        <p>Created by Smart Tell Line | Powered by gemini-2.5-flash</p>
      </footer>
    </div>
  );
};

export default App;
