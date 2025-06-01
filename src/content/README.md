# Tasty Cooking Content Directory

This directory contains all the content for the Tasty Cooking website, organized in a file-based approach that makes it easy to add, edit, and manage recipes.

## Directory Structure

```
content/
├── recipes/           # MDX files for individual recipes
│   ├── recipe-1.mdx   
│   ├── recipe-2.mdx
│   └── ...
└── README.md          # This file
```

## Recipe Files (MDX)

Each recipe is stored as a separate MDX file in the `recipes/` directory. The filename should match the recipe's URL slug, for example, `black-pepper-tofu.mdx` will be available at `/black-pepper-tofu`.

### Recipe File Structure

Each recipe file consists of:

1. **Frontmatter**: YAML metadata at the top of the file between `---` markers
2. **Content**: Optional markdown content below the frontmatter

Example:

```md
---
title: Black Pepper Tofu
description: An intensely flavored vegetarian main course with crispy tofu cubes in a glossy black pepper sauce.
date: 2023-04-02
lastUpdated: 2025-05-31
imgSrc: /assets/img/black-pepper-tofu.jpg
imgAlt: Crispy cubes of tofu in black pepper sauce
prepTime: 20 min
readyTime: 25 min
servings: 4 servings
tags:
  - Vegetarian
  - Spicy
  - Quick
ingredients:
  - 900g extra-firm tofu (2 blocks)
  - Cornstarch for coating
  - 8 tablespoons butter
  # ... more ingredients
instructions:
  - Start by draining the tofu. Cut each block into 1-inch cubes.
  - Toss the pressed tofu cubes in cornstarch until lightly coated.
  # ... more instructions
notes:
  - For a less spicy version, reduce the black pepper.
  - You can substitute some of the butter with vegetable oil.
---

## Recipe Background

This Black Pepper Tofu recipe is inspired by Yotam Ottolenghi's famous version...

## Chef's Tips

### Perfect Tofu Texture

The key to this dish is getting the tofu texture right. Here are some tips:
- Extra-firm tofu works best; avoid silken varieties
```

### Required Frontmatter Fields

| Field | Description | Example |
|-------|-------------|---------|
| `title` | Recipe title | `"Black Pepper Tofu"` |
| `description` | Brief description | `"An intensely flavored vegetarian main course..."` |
| `date` | Original publication date | `2023-04-02` |
| `imgSrc` | Path to main image | `/assets/img/black-pepper-tofu.jpg` |
| `prepTime` | Preparation time | `20 min` |
| `readyTime` | Cooking time | `25 min` |
| `servings` | Number of servings | `4 servings` |
| `tags` | Array of recipe tags | `["Vegetarian", "Spicy", "Quick"]` |
| `ingredients` | Array of ingredients | `["900g extra-firm tofu", "Cornstarch for coating"]` |
| `instructions` | Array of instruction steps | `["Start by draining the tofu...", "Toss the pressed tofu cubes..."]` |

### Optional Frontmatter Fields

| Field | Description | Example |
|-------|-------------|---------|
| `lastUpdated` | Date of last update | `2025-05-31` |
| `imgAlt` | Alt text for main image | `"Crispy cubes of tofu in black pepper sauce"` |
| `notes` | Array of recipe notes | `["For a less spicy version...", "You can substitute..."]` |
| `searchTerms` | Additional search keywords | `"tofu stir fry asian ottolenghi"` |

## Content Section

The content section below the frontmatter can include any additional information about the recipe, such as:

- Background information about the dish
- Chef's tips and tricks
- Variations of the recipe
- Serving suggestions
- Storage instructions
- Nutritional information
- Personal stories related to the recipe

This content is rendered as rich, formatted text on the recipe page and supports:

- Headings (## and ###)
- Lists (bulleted and numbered)
- Bold and italic text
- Links
- Code blocks for special formatting

## Adding Images

Place all recipe images in the `/public/assets/img/` directory with a filename matching the recipe slug. For example, `black-pepper-tofu.jpg` for the `black-pepper-tofu.mdx` recipe.

For optimal performance:

- Use JPG format for photographs
- Optimize images for web (aim for 500-800KB max)
- Recommended dimensions: 1200×800 pixels
- Use a 3:2 aspect ratio when possible

## Adding New Recipes

To add a new recipe:

1. Create a new MDX file in the `recipes/` directory
2. Add all required frontmatter fields
3. Add the content section with additional information
4. Place the recipe image in `/public/assets/img/`
5. Build and test the site locally

## Converting Existing Recipes

For converting existing recipe data to MDX format, use the converter utility:

```bash
npx ts-node -r tsconfig-paths/register scripts/convert-recipes.ts
```