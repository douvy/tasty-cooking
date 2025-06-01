export interface Recipe {
  title: string;
  link: string;
  img: string;
  tags: string[];
  searchTerms?: string;
  ingredients_subsections?: IngredientSubsection[];
}

export interface RecipeDetail {
  slug: string;
  title: string;
  description: string;
  date: string;
  lastUpdated?: string;
  imgSrc: string;
  imgAlt?: string;
  prepTime: string;
  readyTime: string;
  servings: string;
  tags: string[];
  ingredients: string[];
  instructions: string[];
  notes?: string[];
  searchTerms?: string;
  content?: string;
}

export interface IngredientSubsection {
  title: string;
  items: string[];
}

export interface RecipeFrontmatter {
  title: string;
  description: string;
  date: string;
  lastUpdated?: string;
  imgSrc: string;
  imgAlt?: string;
  prepTime: string;
  readyTime: string;
  servings: string;
  tags: string[];
  ingredients: string[];
  ingredients_subsections?: IngredientSubsection[];
  instructions: string[];
  notes?: string[];
  searchTerms?: string;
}

export interface MDXRecipe {
  slug: string;
  frontmatter: RecipeFrontmatter;
  content: string;
  readingTime?: {
    text: string;
    minutes: number;
    time: number;
    words: number;
  };
}

export interface SearchServiceConfig {
  cacheExpiration: number;
  cacheName: string;
  sitemapUrl: string;
  indexUrl: string;
  searchLimit: number;
  debounceTime: number;
}

export interface SearchState {
  recipes: Recipe[];
  recipesLoaded: boolean;
  dataLoadPromise: Promise<Recipe[]> | null;
  eventListeners: Record<string, Function[]>;
  lastSearchQuery: string;
}

export interface PaginationState {
  currentPage: number;
  isLoading: boolean;
  observer: IntersectionObserver | null;
  allRecipes: HTMLElement[];
  visibleRecipes: HTMLElement[];
  filteredRecipes: HTMLElement[] | null;
  sortOrder: 'default' | 'alphabetical';
  defaultOrder?: HTMLElement[];
}

export interface PaginationConfig {
  recipesPerPage: number;
  observerThreshold: number;
  initialDelay: number;
}

export interface TagFilteringState {
  selectedTags: string[];
}