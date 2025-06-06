# Contributing to Tasty Cooking

Thanks for your interest in contributing to Tasty Cooking! This guide explains how to add a new recipe to our collection.

## Adding a New Recipe

Adding a recipe is simple and requires only two files:
1. An **MDX file** with your recipe content
2. A **JPG image** of the prepared dish

### Step 1: Create the Recipe MDX File

Create a new `.mdx` file in the `src/content/recipes/` directory with a descriptive slug name (e.g., `chocolate-chip-cookies.mdx`).

Your MDX file must include this structure:

```mdx
---
title: "Recipe Title"
description: "Brief 1-2 sentence description of the dish"
date: "YYYY-MM-DD"
imgSrc: "/assets/img/your-image-filename.jpg"
prepTime: "XX min"
readyTime: "XX min" 
servings: X
tags: ["tag1", "tag2", "tag3"]
ingredients: [
  "Ingredient 1",
  "Ingredient 2",
  "Ingredient 3"
]
instructions: [
  "Step 1 instructions",
  "Step 2 instructions",
  "Step 3 instructions"
]
---

Additional content about the recipe goes here. This can include background, tips, 
variations, and any other relevant information.
```

#### Required Fields:
- `title`: Recipe name
- `description`: Brief description
- `date`: Publication date
- `imgSrc`: Path to the image
- `prepTime`: Preparation time
- `readyTime`: Total time until ready to eat
- `servings`: Number of servings
- `tags`: Categorization tags
- `ingredients`: List of ingredients
- `instructions`: Step-by-step directions

#### Optional Fields:
- `lastUpdated`: Date of last update
- `imgAlt`: Alternative text for the image
- `notes`: Special notes about the recipe
- `searchTerms`: Additional terms for search optimization

### Step 2: Add the Recipe Image

1. Save your recipe image as a JPG file
2. Place it in the `/public/assets/img/` directory
3. Use the same name as your MDX file slug

#### Image Requirements:
- Format: JPG
- Dimensions: 1200×800 pixels (3:2 aspect ratio preferred)
- File size: 500-800KB max (optimize for web)
- Quality: Clear, well-lit photo of the prepared dish

### Step 3: Test Locally

Before submitting:
1. Run the development server (`npm run dev`)
2. Verify your recipe displays correctly
3. Check that all links and images work

## Submitting Your Contribution

Submit a pull request with your new recipe files. We'll review it and provide feedback if needed.

Thank you for sharing your culinary creations with the Tasty Cooking community!