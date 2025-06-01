import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { MDXRecipe, Recipe, RecipeFrontmatter } from '@/types';
import { RECIPE_CUSTOM_ORDER } from '@/lib/constants';

// Determine the correct path to the recipes directory based on environment
function getRecipesDirectory(): string {
  const defaultPath = path.join(process.cwd(), 'src/content/recipes');
  
  // In development, use the default path
  if (process.env.NODE_ENV === 'development') {
    return defaultPath;
  }
  
  // For production, try to use the default path first, but have fallbacks
  const productionPaths = [
    defaultPath,
    path.join(process.cwd(), 'content/recipes'),
    path.join(process.cwd(), 'recipes'),
  ];
  
  // Return the first path that exists and is a directory
  for (const dirPath of productionPaths) {
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      return dirPath;
    }
  }
  
  // If none exist, return the default path (we'll handle the error when trying to read from it)
  return defaultPath;
}

// Get the recipes directory dynamically
const RECIPES_DIRECTORY = getRecipesDirectory();

/**
 * Get all recipe slugs from the content directory
 */
export function getRecipeSlugs(): string[] {
  try {
    if (!fs.existsSync(RECIPES_DIRECTORY)) {
      return [];
    }
    
    return fs.readdirSync(RECIPES_DIRECTORY)
      .filter(file => file.endsWith('.mdx'))
      .map(file => file.replace(/\.mdx$/, ''));
  } catch (error) {
    console.error('Error getting recipe slugs:', error);
    return [];
  }
}

/**
 * Get recipe content by slug
 */
export function getRecipeBySlug(slug: string): MDXRecipe | null {
  try {
    const fullPath = path.join(RECIPES_DIRECTORY, `${slug}.mdx`);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    
    // Read file content
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    
    // Parse frontmatter and content
    const { data, content } = matter(fileContents);
    
    // Validate required fields
    const requiredFields: Array<keyof RecipeFrontmatter> = [
      'title', 'description', 'date', 'imgSrc', 
      'prepTime', 'readyTime', 'servings', 'tags',
      'instructions'
    ];
    
    // Special handling for ingredients - it's required but can be empty if ingredients_subsections exists
    if (!data.ingredients && !data.ingredients_subsections) {
      requiredFields.push('ingredients');
    }
    
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Recipe ${slug} is missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Ensure arrays are properly formatted
    if (!Array.isArray(data.tags)) {
      data.tags = data.tags ? [data.tags] : [];
    }
    
    // Normalize tag case - convert all tags to lowercase
    if (Array.isArray(data.tags)) {
      data.tags = data.tags.map(tag => typeof tag === 'string' ? tag.toLowerCase() : tag);
    }
    
    if (!Array.isArray(data.ingredients)) {
      data.ingredients = data.ingredients ? [data.ingredients] : [];
    }
    
    if (!Array.isArray(data.instructions)) {
      data.instructions = data.instructions ? [data.instructions] : [];
    }
    
    // Optional field validation
    if (data.notes && !Array.isArray(data.notes)) {
      data.notes = [data.notes];
    }
    
    // Ensure image path starts with a slash
    if (data.imgSrc && typeof data.imgSrc === 'string' && !data.imgSrc.startsWith('/')) {
      data.imgSrc = `/${data.imgSrc}`;
    }
    
    const frontmatter = data as RecipeFrontmatter;
    
    // Ensure ingredients_subsections is properly structured if it exists
    if (data.ingredients_subsections && Array.isArray(data.ingredients_subsections)) {
      frontmatter.ingredients_subsections = data.ingredients_subsections;
    }

    // Return structured recipe with reading time
    return {
      slug,
      frontmatter,
      content,
      readingTime: readingTime(content)
    };
  } catch (error) {
    console.error(`Error getting recipe ${slug}:`, error);
    return null;
  }
}

/**
 * Get all recipes
 */
export function getAllRecipes(): MDXRecipe[] {
  const slugs = getRecipeSlugs();
  const recipes = slugs
    .map(slug => getRecipeBySlug(slug))
    .filter((recipe): recipe is MDXRecipe => recipe !== null);
    
  // Use custom order if available, otherwise sort by date
  if (RECIPE_CUSTOM_ORDER && RECIPE_CUSTOM_ORDER.length > 0) {
    // Create a map for O(1) lookup of position
    const orderMap: Record<string, number> = {};
    RECIPE_CUSTOM_ORDER.forEach((slug, index) => {
      orderMap[slug] = index;
    });
    
    // Sort based on the custom order
    recipes.sort((a, b) => {
      const posA = orderMap[a.slug] !== undefined ? orderMap[a.slug] : Number.MAX_SAFE_INTEGER;
      const posB = orderMap[b.slug] !== undefined ? orderMap[b.slug] : Number.MAX_SAFE_INTEGER;
      return posA - posB;
    });
  } else {
    // Fallback to date-based sorting
    recipes.sort((a, b) => {
      // Sort by date descending (newest first)
      return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime();
    });
  }
  
  return recipes;
}

/**
 * Convert MDX recipes to the Recipe format used by the search service
 */
export function convertMDXToRecipeList(mdxRecipes: MDXRecipe[]): Recipe[] {
  return mdxRecipes.map(recipe => ({
    title: recipe.frontmatter.title,
    link: recipe.slug,
    img: recipe.frontmatter.imgSrc,
    tags: recipe.frontmatter.tags,
    searchTerms: generateSearchTerms(recipe),
    // Include ingredient_subsections data for any custom rendering
    ingredients_subsections: recipe.frontmatter.ingredients_subsections || []
  }));
}

/**
 * Generate comprehensive search terms for a recipe
 */
function generateSearchTerms(recipe: MDXRecipe): string {
  const { frontmatter, slug } = recipe;
  
  // Start with existing search terms if available
  const terms: string[] = [];
  
  if (frontmatter.searchTerms) {
    terms.push(frontmatter.searchTerms);
  }
  
  // Add title, slug, and tags
  terms.push(frontmatter.title.toLowerCase());
  terms.push(slug.replace(/-/g, ' '));
  terms.push(...frontmatter.tags
    .filter(tag => typeof tag === 'string')
    .map(tag => tag.toLowerCase()));
  
  // Add ingredients as search terms
  terms.push(...frontmatter.ingredients.map(ingredient => {
    // Make sure ingredient is a string before using string methods
    if (typeof ingredient !== 'string') {
      console.warn(`Non-string ingredient found: ${JSON.stringify(ingredient)}`);
      return '';
    }
    
    // Extract the main ingredient name by removing quantities and preparations
    const mainIngredient = ingredient
      .replace(/^\d+\/?\d*\s*(cup|tablespoon|teaspoon|tbsp|tsp|g|kg|ml|l|oz|pound|lb|pinch|to taste)s?\b/i, '')
      .replace(/,.*$/, '')
      .trim();
    
    return mainIngredient.toLowerCase();
  }));
  
  // Add description words longer than 3 letters
  if (typeof frontmatter.description === 'string') {
    frontmatter.description
      .split(/\s+/)
      .map(word => word.replace(/[^\w]/g, '').toLowerCase())
      .filter(word => word.length > 3)
      .forEach(word => terms.push(word));
  }
  
  // Filter out duplicates and very short words, then join with spaces
  return Array.from(new Set(terms))
    .filter(term => term && term.length > 2)
    .join(' ');
}