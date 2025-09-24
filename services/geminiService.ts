
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, Source } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseRecipeText = (text: string): Partial<Recipe> => {
    const recipe: Partial<Recipe> = {};
    const lines = text.split('\n');
    let currentSection: keyof Recipe | null = null;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('## RECIPE NAME')) {
            recipe.recipeName = trimmedLine.replace('## RECIPE NAME', '').trim();
            currentSection = null;
        } else if (trimmedLine.startsWith('## DESCRIPTION')) {
            recipe.description = trimmedLine.replace('## DESCRIPTION', '').trim();
            currentSection = null;
        } else if (trimmedLine.startsWith('## COOKING TIME')) {
            recipe.cookingTime = trimmedLine.replace('## COOKING TIME', '').trim();
            currentSection = null;
        } else if (trimmedLine.startsWith('## INGREDIENTS')) {
            currentSection = 'ingredients';
            recipe.ingredients = [];
        } else if (trimmedLine.startsWith('## INSTRUCTIONS')) {
            currentSection = 'instructions';
            recipe.instructions = [];
        } else if (trimmedLine.startsWith('## CHEF\'S TIPS')) {
            currentSection = 'chefTips';
            recipe.chefTips = [];
        } else if (currentSection && trimmedLine) {
            const cleanLine = trimmedLine.replace(/^\s*[\*\-]\s*|^\s*\d+\.\s*/, '');
            if (recipe[currentSection]) {
                (recipe[currentSection] as string[]).push(cleanLine);
            }
        }
    }
    return recipe;
}


export const generateRecipe = async (
  ingredients: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<Recipe> => {
  const textPrompt = `You are a helpful recipe assistant. Using the latest information from the web, find the best and most popular recipe based on the following ingredients (from text and/or an image): ${ingredients || 'no text input'}. Analyze the image if provided.

Please structure your response with the following sections, each on a new line and exactly as written:
## RECIPE NAME
## DESCRIPTION
## COOKING TIME
## INGREDIENTS
(as a bulleted list starting with *)
## INSTRUCTIONS
(as a numbered list starting with 1.)
## CHEF'S TIPS
(as a bulleted list starting with *)
`;

  const contents = [];
  if (imageBase64 && imageMimeType) {
    contents.push({
      inlineData: {
        data: imageBase64,
        mimeType: imageMimeType,
      }
    });
  }
  contents.push({ text: textPrompt });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: contents },
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const text = response.text;
    const recipeData = parseRecipeText(text);
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources: Source[] = groundingChunks
        .map(chunk => chunk.web)
        .filter((web): web is Source => !!web);

    recipeData.sources = sources;

    if (
      !recipeData.recipeName || 
      !recipeData.description || 
      !recipeData.ingredients?.length || 
      !recipeData.instructions?.length ||
      !recipeData.cookingTime ||
      !recipeData.chefTips?.length
    ) {
      console.error("Parsed recipe data is incomplete:", recipeData);
      throw new Error("Invalid recipe format received from API.");
    }

    return recipeData as Recipe;
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Could not generate a recipe from the provided ingredients.");
  }
};
