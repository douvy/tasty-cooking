/**
 * Utility to help convert recipes from JSON to MDX format
 * This is a developer tool to aid in the migration process
 */

import fs from 'fs';
import path from 'path';
import { RecipeDetail } from '@/types';

const RECIPES_DIRECTORY = path.join(process.cwd(), 'src/content/recipes');

/**
 * Converts a recipe object to MDX format with frontmatter
 */
export function convertRecipeToMDX(recipe: RecipeDetail): string {
  // Format the frontmatter
  const frontmatter = [
    '---',
    `title: ${recipe.title}`,
    `description: ${recipe.description}`,
    `date: ${recipe.date || '2023-04-01'}`,
    recipe.lastUpdated ? `lastUpdated: ${recipe.lastUpdated}` : '',
    `imgSrc: ${recipe.imgSrc}`,
    recipe.imgAlt ? `imgAlt: ${recipe.imgAlt}` : '',
    `prepTime: ${recipe.prepTime}`,
    `readyTime: ${recipe.readyTime}`,
    `servings: ${recipe.servings}`,
    'tags:',
    ...recipe.tags.map(tag => `  - ${tag}`),
    'ingredients:',
    ...recipe.ingredients.map(ingredient => `  - ${ingredient}`),
    'instructions:',
    ...recipe.instructions.map(instruction => `  - ${instruction}`),
  ];

  // Add notes if they exist
  if (recipe.notes && recipe.notes.length > 0) {
    frontmatter.push('notes:');
    recipe.notes.forEach(note => {
      frontmatter.push(`  - ${note}`);
    });
  }

  frontmatter.push('---');

  // Add content if it exists
  const content = recipe.content || `
## Recipe Tips

- This recipe is best served immediately while hot.
- Leftovers can be stored in an airtight container in the refrigerator for up to 3 days.
- Reheat gently in a microwave or on the stovetop.
`;

  // Combine frontmatter and content
  return frontmatter.filter(Boolean).join('\n') + '\n\n' + content;
}

/**
 * Converts a recipe and saves it as an MDX file
 */
export function saveRecipeAsMDX(recipe: RecipeDetail): void {
  // Ensure the recipes directory exists
  if (!fs.existsSync(RECIPES_DIRECTORY)) {
    fs.mkdirSync(RECIPES_DIRECTORY, { recursive: true });
  }

  // Convert recipe to MDX
  const mdxContent = convertRecipeToMDX(recipe);

  // Save to file
  const filePath = path.join(RECIPES_DIRECTORY, `${recipe.slug}.mdx`);
  fs.writeFileSync(filePath, mdxContent);

  console.log(`Recipe saved to: ${filePath}`);
}

/**
 * Batch converts multiple recipes to MDX format
 */
export function batchConvertRecipes(recipes: RecipeDetail[]): void {
  recipes.forEach(recipe => {
    try {
      saveRecipeAsMDX(recipe);
    } catch (error) {
      console.error(`Failed to convert recipe ${recipe.slug}:`, error);
    }
  });

  console.log(`Converted ${recipes.length} recipes to MDX format`);
}