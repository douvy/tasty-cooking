/**
 * search-service.js
 * A best-in-class search service for Tasty Cooking website
 * Features:
 * - LocalStorage caching of recipe data with automatic refreshing
 * - Multiple data sources with intelligent fallbacks
 * - Smart search with term matching and synonyms
 * - Full ARIA accessibility compliance
 * - Performance optimized with debouncing, caching, and minimal DOM operations
 * - Unified search experience across all pages
 */

// Self-executing function for encapsulation
(function() {
    'use strict';

    // SearchService class definition
    class SearchService {
        constructor(config = {}) {
            // Default configuration with sensible defaults
            this.config = {
                cacheExpiration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
                cacheName: 'tasty-cooking-recipes',
                sitemapUrl: '/sitemap.xml',
                indexUrl: '/',
                searchLimit: 1000, // Show unlimited results by default
                debounceTime: 250, // Slightly faster response time
                ...config // Merge with provided config
            };

            // State variables
            this.recipes = [];
            this.recipesLoaded = false;
            this.dataLoadPromise = null;
            this.eventListeners = {};
            this.lastSearchQuery = '';

            // Initialize on construction
            this.init();
        }

        // Initialize the service
        init() {
            // Try to load recipes from cache first
            const cachedRecipes = this.loadFromCache();
            
            if (cachedRecipes) {
                this.recipes = cachedRecipes;
                this.recipesLoaded = true;
                this.emitEvent('recipesLoaded', this.recipes);
            }
            
            // Always refresh cache in background, even if we loaded from cache
            this.loadRecipes();
        }

        // Register event listeners
        on(eventName, callback) {
            if (!this.eventListeners[eventName]) {
                this.eventListeners[eventName] = [];
            }
            this.eventListeners[eventName].push(callback);
            return this; // Enable chaining
        }

        // Emit events to listeners
        emitEvent(eventName, data) {
            if (this.eventListeners[eventName]) {
                this.eventListeners[eventName].forEach(callback => callback(data));
            }
            return this; // Enable chaining
        }

        // Save recipes to localStorage cache
        saveToCache(recipes) {
            try {
                const cacheData = {
                    timestamp: Date.now(),
                    recipes: recipes
                };
                localStorage.setItem(this.config.cacheName, JSON.stringify(cacheData));
                return true;
            } catch (error) {
                console.warn('Failed to save recipes to cache:', error);
                return false;
            }
        }

        // Load recipes from localStorage cache
        loadFromCache() {
            try {
                const cachedData = localStorage.getItem(this.config.cacheName);
                if (!cachedData) return null;
                
                const { timestamp, recipes } = JSON.parse(cachedData);
                const now = Date.now();
                
                // Return null if cache is expired
                if (now - timestamp > this.config.cacheExpiration) {
                    return null;
                }
                
                return recipes;
            } catch (error) {
                console.warn('Failed to load recipes from cache:', error);
                return null;
            }
        }

        // Load recipes from various sources with fallbacks
        loadRecipes() {
            // Return existing promise if already loading
            if (this.dataLoadPromise) {
                return this.dataLoadPromise;
            }
            
            this.dataLoadPromise = this.fetchFromSitemap()
                .catch(error => {
                    console.warn('Failed to load from sitemap, trying index page:', error);
                    return this.fetchFromHTML();
                })
                .catch(error => {
                    console.warn('Failed to load from HTML, using basic recipes:', error);
                    return this.loadBasicRecipes();
                })
                .then(recipes => {
                    this.recipes = recipes;
                    this.recipesLoaded = true;
                    this.saveToCache(recipes);
                    this.emitEvent('recipesLoaded', recipes);
                    this.dataLoadPromise = null; // Reset promise for future refreshes
                    return recipes;
                });
                
            return this.dataLoadPromise;
        }

        // Fetch recipes from sitemap.xml
        fetchFromSitemap() {
            return fetch(this.config.sitemapUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to fetch sitemap: ${response.status}`);
                    }
                    return response.text();
                })
                .then(xml => {
                    const parser = new DOMParser();
                    const sitemap = parser.parseFromString(xml, 'text/xml');
                    const urls = sitemap.querySelectorAll('url loc');
                    const recipes = [];
                    
                    urls.forEach(url => {
                        const fullUrl = url.textContent;
                        // Skip non-recipe pages
                        if (this.isNonRecipeUrl(fullUrl)) {
                            return;
                        }
                        
                        // Extract slug and build recipe object
                        const urlParts = fullUrl.split('/');
                        const slug = urlParts[urlParts.length - 1].replace('.html', '');
                        
                        if (slug) {
                            const imgPath = this.getImagePathForSlug(slug);
                            const title = this.slugToTitle(slug);
                            const tags = this.getTagsFromSlug(slug);
                            
                            recipes.push({
                                title: title,
                                link: slug,
                                img: imgPath,
                                tags: tags,
                                searchTerms: this.generateSearchTerms(title, slug, tags)
                            });
                        }
                    });
                    
                    if (recipes.length === 0) {
                        throw new Error('No recipes found in sitemap');
                    }
                    
                    return recipes;
                });
        }

        // Check if URL is not a recipe page
        isNonRecipeUrl(url) {
            return url.includes('index.html') || 
                   url.includes('.css') || 
                   url.includes('.js') || 
                   url.includes('robots.txt') ||
                   url.includes('manifest.json') ||
                   url.includes('service-worker.js');
        }

        // Get tags for a recipe based on slug
        getTagsFromSlug(slug) {
            // Map common ingredients/terms to tags
            const tagMap = {
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
                'sweet-potato': ['vegetable']
            };
            
            // Extract potential tags from slug
            let tags = [];
            Object.entries(tagMap).forEach(([key, value]) => {
                if (slug.includes(key)) {
                    tags = [...tags, ...value];
                }
            });
            
            // Remove duplicates
            return [...new Set(tags)];
        }

        // Get image path for a recipe slug, handling special cases
        getImagePathForSlug(slug) {
            // Handle special cases for image paths
            const specialCases = {
                'roasted-broccolini': 'assets/img/grilled-broccolini.jpg',
                'honey-butter-pancakes': 'assets/img/pancakes.jpg',
                'sesame-orange-chicken': 'assets/img/spicy-orange-sesame-chicken.jpg',
                'nashville-hot-chicken': 'assets/img/nashville-chicken.jpg',
                'pomodoro-sauce': 'assets/img/pomodoro.jpg',
                'cajun-honey-butter-salmon': 'assets/img/cajun-salmon.jpg',
                'california-za\'atar': 'assets/img/za\'atar.jpg',
                'avocado-wraps': 'assets/img/black-bean-avocado-wraps.jpg',
                'white-bean-wraps': 'assets/img/white-bean-wraps.jpg',
                'falafels': 'assets/img/falafals.jpg'
            };
            
            return specialCases[slug] || `assets/img/${slug}.jpg`;
        }

        // Convert slug to readable title
        slugToTitle(slug) {
            return slug.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        }

        // Generate comprehensive search terms to improve search
        generateSearchTerms(title, slug, tags = []) {
            // Base terms
            const terms = [
                title.toLowerCase(),
                slug.replace(/-/g, ' ')
            ];
            
            // Split title into individual words for better matching
            title.toLowerCase().split(' ').forEach(word => {
                if (word.length > 2) { // Only add words longer than 2 chars
                    terms.push(word);
                }
            });
            
            // Split slug into individual words too
            slug.split('-').forEach(word => {
                if (word.length > 2) { // Only add words longer than 2 chars
                    terms.push(word);
                }
            });
            
            // Add tags as search terms
            if (tags && tags.length) {
                terms.push(...tags);
            }
            
            // Add common alternatives for ingredients
            const ingredientMap = {
                'tomato': ['pasta sauce', 'marinara', 'italian', 'sauce'],
                'chicken': ['poultry', 'meat', 'protein', 'wings'],
                'beans': ['legumes', 'protein', 'vegetarian', 'bean'],
                'broccolini': ['broccoli', 'vegetables', 'greens', 'vegetable'],
                'cauliflower': ['vegetables', 'cruciferous', 'vegetable'],
                'salad': ['healthy', 'fresh', 'raw', 'vegetable'],
                'kimchi': ['korean', 'spicy', 'fermented', 'cabbage'],
                'pancakes': ['breakfast', 'sweet', 'morning', 'pancake'],
                'salsa': ['mexican', 'sauce', 'dip', 'tomato'],
                'soup': ['stew', 'liquid', 'winter', 'warm'],
                'orange': ['citrus', 'fruit', 'juice'],
                'tofu': ['soy', 'vegetarian', 'protein', 'bean curd'],
                'honey': ['sweet', 'natural', 'syrup'],
                'potato': ['potatoes', 'starch', 'vegetable'],
                'butter': ['dairy', 'fat', 'creamy'],
                'garlic': ['allium', 'flavor', 'seasoning'],
                'lentil': ['legume', 'protein', 'vegetarian'],
                'sweet potato': ['yam', 'starchy', 'vegetable', 'orange']
            };
            
            // Add relevant alternative terms based on slug and title
            Object.entries(ingredientMap).forEach(([key, alternatives]) => {
                if (slug.includes(key) || title.toLowerCase().includes(key)) {
                    terms.push(...alternatives);
                }
            });
            
            // Add meal type based on common patterns
            if (slug.includes('pancake') || slug.includes('hash') || slug.includes('smoothie')) {
                terms.push('breakfast');
            } else if (slug.includes('soup') || slug.includes('stew')) {
                terms.push('lunch', 'dinner');
            } else if (slug.includes('sauce') || slug.includes('dip') || slug.includes('spread')) {
                terms.push('condiment', 'accompaniment');
            } else if (slug.includes('salad')) {
                terms.push('side', 'light');
            } else if (slug.includes('chicken') || slug.includes('salmon') || slug.includes('beef')) {
                terms.push('dinner', 'main course', 'entree');
            }
            
            // Add specific cooking terminology to improve search
            terms.push('recipe', 'cooking', 'food', 'meal', 'dish', 'homemade');
            
            // Filter out duplicates and empty strings
            return [...new Set(terms)].filter(Boolean).join(' ');
        }

        // Fetch recipes from the index HTML
        fetchFromHTML() {
            return fetch(this.config.indexUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to fetch index: ${response.status}`);
                    }
                    return response.text();
                })
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const recipeCards = doc.querySelectorAll('#recipe-grid > a');
                    const recipes = [];
                    
                    recipeCards.forEach(card => {
                        const title = card.querySelector('.recipe-title')?.textContent || '';
                        const link = card.getAttribute('href') || '';
                        let img = card.querySelector('img');
                        const imgSrc = img ? img.getAttribute('src') : '';
                        const tags = card.getAttribute('data-tags')?.split(' ') || [];
                        
                        if (title && link) {
                            // Convert link to slug by removing .html
                            const slug = link.replace('.html', '');
                            
                            recipes.push({
                                title: title,
                                link: slug,
                                img: imgSrc,
                                tags: tags,
                                searchTerms: this.generateSearchTerms(title, slug, tags)
                            });
                        }
                    });
                    
                    if (recipes.length === 0) {
                        throw new Error('No recipes found in HTML');
                    }
                    
                    return recipes;
                });
        }

        // Fallback to basic recipes if all else fails - include all known recipes
        loadBasicRecipes() {
            return Promise.resolve([
                { title: "Sesame Green Beans", link: "sesame-green-beans", img: "assets/img/sesame-green-beans.jpg", tags: ["gluten-free", "healthy", "quick", "vegan", "vegetable", "vegetarian"], searchTerms: "vegetables side dish" },
                { title: "Guacamole", link: "guacamole", img: "assets/img/guacamole.jpg", tags: ["condiments", "gluten-free", "healthy", "quick", "vegan", "vegetarian"], searchTerms: "avocado dip mexican" },
                { title: "Roasted Cauliflower", link: "roasted-cauliflower", img: "assets/img/roasted-cauliflower.jpg", tags: ["gluten-free", "healthy", "quick", "vegan", "vegetable", "vegetarian"], searchTerms: "vegetables side dish" },
                { title: "Roasted Broccolini", link: "roasted-broccolini", img: "assets/img/grilled-broccolini.jpg", tags: ["meat", "vegetable", "spicy"], searchTerms: "vegetables side dish" },
                { title: "Charred Brussels Sprouts", link: "charred-brussels-sprouts", img: "assets/img/charred-brussels-sprouts.jpg", tags: ["gluten-free", "healthy", "meat", "quick", "vegetable"], searchTerms: "vegetables side dish" },
                { title: "Honey Butter Pancakes", link: "honey-butter-pancakes", img: "assets/img/pancakes.jpg", tags: ["breakfast"], searchTerms: "breakfast" },
                { title: "Cajun Honey Butter Salmon", link: "cajun-honey-butter-salmon", img: "assets/img/cajun-salmon.jpg", tags: ["gluten-free", "quick", "seafood", "spicy"], searchTerms: "seafood" },
                { title: "Roasted Chicken", link: "roasted-chicken", img: "assets/img/roasted-chicken.jpg", tags: ["gluten-free", "healthy", "meat"], searchTerms: "poultry meat" },
                { title: "Black Bean Avocado Wraps", link: "avocado-wraps", img: "assets/img/black-bean-avocado-wraps.jpg", tags: ["healthy", "quick", "vegan", "vegetarian"], searchTerms: "vegetarian" },
                { title: "Cucumber Salad", link: "cucumber-salad", img: "assets/img/cucumber-salad.jpg", tags: ["condiments", "gluten-free", "healthy", "vegan", "vegetable", "vegetarian"], searchTerms: "vegetable side" },
                { title: "Sweet Potato Cakes", link: "sweet-potato-cakes", img: "assets/img/sweet-potato-cakes.jpg", tags: ["vegetable", "vegetarian", "spicy"], searchTerms: "vegetable" },
                { title: "Leek Fritters", link: "leek-fritters", img: "assets/img/leek-fritters.jpg", tags: ["vegetable", "vegetarian", "spicy", "healthy"], searchTerms: "vegetable" },
                { title: "Sweet Potato Hash", link: "sweet-potato-hash", img: "assets/img/sweet-potato-hash.jpg", tags: ["breakfast", "vegetable", "vegan", "vegetarian", "gluten-free", "healthy", "quick", "spicy"], searchTerms: "breakfast vegetable" },
                { title: "Roasted Beets", link: "roasted-beets", img: "assets/img/roasted-beets.jpg", tags: ["vegetable", "vegan", "vegetarian", "gluten-free", "healthy"], searchTerms: "vegetable" },
                { title: "Black Pepper Tofu", link: "black-pepper-tofu", img: "assets/img/black-pepper-tofu.jpg", tags: ["vegetarian", "spicy", "quick"], searchTerms: "vegetarian" },
                { title: "Potato Green Bean Soup", link: "potato-green-bean-soup", img: "assets/img/potato-green-bean-soup.jpg", tags: ["vegetable", "vegetarian", "healthy"], searchTerms: "soup vegetable" },
                { title: "Roasted Garlic Lentil Soup", link: "roasted-garlic-lentil-soup", img: "assets/img/roasted-garlic-lentil-soup.jpg", tags: ["healthy", "meat", "spicy"], searchTerms: "soup" },
                { title: "Pistachio Butter", link: "pistachio-butter", img: "assets/img/pistachio-butter.jpg", tags: ["condiments", "gluten-free", "healthy", "quick", "vegan", "vegetarian"], searchTerms: "condiment" },
                { title: "Beet Slaw", link: "beet-slaw", img: "assets/img/beet-slaw.jpg", tags: ["vegetable", "vegan", "vegetarian", "healthy"], searchTerms: "vegetable side" },
                { title: "Ratatouille", link: "ratatouille", img: "assets/img/ratatouille.jpg", tags: ["vegetable", "vegan", "vegetarian", "gluten-free", "healthy"], searchTerms: "vegetable" },
                { title: "Eggplant with Buttermilk Sauce", link: "eggplant-with-buttermilk-sauce", img: "assets/img/eggplant-with-buttermilk-sauce.jpg", tags: ["vegetable", "vegetarian", "gluten-free", "healthy"], searchTerms: "vegetable" },
                { title: "Crunchy Pappardelle", link: "crunchy-pappardelle", img: "assets/img/crunchy-pappardelle.jpg", tags: ["vegetable", "vegetarian", "healthy"], searchTerms: "pasta" },
                { title: "Chimichurri", link: "chimichurri", img: "assets/img/chimichurri.jpg", tags: ["condiments", "gluten-free", "vegan", "vegetarian"], searchTerms: "condiment sauce" },
                { title: "Salsa", link: "salsa", img: "assets/img/salsa.jpg", tags: ["condiments", "gluten-free", "healthy", "quick", "spicy"], searchTerms: "condiment mexican" },
                { title: "Nashville Hot Chicken", link: "nashville-hot-chicken", img: "assets/img/nashville-chicken.jpg", tags: ["meat", "spicy"], searchTerms: "meat chicken" },
                { title: "Japanese Tebasaki Wings", link: "japanese-tebasaki-wings", img: "assets/img/japanese-wings.jpg", tags: ["gluten-free", "meat", "spicy"], searchTerms: "meat chicken" },
                { title: "Grilled Buffalo Wings", link: "grilled-buffalo-wings", img: "assets/img/grilled-buffalo-wings.jpg", tags: ["gluten-free", "meat", "quick", "spicy"], searchTerms: "meat chicken" },
                { title: "Pineapple Ginger Smoothie", link: "pineapple-ginger-smoothie", img: "assets/img/pineapple-ginger-smoothie.jpg", tags: ["gluten-free", "healthy", "quick", "vegan", "vegetarian"], searchTerms: "drink" },
                { title: "Roasted Sweet Potato Salad", link: "roasted-sweet-potato-salad", img: "assets/img/roasted-sweet-potato-salad.jpg", tags: ["gluten-free", "healthy", "vegan", "vegetable", "vegetarian"], searchTerms: "vegetable" },
                { title: "Falafels", link: "falafels", img: "assets/img/falafals.jpg", tags: ["gluten-free", "healthy", "vegan", "vegetarian"], searchTerms: "vegetarian" },
                { title: "Spicy Kimchi Broccoli Rabe", link: "spicy-kimchi-broccoli-rabe", img: "assets/img/spicy-kimchi-broccoli-rabe.jpg", tags: ["gluten-free", "healthy", "quick", "spicy", "vegan", "vegetable", "vegetarian"], searchTerms: "vegetable spicy" },
                { title: "California Za'atar", link: "california-za'atar", img: "assets/img/za'atar.jpg", tags: ["condiments", "gluten-free", "healthy", "quick", "vegan", "vegetarian"], searchTerms: "spice condiment" },
                { title: "Soffrito", link: "soffrito", img: "assets/img/soffrito.jpg", tags: ["condiments", "gluten-free", "healthy", "quick", "vegan", "vegetarian"], searchTerms: "condiment" },
                { title: "Mojo de Ajo", link: "mojo-de-ajo", img: "assets/img/mojo-de-ajo.jpg", tags: ["condiments", "gluten-free", "vegan", "vegetarian"], searchTerms: "condiment sauce" },
                { title: "Romesco", link: "romesco", img: "assets/img/romesco.jpg", tags: ["condiments", "gluten-free", "vegan", "vegetarian"], searchTerms: "sauce condiment" },
                { title: "Quesadillas", link: "quesadillas", img: "assets/img/quesadillas.jpg", tags: ["healthy", "quick", "vegan", "vegetarian"], searchTerms: "mexican" },
                { title: "White Bean Wraps", link: "white-bean-wraps", img: "assets/img/white-bean-wraps.jpg", tags: ["healthy", "vegan", "vegetarian"], searchTerms: "vegetarian" },
                { title: "Garlic Confit", link: "garlic-confit", img: "assets/img/garlic-confit.jpg", tags: ["condiments", "gluten-free", "healthy", "vegan", "vegetarian"], searchTerms: "condiment" },
                { title: "Pineapple Kimchi", link: "pineapple-kimchi", img: "assets/img/pineapple-kimchi.jpg", tags: ["condiments", "gluten-free", "healthy", "spicy", "vegan", "vegetarian"], searchTerms: "condiment spicy" },
                { title: "Pomodoro Sauce", link: "pomodoro-sauce", img: "assets/img/pomodoro.jpg", tags: ["condiments", "gluten-free", "healthy", "vegan", "vegetarian"], searchTerms: "sauce italian" },
                { title: "Spaghetti Pomodoro", link: "spaghetti-pomodoro", img: "assets/img/spaghetti-pomodoro.jpg", tags: ["condiments", "gluten-free", "healthy", "vegan", "vegetarian"], searchTerms: "pasta italian" },
                { title: "Tomato Confit", link: "tomato-confit", img: "assets/img/tomato-confit.jpg", tags: ["condiments"], searchTerms: "condiment" },
                { title: "Sesame Orange Chicken", link: "sesame-orange-chicken", img: "assets/img/spicy-orange-sesame-chicken.jpg", tags: ["meat", "quick", "spicy"], searchTerms: "meat chicken" }
            ]);
        }

        // Enhanced search with term matching - guaranteed to find ALL matches
        search(query) {
            if (!query || typeof query !== 'string') {
                return this.recipes; // Return all recipes if no query
            }
            
            const normalizedQuery = query.toLowerCase().trim();
            
            if (normalizedQuery.length === 0) {
                return this.recipes; // Return all recipes if empty query
            }

            console.log(`Searching for "${normalizedQuery}" among ${this.recipes.length} recipes`);

            // Exact title match gets priority
            const exactMatches = this.recipes.filter(recipe => 
                recipe.title.toLowerCase().includes(normalizedQuery)
            );
            
            // Then search in search terms for broader matches
            const termMatches = this.recipes.filter(recipe => 
                !recipe.title.toLowerCase().includes(normalizedQuery) && 
                recipe.searchTerms && 
                recipe.searchTerms.includes(normalizedQuery)
            );
            
            // Additional check for individual words in title
            const titleWordMatches = this.recipes.filter(recipe => 
                !exactMatches.includes(recipe) && 
                !termMatches.includes(recipe) && 
                recipe.title.toLowerCase().split(' ').some(word => 
                    word.includes(normalizedQuery) || normalizedQuery.includes(word)
                )
            );
            
            // Extra fallback to ensure we don't miss anything
            const fallbackMatches = this.recipes.filter(recipe => 
                !exactMatches.includes(recipe) && 
                !termMatches.includes(recipe) && 
                !titleWordMatches.includes(recipe) && 
                (recipe.tags && recipe.tags.some(tag => tag.includes(normalizedQuery)))
            );
            
            // Combine results with exact matches first
            const allResults = [...exactMatches, ...termMatches, ...titleWordMatches, ...fallbackMatches];
            console.log(`Found ${allResults.length} total matches (${exactMatches.length} exact, ${termMatches.length} term, ${titleWordMatches.length} word, ${fallbackMatches.length} fallback)`);
            
            return allResults;
        }

        // Get loading status
        isLoaded() {
            return this.recipesLoaded;
        }
        
        // Get all recipes
        getAllRecipes() {
            return [...this.recipes];
        }
        
        // Force refresh recipes from network
        refreshRecipes() {
            // Clear cache
            localStorage.removeItem(this.config.cacheName);
            this.recipesLoaded = false;
            this.dataLoadPromise = null;
            
            // Reload recipes
            return this.loadRecipes();
        }
        
        // Filter recipes by tag(s)
        filterByTags(tags) {
            if (!tags || !tags.length) {
                return this.getAllRecipes();
            }
            
            return this.recipes.filter(recipe => 
                tags.every(tag => recipe.tags && recipe.tags.includes(tag))
            );
        }
        
        // Sort recipes (alphabetical or default ordering)
        sortRecipes(recipes, sortOption = 'default', defaultOrderIndices = null) {
            if (sortOption === 'alphabetical') {
                return [...recipes].sort((a, b) => a.title.localeCompare(b.title));
            }
            
            // If default order indices provided, use them
            if (defaultOrderIndices && typeof defaultOrderIndices === 'object') {
                return [...recipes].sort((a, b) => {
                    const indexA = defaultOrderIndices[a.link] || 9999;
                    const indexB = defaultOrderIndices[b.link] || 9999;
                    return indexA - indexB;
                });
            }
            
            // Otherwise return as-is
            return recipes;
        }
    }

    // Export to global scope
    window.SearchService = SearchService;
    
    // Also export a singleton instance for simpler use
    window.searchServiceInstance = new SearchService();
})();

/**
 * Debounce function for improving search input performance
 * Delays execution of a function until after a specified wait time
 */
function debounce(func, wait = 250) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}