
import React, { useState } from 'react';
import { Recipe } from '../types';
import { CameraIcon } from './icons/CameraIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ClockIcon } from './icons/ClockIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    const ingredientsText = recipe.ingredients.map(ing => `- ${ing}`).join('\n');
    const instructionsText = recipe.instructions.map((step, index) => `${index + 1}. ${step}`).join('\n');
    const tipsText = recipe.chefTips.map(tip => `- ${tip}`).join('\n');

    const fullRecipeText = `
${recipe.recipeName}

${recipe.description}

--- COOKING TIME ---
${recipe.cookingTime}

--- INGREDIENTS ---
${ingredientsText}

--- INSTRUCTIONS ---
${instructionsText}

--- CHEF'S TIPS ---
${tipsText}
    `.trim();

    navigator.clipboard.writeText(fullRecipeText).then(() => {
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 2500);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="aspect-w-16 aspect-h-9 w-full bg-gray-200 dark:bg-gray-700">
        {!recipe.imageUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-4 text-center">
             <CameraIcon className="w-12 h-12 mb-2 animate-pulse text-emerald-500" />
            <p className="text-lg font-medium">Plating your dish...</p>
            <p className="text-sm">Generating a delicious image.</p>
          </div>
        ) : (
          <img 
            src={recipe.imageUrl} 
            alt={recipe.recipeName} 
            className="w-full h-full object-cover animate-fade-in"
          />
        )}
      </div>

      <div className="p-6 md:p-8">
        <div className="flex justify-between items-start gap-4 mb-2">
            <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{recipe.recipeName}</h2>
            </div>
             <button 
                onClick={handleCopy}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out border ${isCopied ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
                aria-live="polite"
            >
                {isCopied ? (
                    <>
                        <CheckIcon className="w-5 h-5" />
                        <span>Copied!</span>
                    </>
                ) : (
                    <>
                        <ClipboardIcon className="w-5 h-5" />
                        <span>Copy Recipe</span>
                    </>
                )}
            </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4 italic text-lg">{recipe.description}</p>
        
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 bg-emerald-50 dark:bg-gray-700/50 px-4 py-2 rounded-lg mb-8">
            <ClockIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="font-semibold text-gray-800 dark:text-gray-200">Cooking Time:</span>
            <span className="text-gray-700 dark:text-gray-300">{recipe.cookingTime}</span>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-300 dark:border-emerald-600 pb-2 mb-4 flex items-center gap-2">
              Ingredients
            </h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700 dark:text-gray-300">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3">
            <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-300 dark:border-emerald-600 pb-2 mb-4 flex items-center gap-2">
              Instructions
            </h3>
            <ol className="space-y-5 text-gray-700 dark:text-gray-300">
              {recipe.instructions.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 bg-emerald-500 text-white rounded-full h-8 w-8 text-base font-bold flex items-center justify-center mr-4 mt-0.5 shadow">
                    {index + 1}
                  </span>
                  <p className="leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
             <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 pb-2 mb-4 flex items-center gap-3">
                <LightBulbIcon className="w-7 h-7" />
                Chef's Tips
            </h3>
            <ul className="space-y-3">
                {recipe.chefTips.map((tip, index) => (
                    <li key={index} className="flex items-start p-3 bg-emerald-50/50 dark:bg-gray-700/40 rounded-lg">
                        <span className="text-emerald-500 dark:text-emerald-400 font-bold text-xl mr-3 mt-0.5">💡</span>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{tip}</p>
                    </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
};
