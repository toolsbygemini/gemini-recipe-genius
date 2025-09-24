
export interface Source {
  uri: string;
  title: string;
}

export interface Recipe {
  recipeName: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string; // e.g., "Approx. 45 minutes"
  chefTips: string[];
  sources?: Source[];
}
