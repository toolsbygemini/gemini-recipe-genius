import { GoogleGenAI } from "@google/genai";
import { Recipe } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseRecipeText = (text: string): Partial<Recipe> => {
    const recipe: Partial<Recipe> = {};

    // Helper to extract content based on a section title.
    // It uses a regular expression to capture everything until the next section title or the end of the string.
    // This is more robust against minor formatting variations from the model.
    const extractSection = (sectionTitle: string): string => {
        try {
            // Escape special regex characters in the title, like the apostrophe in "CHEF'S TIPS"
            const escapedTitle = sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`#+\\s*${escapedTitle}\\s*\\n?([\\s\\S]*?)(?=\\n#+|$)`, 'i');
            const match = text.match(regex);
            return match && match[1] ? match[1].trim() : '';
        } catch (e) {
            console.error(`Regex error for section "${sectionTitle}":`, e);
            return '';
        }
    };
    
    recipe.recipeName = extractSection('RECIPE NAME');
    recipe.description = extractSection('DESCRIPTION');
    recipe.cookingTime = extractSection('COOKING TIME');

    const ingredientsStr = extractSection('INGREDIENTS');
    if (ingredientsStr) {
        recipe.ingredients = ingredientsStr
            .split('\n')
            .map(line => line.trim().replace(/^\s*[\*\-]\s*|^\s*\d+\.\s*/, '').trim())
            .filter(line => line.length > 0);
    } else {
        recipe.ingredients = [];
    }

    const instructionsStr = extractSection('INSTRUCTIONS');
    if (instructionsStr) {
        recipe.instructions = instructionsStr
            .split('\n')
            .map(line => line.trim().replace(/^\s*[\*\-]\s*|^\s*\d+\.\s*/, '').trim())
            .filter(line => line.length > 0);
    } else {
        recipe.instructions = [];
    }

    const tipsStr = extractSection("CHEF'S TIPS");
    if (tipsStr) {
        recipe.chefTips = tipsStr
            .split('\n')
            .map(line => line.trim().replace(/^\s*[\*\-]\s*|^\s*\d+\.\s*/, '').trim())
            .filter(line => line.length > 0);
    } else {
        recipe.chefTips = [];
    }

    return recipe;
};


export const generateRecipe = async (
  ingredients: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<Recipe> => {
  const textPrompt = `You are a creative and helpful recipe assistant. Generate a delicious recipe based on the following ingredients (from text and/or an image): ${ingredients || 'no text input'}. Analyze the image if provided.

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
    });

    const text = response.text;
    const recipeData = parseRecipeText(text);

    // Validation is now more flexible. Only the core components of a recipe are required.
    // The model might not always provide a description, cooking time, or chef's tips.
    if (
      !recipeData.recipeName || 
      !recipeData.ingredients?.length || 
      !recipeData.instructions?.length
    ) {
      console.error("Parsed recipe data is incomplete:", recipeData);
      throw new Error("Invalid recipe format received from API.");
    }

    // The parser initializes missing text fields to '' and array fields to [].
    // This cast is safe because we've validated the required fields and the parser handles the optional ones.
    return recipeData as Recipe;
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Could not generate a recipe from the provided ingredients.");
  }
};