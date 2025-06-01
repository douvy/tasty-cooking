# Tasty Cooking Scripts

This directory contains utility scripts for managing and maintaining the Tasty Cooking website.

## Available Scripts

### `convert-recipes.ts`

Converts recipe data to MDX format and saves them to the content directory.

#### Usage

```bash
# Run the script
npx ts-node -r tsconfig-paths/register scripts/convert-recipes.ts
```

This script:
- Takes recipe data (hardcoded or imported from external sources)
- Converts it to MDX format with proper frontmatter
- Saves each recipe as an .mdx file in the src/content/recipes directory

#### Customizing

To add more recipes or import from different sources, modify the `recipes` array in the script.

## Adding New Scripts

When adding new scripts:

1. Create a new TypeScript file in this directory
2. Document its purpose at the top of the file
3. Add it to this README
4. Use absolute imports with the `@/` prefix when importing from the src directory

## Running TypeScript Scripts

All scripts should be run using ts-node with the tsconfig-paths register to ensure proper resolution of imports:

```bash
npx ts-node -r tsconfig-paths/register scripts/your-script.ts
```