/**
 * search-service.js
 * A best-in-class unified search implementation for Tasty Cooking website
 * Features:
 * - LocalStorage caching of recipe data with automatic refreshing
 * - Multiple data sources with intelligent fallbacks
 * - Smart search with term matching and synonyms
 * - Full ARIA accessibility and keyboard navigation
 * - Performance optimized with debouncing, caching, and minimal DOM operations
 * - Unified search experience across all pages
 */

// Self-executing function for encapsulation
(function() {
    'use strict';

    // SearchService class definition - data layer
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
            
            if (cachedRecipes && cachedRecipes.length >= 40) {
                // Only use cache if it has most/all recipes
                this.recipes = cachedRecipes;
                this.recipesLoaded = true;
                this.emitEvent('recipesLoaded', this.recipes);
            }
            
            // Always refresh cache in background, even if we loaded from cache
            this.loadRecipes().then(recipes => {
                // Verify we got the expected number of recipes
                if (recipes.length < 40) {
                    console.warn(`Only loaded ${recipes.length} recipes, expected at least 40. Attempting to add fallback recipes.`);
                    // Load basic recipes as fallback and merge with any we did find
                    this.loadBasicRecipes().then(basicRecipes => {
                        // Create a map of existing recipes by link
                        const recipeMap = new Map();
                        this.recipes.forEach(recipe => {
                            recipeMap.set(recipe.link, recipe);
                        });
                        
                        // Add any missing recipes from the basic set
                        basicRecipes.forEach(recipe => {
                            if (!recipeMap.has(recipe.link)) {
                                this.recipes.push(recipe);
                            }
                        });
                        
                        // Update cache with combined set
                        this.saveToCache(this.recipes);
                        this.emitEvent('recipesLoaded', this.recipes);
                    });
                }
            });
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
            
            this.dataLoadPromise = Promise.all([
                // Try both sitemap and HTML methods simultaneously
                this.fetchFromHTML().catch(e => []), // Ignore errors
                this.fetchFromSitemap().catch(e => [])  // Ignore errors
            ])
            .then(([htmlRecipes, sitemapRecipes]) => {
                // Process results from both sources
                
                // Merge results, preferring HTML recipes when duplicates exist
                let allRecipes = [...htmlRecipes];
                
                // Create a map of links we already have
                const existingLinks = new Map();
                allRecipes.forEach(recipe => {
                    existingLinks.set(recipe.link, true);
                });
                
                // Add unique recipes from sitemap
                sitemapRecipes.forEach(recipe => {
                    if (!existingLinks.has(recipe.link)) {
                        allRecipes.push(recipe);
                        existingLinks.set(recipe.link, true);
                    }
                });
                
                // If we still don't have enough recipes, add the fallback basic recipes
                if (allRecipes.length < 40) {
                    // Need to add fallback recipes
                    return this.loadBasicRecipes().then(basicRecipes => {
                        basicRecipes.forEach(recipe => {
                            if (!existingLinks.has(recipe.link)) {
                                allRecipes.push(recipe);
                                existingLinks.set(recipe.link, true);
                            }
                        });
                        return allRecipes;
                    });
                }
                
                return allRecipes;
            })
            .then(recipes => {
                // Store recipes in state
                this.recipes = recipes;
                this.recipesLoaded = true;
                this.saveToCache(recipes);
                this.emitEvent('recipesLoaded', recipes);
                this.dataLoadPromise = null; // Reset promise for future refreshes
                return recipes;
            })
            .catch(error => {
                // Final fallback when all methods fail
                // Final fallback to basic recipes
                return this.loadBasicRecipes().then(recipes => {
                    this.recipes = recipes;
                    this.recipesLoaded = true;
                    this.saveToCache(recipes);
                    this.emitEvent('recipesLoaded', recipes);
                    this.dataLoadPromise = null;
                    return recipes;
                });
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
                    
                    // Process sitemap URLs
                    
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
                    
                    // If we didn't get enough recipes, this will be caught by the Promise.all 
                    // in loadRecipes() which runs both methods in parallel
                    
                    if (recipes.length === 0) {
                        throw new Error('No recipes found in sitemap');
                    }
                    
                    return recipes;
                });
        }

        // Check if URL is not a recipe page
        isNonRecipeUrl(url) {
            // Define known non-recipe pages and file types to exclude
            const nonRecipePatterns = [
                'index.html',
                '.css',
                '.js',
                'robots.txt',
                'manifest.json',
                'service-worker',
                'sitemap.xml',
                'CLAUDE.md',
                'LICENSE',
                'README.md'
            ];
            
            // Check if the URL contains any of the non-recipe patterns
            for (const pattern of nonRecipePatterns) {
                if (url.includes(pattern)) {
                    return true;
                }
            }
            
            // Additional check: if URL ends with '/' it's a directory, not a recipe
            if (url.endsWith('/')) {
                return true;
            }
            
            return false;
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
                'sweet-potato': ['vegetable'],
                'green-sauce': ['condiments', 'spicy', 'vegetable'],
                'radishes': ['vegetable', 'gluten-free', 'healthy'],
                'brown-butter': ['breakfast', 'condiments', 'quick'],
                'alla-diavola-butter': ['condiments', 'gluten-free', 'quick', 'spicy', 'vegetarian'],
                'almonds': ['gluten-free', 'healthy', 'vegan', 'vegetarian']
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
                'falafels': 'assets/img/falafals.jpg',
                'citrus-vinaigrette': 'assets/img/citrus-vinaigrette.jpg',
                'spiced-green-sauce': 'assets/img/spiced-green-sauce.jpg',
                'roasted-radishes': 'assets/img/roasted-radishes.jpg',
                'brown-butter': 'assets/img/brown-butter.jpg',
                'alla-diavola-butter': 'assets/img/alla-diavola-butter.jpg',
                'green-garlic-butter': 'assets/img/green-garlic-butter.jpg',
                'almonds': 'assets/img/almonds.jpg'
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
                'lemon': ['citrus', 'fruit', 'juice', 'sour'],
                'lime': ['citrus', 'fruit', 'juice', 'sour'],
                'vinaigrette': ['dressing', 'salad', 'sauce', 'condiment'],
                'spiced': ['seasoned', 'flavored', 'aromatic', 'spicy'],
                'green sauce': ['herb sauce', 'fresh sauce', 'chimichurri', 'skhug', 'condiment'],
                'radish': ['radishes', 'root vegetable', 'vegetable', 'garden', 'peppery'],
                'roasted radishes': ['side dish', 'roasted vegetable', 'sweet', 'tender'],
                'cilantro': ['coriander', 'herb', 'fresh', 'green'],
                'parsley': ['herb', 'fresh', 'green'],
                'chile': ['chili', 'pepper', 'spicy', 'hot'],
                'cardamom': ['spice', 'aromatic', 'middle eastern'],
                'coriander': ['spice', 'cilantro seed', 'aromatic'],
                'cumin': ['spice', 'aromatic', 'earthy'],
                'tofu': ['soy', 'vegetarian', 'protein', 'bean curd'],
                'honey': ['sweet', 'natural', 'syrup'],
                'potato': ['potatoes', 'starch', 'vegetable'],
                'butter': ['dairy', 'fat', 'creamy'],
                'brown butter': ['beurre noisette', 'nutty', 'toasted', 'sauce', 'fat', 'cooking fat', 'condiment'],
                'alla diavola butter': ['compound butter', 'spicy', 'devil-style', 'italian', 'paprika', 'chile', 'pepperoncini', 'condiment'],
                'green garlic butter': ['compound butter', 'spring garlic', 'immature garlic', 'herb butter', 'cooking fat', 'condiment', 'flavored butter'],
                'garlic': ['allium', 'flavor', 'seasoning'],
                'lentil': ['legume', 'protein', 'vegetarian'],
                'sweet potato': ['yam', 'starchy', 'vegetable', 'orange'],
                'almonds': ['nuts', 'snack', 'brined', 'roasted', 'protein', 'healthy', 'crunchy', 'salty', 'kosher salt', 'rome', 'american academy']
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
                { title: "Brined and Roasted Almonds", link: "almonds", img: "assets/img/almonds.jpg", tags: ["gluten-free", "healthy", "vegan", "vegetarian"], searchTerms: "snack nuts roasted salted brined american academy rome" },
                { title: "Green Garlic Butter", link: "green-garlic-butter", img: "assets/img/green-garlic-butter.jpg", tags: ["condiments", "gluten-free", "vegetarian"], searchTerms: "compound butter spring garlic immature garlic herb butter cooking fat" },
                { title: "Alla Diavola Butter", link: "alla-diavola-butter", img: "assets/img/alla-diavola-butter.jpg", tags: ["condiments", "gluten-free", "quick", "spicy", "vegetarian"], searchTerms: "italian spicy devil-style compound butter paprika chile flakes pepperoncini hot sauce tabasco" },
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
                { title: "Citrus Vinaigrette", link: "citrus-vinaigrette", img: "assets/img/citrus-vinaigrette.jpg", tags: ["condiments", "gluten-free", "healthy", "quick", "seafood", "vegetable", "vegetarian"], searchTerms: "condiment sauce dressing salad orange lemon lime" },
                { title: "Spiced Green Sauce", link: "spiced-green-sauce", img: "assets/img/spiced-green-sauce.jpg", tags: ["condiments", "gluten-free", "healthy", "meat", "spicy", "vegan", "vegetable", "vegetarian"], searchTerms: "condiment sauce middle eastern skhug green chile cilantro parsley spices" },
                { title: "Roasted Radishes", link: "roasted-radishes", img: "assets/img/roasted-radishes.jpg", tags: ["gluten-free", "healthy", "vegetable", "vegetarian"], searchTerms: "side dish roasted vegetable radish brown butter chile honey vinegar sweet spicy" },
                { title: "Brown Butter", link: "brown-butter", img: "assets/img/brown-butter.jpg", tags: ["breakfast", "condiments", "gluten-free", "quick", "vegetarian"], searchTerms: "condiment sauce butter nutty noisette beurre noisette pancakes fish crepe cooking fat" },
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
            return [...exactMatches, ...termMatches, ...titleWordMatches, ...fallbackMatches];
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

    // SearchUI class definition - presentation layer
    class SearchUI {
        constructor(options = {}) {
            this.options = {
                searchBarSelector: '#search-bar',
                searchResultsSelector: '#search-results',
                searchButtonSelector: '#mobile-search-button',
                searchContainerSelector: '#search',
                debounceTime: 250,
                maxResults: 1000, // Show all results, no practical limit
                ...options
            };
            
            // DOM elements
            this.searchBar = document.querySelector(this.options.searchBarSelector);
            this.searchResults = document.querySelector(this.options.searchResultsSelector);
            this.searchContainer = document.querySelector(this.options.searchContainerSelector);
            this.isMobile = window.innerWidth < 768;
            
            // Check if we have the required elements
            if (!this.searchBar || !this.searchResults) {
                return; // Don't initialize if elements not found
            }
            
            // State
            this.searchResultItems = [];
            this.currentIndex = -1;
            this.searchService = window.searchServiceInstance;
            this.searchModalOpen = false;
            
            // Initialize
            this.initialize();
        }
        
        // Initialize the search UI
        initialize() {
            // Set up debounced search
            this.debouncedSearch = debounce(this.performSearch.bind(this), this.options.debounceTime);
            
            // Create the mobile search modal container if on mobile
            if (this.isMobile) {
                this.setupMobileSearch();
            }
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Handle focus if search bar is focused on load
            if (document.activeElement === this.searchBar) {
                this.performSearch();
            }
            
            // Handle window resize to toggle between mobile and desktop
            // Debounce to improve performance
            window.addEventListener('resize', debounce(() => {
                const wasMobile = this.isMobile;
                this.isMobile = window.innerWidth < 768;
                
                // If transitioning between mobile and desktop, reset the UI
                if (wasMobile !== this.isMobile) {
                    this.closeSearchDropdown();
                    if (this.searchModalOpen) {
                        this.closeSearchModal();
                    }
                    
                    if (this.isMobile && !document.querySelector('#mobile-search-button')) {
                        this.setupMobileSearch();
                    } else if (!this.isMobile) {
                        // Transitioning to desktop, restore original search content
                        if (this.originalSearchContent && this.searchContainer) {
                            this.searchContainer.innerHTML = this.originalSearchContent;
                            this.searchContainer.className = 'flex-1 md:flex-none md:ml-auto md:mr-4';
                            
                            // Re-assign DOM elements
                            this.searchBar = document.querySelector(this.options.searchBarSelector);
                            this.searchResults = document.querySelector(this.options.searchResultsSelector);
                            
                            // Re-initialize event listeners for desktop
                            this.setupEventListeners();
                        }
                    }
                }
            }, 150));
        }
        
        // Set up mobile search UI
        setupMobileSearch() {
            // Create the mobile search button
            const searchButton = document.createElement('button');
            searchButton.id = 'mobile-search-button';
            searchButton.className = 'w-[45px] h-[45px] bg-[#2e3523] rounded-full flex items-center justify-center md:hidden';
            searchButton.setAttribute('aria-label', 'Search recipes');
            searchButton.innerHTML = '<i class="far fa-search text-[#f2ede4] fa-sm"></i>';
            
            // Replace the search container content with the button on mobile
            if (this.searchContainer) {
                // Store the original search container content
                this.originalSearchContent = this.searchContainer.innerHTML;
                
                // Replace with the button
                this.searchContainer.innerHTML = '';
                this.searchContainer.appendChild(searchButton);
                this.searchContainer.className = 'flex-none ml-auto';
                
                // Update the mobile logo section to include the text
                const mobileLogoSection = document.querySelector('.flex.items-center.md\\:hidden');
                if (mobileLogoSection) {
                    const logoLink = mobileLogoSection.querySelector('a');
                    if (logoLink && !logoLink.querySelector('span')) {
                        // Add the text if it doesn't exist
                        const logoText = document.createElement('span');
                        logoText.className = 'font-windsor-bold text-2xl text-off-white h-7 ml-2';
                        logoText.textContent = 'tasty cooking';
                        logoLink.appendChild(logoText);
                    }
                }
                
                // Create the search modal
                this.createSearchModal();
                
                // Add event listener to the button
                searchButton.addEventListener('click', () => {
                    this.openSearchModal();
                });
            }
        }
        
        // Create the search modal for mobile
        createSearchModal() {
            // Create the modal container if it doesn't exist
            if (!document.getElementById('search-modal')) {
                const modal = document.createElement('div');
                modal.id = 'search-modal';
                modal.className = 'fixed inset-0 bg-[#3f4427] z-50 flex flex-col transform translate-y-full transition-transform duration-300 ease-in-out';
                modal.style.height = '100%';
                
                // Create the modal header
                const modalHeader = document.createElement('div');
                modalHeader.className = 'bg-[#3f4427] border-b border-[#2f3525] p-4 flex items-center';
                
                // Back button
                const backButton = document.createElement('button');
                backButton.className = 'text-off-white mr-4';
                backButton.innerHTML = '<i class="far fa-long-arrow-left text-xl"></i>';
                backButton.setAttribute('aria-label', 'Close search');
                
                // Search input container with icon
                const searchInputContainer = document.createElement('div');
                searchInputContainer.className = 'flex-1 relative';
                
                // Search icon
                const searchIcon = document.createElement('span');
                searchIcon.className = 'absolute inset-y-0 left-0 flex items-center pl-3';
                searchIcon.innerHTML = '<i class="far fa-search text-[#f2ede4] fa-sm"></i>';
                
                // Search input
                const searchInput = document.createElement('input');
                searchInput.id = 'modal-search-input';
                searchInput.type = 'text';
                searchInput.placeholder = 'Search recipes';
                searchInput.className = 'w-full bg-[#2e3523] cursor-pointer hover:bg-[#323927] text-off-white placeholder:text-[#8B9168] rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-0 focus:border-none';
                searchInput.autocomplete = 'off';
                
                // Assemble search input container
                searchInputContainer.appendChild(searchIcon);
                searchInputContainer.appendChild(searchInput);
                
                modalHeader.appendChild(backButton);
                modalHeader.appendChild(searchInputContainer);
                
                // Create the modal body for search results
                const modalBody = document.createElement('div');
                modalBody.id = 'modal-search-results';
                modalBody.className = 'flex-1 overflow-y-auto bg-[#2A2F1E]';
                
                // Assemble the modal
                modal.appendChild(modalHeader);
                modal.appendChild(modalBody);
                document.body.appendChild(modal);
                
                // Event listeners
                backButton.addEventListener('click', () => {
                    this.closeSearchModal();
                });
                
                searchInput.addEventListener('input', debounce(() => {
                    this.performModalSearch(searchInput.value);
                }, this.options.debounceTime));
                
                // Make sure the modal search results are accessible by keyboard
                searchInput.addEventListener('keydown', (event) => {
                    if (event.key === 'Escape') {
                        this.closeSearchModal();
                    }
                });
            }
        }
        
        // Open the search modal
        openSearchModal() {
            const modal = document.getElementById('search-modal');
            const modalInput = document.getElementById('modal-search-input');
            
            if (modal) {
                document.body.style.overflow = 'hidden'; // Prevent body scrolling
                modal.style.transform = 'translateY(0)';
                this.searchModalOpen = true;
                
                // Show all results by default
                setTimeout(() => {
                    // If the search bar has a value, copy it to the modal input
                    if (this.searchBar.value && modalInput) {
                        modalInput.value = this.searchBar.value;
                        this.performModalSearch(modalInput.value);
                    } else {
                        // Display all recipes
                        this.performModalSearch('');
                    }
                }, 300);
            }
        }
        
        // Close the search modal
        closeSearchModal() {
            const modal = document.getElementById('search-modal');
            
            if (modal) {
                modal.style.transform = 'translateY(100%)';
                document.body.style.overflow = ''; // Restore body scrolling
                this.searchModalOpen = false;
                
                // If we're already in desktop view, restore the desktop search
                if (!this.isMobile && this.originalSearchContent && this.searchContainer) {
                    this.searchContainer.innerHTML = this.originalSearchContent;
                    this.searchContainer.className = 'flex-1 md:flex-none md:ml-auto md:mr-4';
                    
                    // Re-assign DOM elements
                    this.searchBar = document.querySelector(this.options.searchBarSelector);
                    this.searchResults = document.querySelector(this.options.searchResultsSelector);
                    
                    // Re-initialize event listeners for desktop
                    this.setupEventListeners();
                }
            }
        }
        
        // Perform search in the modal
        performModalSearch(query) {
            const resultsContainer = document.getElementById('modal-search-results');
            
            if (!resultsContainer) return;
            
            // Clear the results container
            resultsContainer.innerHTML = '';
            
            if (!this.searchService) {
                this.searchService = window.searchServiceInstance;
                if (!this.searchService) {
                    resultsContainer.innerHTML = '<div class="px-4 py-3 text-off-white text-center">Search service unavailable</div>';
                    return;
                }
            }
            
            // If search service isn't loaded yet, start loading and show loading state
            if (!this.searchService.isLoaded()) {
                resultsContainer.innerHTML = '<div class="px-4 py-3 text-off-white text-center">Loading recipes...</div>';
                
                // Load recipes then search when ready
                this.searchService.loadRecipes().then(() => {
                    this.performModalSearch(query);
                });
                return;
            }
            
            // Perform search
            let results = query 
                ? this.searchService.search(query.toLowerCase().trim()) 
                : this.searchService.getAllRecipes();
            
            // Render results
            if (results.length > 0) {
                // Loop through results and create UI
                results.forEach(recipe => {
                    const item = document.createElement('div');
                    item.className = 'px-4 py-2.5 cursor-pointer flex items-center space-x-3 border-b border-[#2f3525] hover:bg-[#232717]';
                    
                    const image = document.createElement('img');
                    image.src = recipe.img;
                    image.alt = '';
                    image.className = 'w-10 h-10 rounded-3xl object-cover';
                    
                    const title = document.createElement('span');
                    title.className = 'text-off-white text-base';
                    title.textContent = recipe.title;
                    
                    item.appendChild(image);
                    item.appendChild(title);
                    
                    item.addEventListener('click', () => {
                        window.location.href = recipe.link;
                    });
                    
                    resultsContainer.appendChild(item);
                });
            } else {
                // Show enhanced no results message for mobile
                const noResultsContainer = document.createElement('div');
                noResultsContainer.className = 'px-4 py-8 flex flex-col items-center justify-center space-y-4';
                
                // Message text
                const noResultsMessage = document.createElement('p');
                noResultsMessage.className = 'text-off-white text-xl font-medium';
                noResultsMessage.textContent = 'No recipes found';
                
                // Clear button
                const clearButton = document.createElement('button');
                clearButton.className = 'px-4 py-2 bg-button hover:bg-button/90 text-white transition-colors duration-200 rounded-3xl text-base font-medium';
                clearButton.textContent = 'Clear search';
                clearButton.addEventListener('click', () => {
                    // Clear the search input in the modal
                    const modalInput = document.getElementById('modal-search-input');
                    if (modalInput) {
                        // First clear the input
                        modalInput.value = '';
                        
                        // Use the same method that's called initially for empty search
                        this.performModalSearch('');
                        
                        // Keep focus on search bar
                        modalInput.focus();
                    }
                });
                
                // Append elements
                noResultsContainer.appendChild(noResultsMessage);
                noResultsContainer.appendChild(clearButton);
                resultsContainer.appendChild(noResultsContainer);
            }
        }
        
        // Set up all event listeners
        setupEventListeners() {
            if (!this.isMobile) {
                // Desktop event listeners
                // Input and focus events trigger search
                this.searchBar.addEventListener('input', () => this.debouncedSearch());
                this.searchBar.addEventListener('focus', () => this.performSearch());
                
                // Close search when clicking outside
                document.addEventListener('click', event => {
                    if (!this.searchBar.contains(event.target) && !this.searchResults.contains(event.target)) {
                        this.closeSearchDropdown();
                    }
                });
                
                // Keyboard navigation
                this.searchBar.addEventListener('keydown', this.handleKeyNavigation.bind(this));
            }
        }
        
        // Handle keyboard navigation in search results
        handleKeyNavigation(event) {
            if (event.key === 'Escape') {
                this.closeSearchDropdown();
            } else if (event.key === 'ArrowDown') {
                event.preventDefault(); // Prevent scrolling the page
                this.navigateSearchResults(1); // Move down
            } else if (event.key === 'ArrowUp') {
                event.preventDefault(); // Prevent scrolling the page
                this.navigateSearchResults(-1); // Move up
            } else if (event.key === 'Enter' && this.currentIndex >= 0 && this.currentIndex < this.searchResultItems.length) {
                event.preventDefault(); // Prevent form submission
                this.searchResultItems[this.currentIndex].click();
            }
        }
        
        // Navigate through search results with keyboard
        navigateSearchResults(direction) {
            if (this.searchResultItems.length === 0) return;
            
            // Clear previous selection
            if (this.currentIndex >= 0 && this.currentIndex < this.searchResultItems.length) {
                this.searchResultItems[this.currentIndex].classList.remove('search-result-selected', 'bg-[#232717]');
            }
            
            // Calculate new index with bounds checking
            if (direction > 0) {
                this.currentIndex = Math.min(this.currentIndex + 1, this.searchResultItems.length - 1);
            } else {
                this.currentIndex = Math.max(this.currentIndex - 1, 0);
            }
            
            // Highlight new selection
            if (this.currentIndex >= 0) {
                this.searchResultItems[this.currentIndex].classList.add('search-result-selected', 'bg-[#232717]');
                this.searchResultItems[this.currentIndex].scrollIntoView({ block: 'nearest' });
            }
        }
        
        // Close the search dropdown
        closeSearchDropdown() {
            if (this.searchResults) {
                // Hide results dropdown
                this.searchResults.classList.add('hidden');
                
                // Restore page scrolling
                document.body.style.overflow = '';
                
                // Clear search input when user clicks away
                if (this.searchBar) {
                    this.searchBar.value = '';
                }
                
                // Reset navigation state
                this.currentIndex = -1;
                this.searchResultItems = [];
            }
        }
        
        // Configure search results dropdown display
        configureResultsDropdown() {
            // Make the container visible
            this.searchResults.classList.remove('hidden');
            
            // Lock page scrolling
            document.body.style.overflow = 'hidden';
            
            // Set the container to full height
            const topPosition = this.searchResults.getBoundingClientRect().top;
            const maxHeight = window.innerHeight - topPosition - 10;
            this.searchResults.style.maxHeight = `${maxHeight}px`;
            this.searchResults.style.overflowY = 'auto';
            
            // Set width appropriately
            if (window.innerWidth >= 768) {
                this.searchResults.style.width = this.searchBar.offsetWidth + 'px';
            } else {
                this.searchResults.style.width = '100%';
            }
        }
        
        // Perform search and show results
        performSearch() {
            if (!this.searchService) {
                this.searchService = window.searchServiceInstance;
                if (!this.searchService) return; // Still no search service available
            }
            
            // Reset current search state
            this.searchResults.innerHTML = '';
            this.searchResultItems = [];
            this.currentIndex = -1;
            
            // Configure the dropdown
            this.configureResultsDropdown();
            
            // Get the search query
            const query = this.searchBar.value.toLowerCase().trim();
            
            // If search service isn't loaded yet, start loading and show loading state
            if (!this.searchService.isLoaded()) {
                // Show loading indicator
                const loading = document.createElement('div');
                loading.className = 'px-4 py-3 text-off-white text-center';
                loading.textContent = 'Loading recipes...';
                this.searchResults.appendChild(loading);
                
                // Load recipes then search when ready
                this.searchService.loadRecipes().then(() => {
                    this.performSearch();
                });
                return;
            }
            
            // Check that we have enough recipes (at least 40)
            if (this.searchService.getAllRecipes().length < 40) {
                // Force a recipe refresh to ensure we have all recipes
                this.searchService.refreshRecipes().then(() => {
                    // Try the search again after refresh
                    this.performSearch();
                });
                return;
            }
            
            // Perform search
            let results = query 
                ? this.searchService.search(query) 
                : this.searchService.getAllRecipes();
            
            // Render results
            this.renderSearchResults(results);
        }
        
        // Render search results
        renderSearchResults(results) {
            // Create container for results
            const container = document.createElement('div');
            
            if (results.length > 0) {
                // Show result count
                const resultCount = Math.min(this.options.maxResults, results.length);
                
                // Loop through results and create UI
                results.slice(0, this.options.maxResults).forEach(recipe => {
                    const item = document.createElement('div');
                    item.className = 'px-4 py-2.5 cursor-pointer search-result-item flex items-center space-x-3 border-b border-[#2f3525] hover:bg-[#232717]';
                    item.setAttribute('role', 'option');
                    
                    const image = document.createElement('img');
                    image.src = recipe.img;
                    image.alt = '';
                    image.className = 'w-8 h-8 rounded-3xl object-cover';
                    
                    const title = document.createElement('span');
                    title.className = 'text-off-white truncate text-base';
                    title.textContent = recipe.title;
                    
                    item.appendChild(image);
                    item.appendChild(title);
                    
                    item.addEventListener('click', () => {
                        window.location.href = recipe.link;
                    });
                    
                    // Store for keyboard navigation
                    this.searchResultItems.push(item);
                    container.appendChild(item);
                });
            } else {
                // Show enhanced no results message
                const noResultsContainer = document.createElement('div');
                noResultsContainer.className = 'px-4 py-6 flex flex-col items-center justify-center space-y-4';
                
                // Message text
                const noResultsMessage = document.createElement('p');
                noResultsMessage.className = 'text-off-white text-xl font-medium';
                noResultsMessage.textContent = 'No recipes found';
                
                // Clear button
                const clearButton = document.createElement('button');
                clearButton.className = 'px-4 py-2 bg-button hover:bg-button/90 text-white transition-colors duration-200 rounded-3xl text-base font-medium';
                clearButton.textContent = 'Clear search';
                clearButton.addEventListener('click', () => {
                    // Clear the search input
                    if (this.searchBar) {
                        // First clear the search input value
                        this.searchBar.value = '';
                        
                        // Instead of trying to manually reproduce the behavior,
                        // simply call performSearch() - the exact same method that's called
                        // when clicking into the search bar initially
                        this.performSearch();
                        
                        // Keep focus on the search bar
                        this.searchBar.focus();
                    }
                });
                
                // Append elements
                noResultsContainer.appendChild(noResultsMessage);
                noResultsContainer.appendChild(clearButton);
                container.appendChild(noResultsContainer);
            }
            
            // Add to DOM
            this.searchResults.innerHTML = '';
            this.searchResults.appendChild(container);
            
            // Set ARIA attributes for accessibility
            this.searchResults.setAttribute('role', 'listbox');
            this.searchResults.setAttribute('aria-label', 'Search results');
        }
    }

    // Export to global scope
    window.SearchService = SearchService;
    window.searchServiceInstance = new SearchService();
    
    // Initialize search UI when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Make sure to load all recipes immediately for faster search
        if (window.searchServiceInstance && !window.searchServiceInstance.isLoaded()) {
            window.searchServiceInstance.loadRecipes();
        }
        
        // Initialize UI
        new SearchUI();
    });
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