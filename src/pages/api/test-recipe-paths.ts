import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get current working directory
    const cwd = process.cwd();
    
    // Attempt to find the recipes directory in various locations
    const possiblePaths = [
      path.join(cwd, 'src/content/recipes'),
      path.join(cwd, 'content/recipes'),
      path.join(cwd, 'recipes'),
      path.join(cwd, 'public/content/recipes')
    ];
    
    const pathResults = possiblePaths.map(p => ({
      path: p,
      exists: fs.existsSync(p),
      isDirectory: fs.existsSync(p) ? fs.statSync(p).isDirectory() : false,
      files: fs.existsSync(p) && fs.statSync(p).isDirectory() 
        ? fs.readdirSync(p) 
        : []
    }));
    
    // Get directory structure of the src directory
    const srcPath = path.join(cwd, 'src');
    const srcContents = fs.existsSync(srcPath) 
      ? scanDirectory(srcPath, 2) // Scan 2 levels deep
      : { error: 'src directory not found' };
    
    // Return all the test information
    res.status(200).json({
      cwd,
      pathResults,
      nodeEnv: process.env.NODE_ENV,
      srcContents
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ 
      error: 'Error testing recipe paths',
      message: errorMessage
    });
  }
}

// Define types for directory scanning
type FileInfo = {
  size: number;
  modified: Date;
};

type DirectoryContents = {
  [key: string]: DirectoryContents | FileInfo | string | DirectoryError;
};

type DirectoryError = {
  error: string;
  path: string;
};

// Helper function to scan a directory recursively
function scanDirectory(dir: string, depth: number = 1): DirectoryContents | string | DirectoryError {
  if (depth < 0) return '...'; // Stop recursion at max depth
  
  try {
    const result: DirectoryContents = {};
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        result[file] = scanDirectory(filePath, depth - 1);
      } else {
        result[file] = {
          size: stat.size,
          modified: stat.mtime
        };
      }
    }
    
    return result;
  } catch (error) {
    // Return structured error information that's safe to expose to clients
    // without revealing sensitive implementation details or stack traces
    return { 
      error: 'Error scanning directory',
      path: dir
    };
  }
}