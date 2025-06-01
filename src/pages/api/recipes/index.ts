import { NextApiRequest, NextApiResponse } from 'next';
import { Recipe } from '@/types';
import { getAllRecipes, convertMDXToRecipeList } from '@/lib/mdx-utils';
import { handleApiError, searchRecipes } from '@/lib/api-utils';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get all recipes from MDX files
    const mdxRecipes = getAllRecipes();
    const recipes = convertMDXToRecipeList(mdxRecipes);
    
    // If we don't have any MDX recipes yet, fall back to the hardcoded list
    // This ensures a smooth transition from the old system to the new MDX-based system
    if (recipes.length === 0) {
      const fallbackRecipes: Recipe[] = [
        { title: "Sesame Green Beans", link: "sesame-green-beans", img: "/assets/img/sesame-green-beans.jpg", tags: ["gluten-free", "healthy", "quick", "vegan", "vegetable", "vegetarian"] },
        { title: "Guacamole", link: "guacamole", img: "/assets/img/guacamole.jpg", tags: ["condiments", "gluten-free", "healthy", "quick", "vegan", "vegetarian"] },
        { title: "Roasted Cauliflower", link: "roasted-cauliflower", img: "/assets/img/roasted-cauliflower.jpg", tags: ["gluten-free", "healthy", "quick", "vegan", "vegetable", "vegetarian"] },
        { title: "Roasted Broccolini", link: "roasted-broccolini", img: "/assets/img/grilled-broccolini.jpg", tags: ["meat", "vegetable", "spicy"] },
        { title: "Nashville Hot Chicken", link: "nashville-hot-chicken", img: "/assets/img/nashville-chicken.jpg", tags: ["meat", "spicy"] },
        { title: "Honey Butter Pancakes", link: "honey-butter-pancakes", img: "/assets/img/pancakes.jpg", tags: ["breakfast"] },
        { title: "Charred Brussels Sprouts", link: "charred-brussels-sprouts", img: "/assets/img/charred-brussels-sprouts.jpg", tags: ["gluten-free", "healthy", "meat", "quick", "vegetable"] },
        { title: "Cajun Honey Butter Salmon", link: "cajun-honey-butter-salmon", img: "/assets/img/cajun-salmon.jpg", tags: ["gluten-free", "quick", "seafood", "spicy"] },
        { title: "Salsa", link: "salsa", img: "/assets/img/salsa.jpg", tags: ["condiments", "gluten-free", "healthy", "quick", "spicy"] },
        { title: "Japanese Tebasaki Wings", link: "japanese-tebasaki-wings", img: "/assets/img/japanese-wings.jpg", tags: ["gluten-free", "meat", "spicy"] },
        { title: "Crunchy Pappardelle", link: "crunchy-pappardelle", img: "/assets/img/crunchy-pappardelle.jpg", tags: ["vegetable", "vegetarian", "healthy"] },
        { title: "Chimichurri", link: "chimichurri", img: "/assets/img/chimichurri.jpg", tags: ["condiments", "gluten-free", "vegan", "vegetarian"] }
      ];
      
      res.status(200).json(fallbackRecipes);
      return;
    }
    
    // Handle search query parameter
    if (req.query.search && typeof req.query.search === 'string') {
      const searchQuery = req.query.search;
      const searchResults = searchRecipes(recipes, searchQuery);
      res.status(200).json(searchResults);
      return;
    }
    
    // Handle tag filtering
    if (req.query.tags && typeof req.query.tags === 'string') {
      const tags = req.query.tags.split(',');
      const filteredRecipes = recipes.filter(recipe => 
        tags.every(tag => recipe.tags.includes(tag))
      );
      res.status(200).json(filteredRecipes);
      return;
    }
    
    // Return all recipes if no filters
    res.status(200).json(recipes);
  } catch (error) {
    handleApiError(res, error);
  }
}