import { Recipe } from '@/types';

// All available tags
export const allTags = [
  'breakfast',
  'condiments',
  'gluten-free',
  'healthy',
  'meat',
  'quick',
  'seafood',
  'spicy',
  'vegan',
  'vegetable',
  'vegetarian'
];

// Get all tags from a list of recipes
export function getAllTagsFromRecipes(recipes: Recipe[]): string[] {
  const tagSet = new Set<string>();
  
  recipes.forEach(recipe => {
    recipe.tags.forEach(tag => {
      tagSet.add(tag);
    });
  });
  
  return Array.from(tagSet);
}

// Count recipes by tag
export function countRecipesByTag(recipes: Recipe[]): Record<string, number> {
  const tagCounts: Record<string, number> = {};
  
  recipes.forEach(recipe => {
    recipe.tags.forEach(tag => {
      if (tagCounts[tag]) {
        tagCounts[tag]++;
      } else {
        tagCounts[tag] = 1;
      }
    });
  });
  
  return tagCounts;
}

// Filter recipes by selected tags
export function filterRecipesByTags(recipes: Recipe[], selectedTags: string[]): Recipe[] {
  if (!selectedTags.length) {
    return recipes;
  }
  
  // Convert selected tags to lowercase for case-insensitive comparison
  const normalizedSelectedTags = selectedTags.map(tag => tag.toLowerCase());
  
  return recipes.filter(recipe => 
    normalizedSelectedTags.every(tag => {
      // Ensure recipe tags are also normalized for comparison
      const normalizedRecipeTags = recipe.tags.map(t => typeof t === 'string' ? t.toLowerCase() : t);
      return normalizedRecipeTags.includes(tag);
    })
  );
}

// Get tag display name (capitalized)
export function getTagDisplayName(tag: string): string {
  return tag
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}