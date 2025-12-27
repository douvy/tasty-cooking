/**
 * Site-wide constants
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tasty.cooking';
export const SITE_NAME = 'Tasty Cooking';
export const SITE_DESCRIPTION = 'A modern recipe collection website optimized for performance, accessibility, and visual appeal with no clutter';
export const DEFAULT_OG_IMAGE = '/assets/img/tasty-cooking.jpg';

// Image loading constants
export const BLUR_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
export const IMAGE_LOAD_THRESHOLD = 0.1; // Start loading when 10% of the image is visible

// Custom recipe order
export const RECIPE_CUSTOM_ORDER = [
  'sesame-green-beans',
  'guacamole',
  'roasted-cauliflower',
  'roasted-broccolini',
  'nashville-hot-chicken',
  'honey-butter-pancakes',
  'charred-brussels-sprouts',
  'cajun-honey-butter-salmon',
  'salsa',
  'japanese-tebasaki-wings',
  'crunchy-pappardelle',
  'chimichurri',
  'roasted-chicken',
  'eggplant-with-buttermilk-sauce',
  'crushed-fried-potatoes',
  'cucumber-salad',
  'sweet-potato-cakes',
  'black-pepper-tofu',
  'leek-fritters',
  'sweet-potato-hash',
  'roasted-beets',
  'potato-green-bean-soup',
  'pistachio-butter',
  'beet-slaw',
  'ratatouille',
  'roasted-garlic-lentil-soup',
  'avocado-wraps',
  'citrus-vinaigrette',
  'spiced-green-sauce',
  'roasted-radishes',
  'kale-salad',
  'green-garlic-butter',
  'alla-diavola-butter',
  'almonds',
  'smoked-barbecue-cashews',
  'brown-butter',
  'pineapple-ginger-smoothie',
  'roasted-sweet-potato-salad',
  'falafels',
  'spicy-kimchi-broccoli-rabe',
  'california-zaatar',
  'soffrito',
  'mojo-de-ajo',
  'romesco',
  'quesadillas',
  'sesame-orange-chicken',
  'white-bean-wraps',
  'garlic-confit',
  'pineapple-kimchi',
  'pomodoro-sauce',
  'spaghetti-pomodoro',
  'grilled-buffalo-wings',
  'tomato-confit'
];