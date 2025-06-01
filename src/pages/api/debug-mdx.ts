import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import { getRecipeBySlug, getRecipeSlugs } from '@/lib/mdx-utils';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // This is a debug endpoint to check MDX file loading
    const action = req.query.action as string;
    
    if (action === 'check-directory') {
      // Check if the recipes directory exists
      const recipesDirectory = path.join(process.cwd(), 'src/content/recipes');
      const exists = fs.existsSync(recipesDirectory);
      const stats = exists ? fs.statSync(recipesDirectory) : null;
      
      return res.status(200).json({
        exists,
        stats: stats ? {
          isDirectory: stats.isDirectory(),
          size: stats.size,
          modified: stats.mtime,
        } : null,
        directory: recipesDirectory
      });
    }
    
    if (action === 'list-files') {
      // List all files in the recipes directory
      const recipesDirectory = path.join(process.cwd(), 'src/content/recipes');
      
      if (!fs.existsSync(recipesDirectory)) {
        return res.status(404).json({ error: 'Recipes directory not found' });
      }
      
      const files = fs.readdirSync(recipesDirectory);
      
      return res.status(200).json({
        files,
        directory: recipesDirectory
      });
    }
    
    if (action === 'get-slugs') {
      // Get all recipe slugs
      const slugs = getRecipeSlugs();
      
      return res.status(200).json({
        slugs,
        count: slugs.length
      });
    }
    
    if (action === 'get-recipe') {
      const slug = req.query.slug as string;
      
      if (!slug) {
        return res.status(400).json({ error: 'Missing slug parameter' });
      }
      
      const recipe = getRecipeBySlug(slug);
      
      if (!recipe) {
        return res.status(404).json({ error: `Recipe not found: ${slug}` });
      }
      
      return res.status(200).json({
        recipe,
        slug
      });
    }
    
    // Default response with API info
    return res.status(200).json({
      message: 'MDX Debug API',
      availableActions: [
        'check-directory', 
        'list-files', 
        'get-slugs',
        'get-recipe?slug=your-recipe-slug'
      ],
      cwd: process.cwd(),
    });
    
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}