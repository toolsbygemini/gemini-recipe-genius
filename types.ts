
export interface Recipe {
  recipeName: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string; // e.g., "Approx. 45 minutes"
  chefTips: string[];
  imageUrl?: string;
}
