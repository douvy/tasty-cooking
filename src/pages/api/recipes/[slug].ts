import { NextApiRequest, NextApiResponse } from 'next';
import { RecipeDetail } from '@/types';
import { getRecipeBySlug } from '@/lib/mdx-utils';
import { handleApiError, validateQueryParams } from '@/lib/api-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate that the slug parameter is provided
    if (!validateQueryParams(req, res, ['slug'])) {
      return;
    }
    
    const slug = req.query.slug as string;
    
    // Try to get the recipe from MDX files
    const mdxRecipe = getRecipeBySlug(slug);
    
    if (mdxRecipe) {
      // If we have an MDX recipe, return it
      const recipeData: RecipeDetail = {
        ...mdxRecipe.frontmatter,
        slug,
        content: mdxRecipe.content
      };
      
      res.status(200).json(recipeData);
      return;
    }
    
    // Fallback to mock recipes
    const mockRecipes: Record<string, RecipeDetail> = {
      'sesame-green-beans': {
        title: 'Sesame Green Beans',
        date: '2023-03-25',
        description: 'Relies on a simple sesame seed dressing that\'s salty, nutty, and slightly sweet. Cook the green beans briefly to maintain their crispness.',
        imgSrc: '/assets/img/sesame-green-beans.jpg',
        prepTime: '10 min',
        readyTime: '15 min',
        servings: '4 servings',
        tags: ['Gluten-Free', 'Healthy', 'Quick', 'Vegan', 'Vegetable', 'Vegetarian'],
        ingredients: [
          '1 lb green beans, trimmed and cut into 1-inch pieces (4 cups)',
          '1 tbsp toasted sesame seeds, crushed in a mortar and pestle',
          '2 tbsp soy sauce',
          '2 tbsp tahini',
          '1 tsp agave or maple syrup',
          'kosher salt'
        ],
        instructions: [
          'Set up a large bowl of ice water. In a large pot of salted boiling water, cook the green beans for 1 min, 30 seconds until slightly tender. Transfer beans to the ice water with a strainer to cool, then drain and pat dry.',
          'In a medium bowl, mix together sesame seeds, soy sauce, tahini, syrup, and 1 teaspoon of salt. Toss the beans in the sauce, seasoning with additional salt if needed. Serve immediately or store in an airtight container in the fridge for up to 1 week.'
        ],
        slug: 'sesame-green-beans'
      },
      // More mock recipes can be added here
    };

    // Check if we have the requested recipe
    if (mockRecipes[slug]) {
      res.status(200).json(mockRecipes[slug]);
      return;
    }

    // If not found, return 404
    res.status(404).json({ error: 'Recipe not found' });
  } catch (error) {
    handleApiError(res, error);
  }
}