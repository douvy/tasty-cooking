import { NextApiRequest, NextApiResponse } from 'next';
import { Recipe } from '@/types';

/**
 * Handle API errors consistently
 */
export function handleApiError(
  res: NextApiResponse,
  error: any,
  statusCode = 500,
  message = 'Internal server error'
) {
  console.error(error);
  res.status(statusCode).json({
    error: message,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}

/**
 * Validate required query parameters
 */
export function validateQueryParams(
  req: NextApiRequest,
  res: NextApiResponse,
  requiredParams: string[]
): boolean {
  const missingParams = requiredParams.filter(param => !req.query[param]);
  
  if (missingParams.length > 0) {
    res.status(400).json({
      error: `Missing required parameters: ${missingParams.join(', ')}`
    });
    return false;
  }
  
  return true;
}

/**
 * Add search capability to recipes
 */
export function searchRecipes(recipes: Recipe[], query: string): Recipe[] {
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return recipes;
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // Exact title match gets priority
  const exactMatches = recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(normalizedQuery)
  );
  
  // Then search in search terms for broader matches
  const termMatches = recipes.filter(recipe => 
    !recipe.title.toLowerCase().includes(normalizedQuery) && 
    recipe.searchTerms && 
    recipe.searchTerms.includes(normalizedQuery)
  );
  
  // Additional check for individual words in title
  const titleWordMatches = recipes.filter(recipe => 
    !exactMatches.includes(recipe) && 
    !termMatches.includes(recipe) && 
    recipe.title.toLowerCase().split(' ').some(word => 
      word.includes(normalizedQuery) || normalizedQuery.includes(word)
    )
  );
  
  // Extra fallback to ensure we don't miss anything
  const fallbackMatches = recipes.filter(recipe => 
    !exactMatches.includes(recipe) && 
    !termMatches.includes(recipe) && 
    !titleWordMatches.includes(recipe) && 
    (recipe.tags && recipe.tags.some(tag => tag.includes(normalizedQuery)))
  );
  
  // Combine results with exact matches first
  return [...exactMatches, ...termMatches, ...titleWordMatches, ...fallbackMatches];
}

/**
 * Get detailed recipe data from MDX files
 */
export async function getRecipeDetails(slug: string): Promise<any> {
  // Import the getRecipeBySlug function directly to avoid circular dependencies
  const { getRecipeBySlug } = await import('./mdx-utils');
  
  // Get recipe from MDX files
  const mdxRecipe = getRecipeBySlug(slug);
  
  if (mdxRecipe) {
    // Return the MDX recipe data
    return {
      ...mdxRecipe.frontmatter,
      slug,
      content: mdxRecipe.content
    };
  }
  
  // Fallback to default mock data if no MDX file exists
  return {
    title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: 'A delicious recipe from Tasty Cooking.',
    date: '2023-03-25',
    imgSrc: `/assets/img/${slug}.jpg`,
    prepTime: '15 min',
    readyTime: '30 min',
    servings: '4 servings',
    tags: ['Healthy'],
    ingredients: ['Ingredients will be loaded dynamically.'],
    instructions: ['Instructions will be loaded dynamically.'],
    slug
  };
}