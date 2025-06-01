/**
 * Script to convert existing recipe data to MDX files
 * Run with: npx ts-node -r tsconfig-paths/register scripts/convert-recipes.ts
 */

import fs from 'fs';
import path from 'path';
import { RecipeDetail } from '../src/types';
import { saveRecipeAsMDX } from '../src/lib/recipe-converter';

// Example recipe data (this would typically be loaded from a JSON file or API)
const recipes: RecipeDetail[] = [
  {
    slug: 'sesame-green-beans',
    title: 'Sesame Green Beans',
    description: 'Relies on a simple sesame seed dressing that\'s salty, nutty, and slightly sweet. Cook the green beans briefly to maintain their crispness.',
    date: '2023-03-25',
    imgSrc: '/assets/img/sesame-green-beans.jpg',
    imgAlt: 'Vibrant green beans with toasted sesame seeds and a shiny tahini dressing in a white bowl',
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
    notes: [
      'For a spicier version, add 1/2 tsp of chili flakes to the dressing.',
      'You can substitute tamari for soy sauce to make this recipe gluten-free.'
    ],
    content: `
## Chef's Tips

These sesame green beans are perfect as a side dish for grilled salmon or chicken. The combination of the nutty sesame seeds and the creamy tahini creates a rich, satisfying flavor that elevates the simple green beans.

For the best texture, it's crucial not to overcook the green beans. The quick blanching followed by an ice bath ensures they remain crisp and bright green.

You can prepare this dish up to a day ahead and store it in the refrigerator. The flavors actually improve as they meld together overnight.
`
  },
  {
    slug: 'guacamole',
    title: 'Guacamole',
    description: 'Classic Mexican dip made with perfectly ripe avocados, lime, onions, and cilantro. Simple, fresh, and absolutely delicious with chips or as a topping.',
    date: '2023-03-26',
    imgSrc: '/assets/img/guacamole.jpg',
    imgAlt: 'Fresh guacamole with a lime wedge, red onion, and cilantro garnish in a rustic stone bowl with tortilla chips',
    prepTime: '15 min',
    readyTime: '0 min',
    servings: '6 servings',
    tags: ['Condiments', 'Gluten-Free', 'Healthy', 'Quick', 'Vegan', 'Vegetarian'],
    ingredients: [
      '4 ripe Hass avocados, halved and pitted',
      '1 lime, juiced (about 2 tbsp)',
      '1/2 medium red onion, finely diced (about 1/2 cup)',
      '2 Roma tomatoes, seeded and diced',
      '2 tbsp fresh cilantro, chopped',
      '1-2 jalapeños, seeded and finely chopped (optional)',
      '1 clove garlic, minced',
      '1/2 tsp ground cumin',
      'Salt and freshly ground black pepper to taste'
    ],
    instructions: [
      'Scoop the avocado flesh into a medium bowl and mash with a fork, leaving some chunks for texture.',
      'Add lime juice and stir to combine (this prevents browning and adds flavor).',
      'Fold in the red onion, tomatoes, cilantro, jalapeño (if using), and garlic.',
      'Season with cumin, salt, and pepper to taste.',
      'For best flavor, let sit at room temperature for 30 minutes before serving. If making ahead, place plastic wrap directly on the surface of the guacamole to prevent oxidation.'
    ],
    notes: [
      'For a smoother guacamole, use a food processor instead of mashing by hand.',
      'Ripe avocados should yield slightly to gentle pressure and have a dark skin.',
      'To keep guacamole from browning, place an avocado pit in the center while storing.'
    ],
    content: `
## Serving Suggestions

Guacamole is incredibly versatile. Here are some delicious ways to enjoy it:

- **Classic**: Serve with warm tortilla chips
- **Breakfast**: Spread on toast and top with a poached egg
- **Tacos & Burritos**: Use as a topping for any Mexican dish
- **Sandwiches**: Spread on bread instead of mayonnaise
- **Salads**: Use as a creamy dressing base by thinning with more lime juice

## Variations

### Fruit Guacamole
Add 1/2 cup diced mango or pineapple for a sweet twist.

### Extra Spicy
Add an extra jalapeño with seeds or 1/4 tsp cayenne pepper.

### Roasted Garlic
Replace raw garlic with 3-4 cloves of roasted garlic for a mellower flavor.
`
  },
  {
    slug: 'black-pepper-tofu',
    title: 'Black Pepper Tofu',
    description: 'An intensely flavored vegetarian main course with crispy tofu cubes in a glossy, spicy black pepper sauce. Striking the perfect balance between heat, sweetness, and umami flavors.',
    date: '2023-04-02',
    lastUpdated: '2025-05-31',
    imgSrc: '/assets/img/black-pepper-tofu.jpg',
    imgAlt: 'Crispy cubes of tofu coated in a glossy black pepper sauce with green onions and red chilies',
    prepTime: '20 min',
    readyTime: '25 min',
    servings: '4 servings',
    tags: ['Vegetarian', 'Spicy', 'Quick'],
    ingredients: [
      '900g extra-firm tofu (2 blocks)',
      'Cornstarch for coating (about 5-6 tablespoons)',
      '8 tablespoons butter (salted or unsalted)',
      '12 shallots, thinly sliced (about 1 1/2 cups)',
      '12 garlic cloves, crushed',
      '3 tablespoons fresh ginger, finely minced',
      '3 tablespoons freshly ground black pepper',
      '6 red chiles, thinly sliced (adjust to your heat preference)',
      '3 tablespoons soy sauce',
      '1 1/2 tablespoons dark soy sauce',
      '2 tablespoons sugar',
      '5 green onions, sliced into 1-inch segments',
      'Vegetable oil for frying',
      'Steamed rice, for serving'
    ],
    instructions: [
      'Start by draining the tofu. Cut each block into 1-inch cubes and spread them on a paper towel-lined baking sheet. Cover with more paper towels and place something heavy on top (like a cast iron pan) to press out excess moisture. Let sit for at least 30 minutes.',
      'Toss the pressed tofu cubes in cornstarch until lightly coated on all sides.',
      'Heat about 1/4 inch of vegetable oil in a large frying pan over medium-high heat. When oil is hot, fry the tofu in batches, turning occasionally until golden and crispy on all sides, about 5-6 minutes per batch. Transfer to paper towels to drain.',
      'Pour out most of the oil from the pan, leaving about 1 tablespoon. Add the butter and melt over medium heat.',
      'Add shallots, garlic, and ginger to the pan. Sauté until everything is soft and golden, about 15 minutes, stirring occasionally.',
      'Add the black pepper, chiles, soy sauce, dark soy sauce, and sugar. Stir to combine everything into a sauce.',
      'Add the fried tofu back to the pan and stir gently to coat with the sauce. Cook for about 2 more minutes until everything is hot and the sauce has slightly thickened.',
      'Stir in the green onions and cook for 30 seconds more.',
      'Serve hot over steamed rice.'
    ],
    notes: [
      'For a less spicy version, reduce the black pepper to 2 tablespoons and use milder chiles or bell peppers.',
      'You can substitute some of the butter with vegetable oil for a lighter version.',
      'This dish goes well with simple steamed vegetables on the side.',
      'Store leftovers in an airtight container in the refrigerator for up to 3 days.'
    ],
    content: `
## Recipe Background

This Black Pepper Tofu recipe is inspired by Yotam Ottolenghi's famous version but has been simplified slightly for home cooks while maintaining the incredible flavor profile. The combination of butter, black pepper, and soy creates an irresistible savory coating for the crispy tofu.

## Chef's Tips

### Perfect Tofu Texture

The key to this dish is getting the tofu texture right. Here are some tips:
- Extra-firm tofu works best; avoid silken or soft varieties
- Press the tofu thoroughly to remove excess moisture
- Make sure your oil is hot enough before frying
- Don't crowd the pan when frying - work in batches

### Serving Suggestions

This dish is intensely flavored, so it pairs well with:
- Plain jasmine or basmati rice
- Simple steamed vegetables like bok choy or broccoli
- A cooling cucumber salad to balance the heat
`
  }
];

// Convert each recipe to MDX
recipes.forEach(recipe => {
  try {
    saveRecipeAsMDX(recipe);
  } catch (error) {
    console.error(`Error converting recipe ${recipe.slug}:`, error);
  }
});

console.log(`Successfully created ${recipes.length} MDX recipe files.`);