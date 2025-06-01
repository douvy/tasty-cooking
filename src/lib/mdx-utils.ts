import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { MDXRecipe, Recipe, RecipeFrontmatter } from '@/types';
import { RECIPE_CUSTOM_ORDER } from '@/lib/constants';

// Get the recipes directory path
function getRecipesDirectory(): string {
  // Always use the path relative to the project root
  return path.join(process.cwd(), 'src/content/recipes');
}

// Get the recipes directory path
const RECIPES_DIRECTORY = getRecipesDirectory();

// Safety check for production environment
let IS_DIRECTORY_AVAILABLE = false;
try {
  IS_DIRECTORY_AVAILABLE = fs.existsSync(RECIPES_DIRECTORY) && fs.statSync(RECIPES_DIRECTORY).isDirectory();
} catch (error) {
  IS_DIRECTORY_AVAILABLE = false;
}

/**
 * Get all recipe slugs from the content directory
 */
export function getRecipeSlugs(): string[] {
  // If running in a serverless environment where filesystem might not be accessible,
  // return the static list of known recipe slugs from our constants
  if (!IS_DIRECTORY_AVAILABLE && RECIPE_CUSTOM_ORDER && RECIPE_CUSTOM_ORDER.length > 0) {
    return RECIPE_CUSTOM_ORDER;
  }
  
  try {
    if (!fs.existsSync(RECIPES_DIRECTORY)) {
      return RECIPE_CUSTOM_ORDER || [];
    }
    
    const files = fs.readdirSync(RECIPES_DIRECTORY)
      .filter(file => file.endsWith('.mdx'))
      .map(file => file.replace(/\.mdx$/, ''));
      
    // If no files found but we have a static list, use that as fallback
    if (files.length === 0 && RECIPE_CUSTOM_ORDER && RECIPE_CUSTOM_ORDER.length > 0) {
      return RECIPE_CUSTOM_ORDER;
    }
    
    return files;
  } catch (error) {
    // Fall back to static list if available
    return RECIPE_CUSTOM_ORDER || [];
  }
}

/**
 * Get recipe content by slug
 */
export function getRecipeBySlug(slug: string): MDXRecipe | null {
  try {
    const fullPath = path.join(RECIPES_DIRECTORY, `${slug}.mdx`);
    
    // Check if we can access the filesystem and if the file exists
    let fileContents: string;
    
    if (IS_DIRECTORY_AVAILABLE && fs.existsSync(fullPath)) {
      // Read file content from the filesystem
      fileContents = fs.readFileSync(fullPath, 'utf8');
    } else {
      // In serverless environments, we may not be able to read from the filesystem
      // Here we would typically fetch from a CMS or API
      // For this project, we'll generate a basic fallback MDX content based on slug
      
      // Generate fallback content based on slug
      const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      
      fileContents = `---
title: ${title}
description: A delicious recipe for ${title}
date: 2023-01-01
imgSrc: /assets/img/${slug}.jpg
imgAlt: ${title}
prepTime: 30 min
readyTime: 45 min
servings: 4 servings
tags: [${getTagsForSlug(slug)}]
ingredients:
  - Follow directions on tasty.cooking website
instructions:
  - View the full recipe on tasty.cooking
---

This recipe is available on the Tasty Cooking website. 
Please visit https://www.tasty.cooking/${slug} to view the complete recipe.`;
    }
    
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
    return null;
  }
}

/**
 * Helper function to get tags for a slug when generating fallback content
 */
function getTagsForSlug(slug: string): string {
  // Base tag mapping from the original tag mapping in search-service.js
  const tagMap: Record<string, string[]> = {
    'pancakes': ['breakfast'],
    'smoothie': ['breakfast', 'healthy'],
    'hash': ['breakfast'],
    'chicken': ['meat'],
    'wings': ['meat'],
    'salmon': ['seafood'],
    'beans': ['vegetarian'],
    'soup': ['healthy'],
    'salad': ['healthy', 'vegetable'],
    'tofu': ['vegetarian'],
    'vegan': ['vegan'],
    'kimchi': ['spicy'],
    'cauliflower': ['vegetable', 'healthy'],
    'broccolini': ['vegetable', 'healthy'],
    'brussels': ['vegetable'],
    'beets': ['vegetable'],
    'sweet-potato': ['vegetable'],
    'green-sauce': ['condiments', 'spicy', 'vegetable'],
    'radishes': ['vegetable', 'gluten-free', 'healthy'],
    'butter': ['condiments', 'quick'],
    'garlic': ['condiments'],
    'spicy': ['spicy'],
    'tomato': ['vegetable']
  };
  
  // Extract potential tags from slug
  let tags: string[] = [];
  Object.entries(tagMap).forEach(([key, values]) => {
    if (slug.includes(key)) {
      tags = [...tags, ...values];
    }
  });
  
  // Remove duplicates
  const uniqueTags = [...new Set(tags)];
  
  // Return comma-separated tags or default to 'recipe'
  return uniqueTags.length > 0 ? uniqueTags.join('\', \'') : 'recipe';
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