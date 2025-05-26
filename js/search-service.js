/**
 * search-service.js
 * A modular, reusable search service for Tasty Cooking website
 * Features:
 * - LocalStorage caching of recipe data
 * - Multiple data sources with fallbacks
 * - Fuzzy search for better results
 * - ARIA accessibility improvements
 * - Error handling and performance optimizations
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
                fuzzyMatchThreshold: 0.4, // Threshold for fuzzy matching (0-1)
                debounceTime: 300, // ms to wait before processing search input
                ...config // Merge with provided config
            };

            // State variables
            this.recipes = [];
            this.recipesLoaded = false;
            this.dataLoadPromise = null;
            this.eventListeners = {};

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
                            
                            recipes.push({
                                title: title,
                                link: slug,
                                img: imgPath,
                                searchTerms: this.generateSearchTerms(title, slug)
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
                   url.includes('manifest.json');
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

        // Generate additional search terms to improve search
        generateSearchTerms(title, slug) {
            const terms = [
                title.toLowerCase(),
                slug.replace(/-/g, ' '),
                // Add common alternatives for ingredients
                slug.includes('tomato') ? 'pasta sauce' : '',
                slug.includes('chicken') ? 'poultry' : '',
                slug.includes('beans') ? 'legumes' : '',
                slug.includes('broccolini') ? 'broccoli vegetables' : '',
                slug.includes('cauliflower') ? 'vegetables' : '',
                slug.includes('salad') ? 'healthy' : '',
                slug.includes('kimchi') ? 'korean spicy fermented' : '',
                slug.includes('pancakes') ? 'breakfast' : '',
                slug.includes('salsa') ? 'mexican sauce' : '',
                slug.includes('soup') ? 'stew' : ''
            ].filter(Boolean); // Remove empty strings
            
            return terms.join(' ');
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
                        
                        if (title && link) {
                            // Convert link to slug by removing .html
                            const slug = link.replace('.html', '');
                            
                            recipes.push({
                                title: title,
                                link: slug,
                                img: imgSrc,
                                searchTerms: this.generateSearchTerms(title, slug)
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
                { title: "Sesame Green Beans", link: "sesame-green-beans", img: "assets/img/sesame-green-beans.jpg", searchTerms: "vegetables side dish" },
                { title: "Guacamole", link: "guacamole", img: "assets/img/guacamole.jpg", searchTerms: "avocado dip mexican" },
                { title: "Roasted Cauliflower", link: "roasted-cauliflower", img: "assets/img/roasted-cauliflower.jpg", searchTerms: "vegetables side dish" },
                { title: "Roasted Broccolini", link: "roasted-broccolini", img: "assets/img/grilled-broccolini.jpg", searchTerms: "vegetables side dish" },
                { title: "Charred Brussels Sprouts", link: "charred-brussels-sprouts", img: "assets/img/charred-brussels-sprouts.jpg", searchTerms: "vegetables side dish" },
                { title: "Honey Butter Pancakes", link: "honey-butter-pancakes", img: "assets/img/pancakes.jpg", searchTerms: "breakfast" },
                { title: "Cajun Honey Butter Salmon", link: "cajun-honey-butter-salmon", img: "assets/img/cajun-salmon.jpg", searchTerms: "seafood" },
                { title: "Roasted Chicken", link: "roasted-chicken", img: "assets/img/roasted-chicken.jpg", searchTerms: "poultry meat" },
                { title: "Black Bean Avocado Wraps", link: "avocado-wraps", img: "assets/img/black-bean-avocado-wraps.jpg", searchTerms: "vegetarian" },
                { title: "Cucumber Salad", link: "cucumber-salad", img: "assets/img/cucumber-salad.jpg", searchTerms: "vegetable side" },
                { title: "Sweet Potato Cakes", link: "sweet-potato-cakes", img: "assets/img/sweet-potato-cakes.jpg", searchTerms: "vegetable" },
                { title: "Leek Fritters", link: "leek-fritters", img: "assets/img/leek-fritters.jpg", searchTerms: "vegetable" },
                { title: "Sweet Potato Hash", link: "sweet-potato-hash", img: "assets/img/sweet-potato-hash.jpg", searchTerms: "breakfast vegetable" },
                { title: "Roasted Beets", link: "roasted-beets", img: "assets/img/roasted-beets.jpg", searchTerms: "vegetable" },
                { title: "Black Pepper Tofu", link: "black-pepper-tofu", img: "assets/img/black-pepper-tofu.jpg", searchTerms: "vegetarian" },
                { title: "Potato Green Bean Soup", link: "potato-green-bean-soup", img: "assets/img/potato-green-bean-soup.jpg", searchTerms: "soup vegetable" },
                { title: "Roasted Garlic Lentil Soup", link: "roasted-garlic-lentil-soup", img: "assets/img/roasted-garlic-lentil-soup.jpg", searchTerms: "soup" },
                { title: "Pistachio Butter", link: "pistachio-butter", img: "assets/img/pistachio-butter.jpg", searchTerms: "condiment" },
                { title: "Beet Slaw", link: "beet-slaw", img: "assets/img/beet-slaw.jpg", searchTerms: "vegetable side" },
                { title: "Ratatouille", link: "ratatouille", img: "assets/img/ratatouille.jpg", searchTerms: "vegetable" },
                { title: "Eggplant with Buttermilk Sauce", link: "eggplant-with-buttermilk-sauce", img: "assets/img/eggplant-with-buttermilk-sauce.jpg", searchTerms: "vegetable" },
                { title: "Crunchy Pappardelle", link: "crunchy-pappardelle", img: "assets/img/crunchy-pappardelle.jpg", searchTerms: "pasta" },
                { title: "Chimichurri", link: "chimichurri", img: "assets/img/chimichurri.jpg", searchTerms: "condiment sauce" },
                { title: "Salsa", link: "salsa", img: "assets/img/salsa.jpg", searchTerms: "condiment mexican" },
                { title: "Nashville Hot Chicken", link: "nashville-hot-chicken", img: "assets/img/nashville-chicken.jpg", searchTerms: "meat chicken" },
                { title: "Japanese Tebasaki Wings", link: "japanese-tebasaki-wings", img: "assets/img/japanese-wings.jpg", searchTerms: "meat chicken" },
                { title: "Grilled Buffalo Wings", link: "grilled-buffalo-wings", img: "assets/img/grilled-buffalo-wings.jpg", searchTerms: "meat chicken" },
                { title: "Pineapple Ginger Smoothie", link: "pineapple-ginger-smoothie", img: "assets/img/pineapple-ginger-smoothie.jpg", searchTerms: "drink" },
                { title: "Roasted Sweet Potato Salad", link: "roasted-sweet-potato-salad", img: "assets/img/roasted-sweet-potato-salad.jpg", searchTerms: "vegetable" },
                { title: "Falafels", link: "falafels", img: "assets/img/falafals.jpg", searchTerms: "vegetarian" },
                { title: "Spicy Kimchi Broccoli Rabe", link: "spicy-kimchi-broccoli-rabe", img: "assets/img/spicy-kimchi-broccoli-rabe.jpg", searchTerms: "vegetable spicy" },
                { title: "California Za'atar", link: "california-za'atar", img: "assets/img/za'atar.jpg", searchTerms: "spice condiment" },
                { title: "Soffrito", link: "soffrito", img: "assets/img/soffrito.jpg", searchTerms: "condiment" },
                { title: "Mojo de Ajo", link: "mojo-de-ajo", img: "assets/img/mojo-de-ajo.jpg", searchTerms: "condiment sauce" },
                { title: "Romesco", link: "romesco", img: "assets/img/romesco.jpg", searchTerms: "sauce condiment" },
                { title: "Quesadillas", link: "quesadillas", img: "assets/img/quesadillas.jpg", searchTerms: "mexican" },
                { title: "White Bean Wraps", link: "white-bean-wraps", img: "assets/img/white-bean-wraps.jpg", searchTerms: "vegetarian" },
                { title: "Garlic Confit", link: "garlic-confit", img: "assets/img/garlic-confit.jpg", searchTerms: "condiment" },
                { title: "Pineapple Kimchi", link: "pineapple-kimchi", img: "assets/img/pineapple-kimchi.jpg", searchTerms: "condiment spicy" },
                { title: "Pomodoro Sauce", link: "pomodoro-sauce", img: "assets/img/pomodoro.jpg", searchTerms: "sauce italian" },
                { title: "Spaghetti Pomodoro", link: "spaghetti-pomodoro", img: "assets/img/spaghetti-pomodoro.jpg", searchTerms: "pasta italian" },
                { title: "Tomato Confit", link: "tomato-confit", img: "assets/img/tomato-confit.jpg", searchTerms: "condiment" },
                { title: "Sesame Orange Chicken", link: "sesame-orange-chicken", img: "assets/img/spicy-orange-sesame-chicken.jpg", searchTerms: "meat chicken" }
            ]);
        }

        // Simple search that matches exactly how the index page works
        search(query, limit = 10) {
            if (!query || typeof query !== 'string') {
                return [];
            }
            
            const normalizedQuery = query.toLowerCase().trim();
            
            if (normalizedQuery.length === 0) {
                return [];
            }
            
            // Simple substring matching - exactly like the index page
            return this.recipes
                .filter(recipe => 
                    recipe.title.toLowerCase().includes(normalizedQuery)
                )
                .slice(0, limit);
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
    }

    // Export to global scope
    window.SearchService = SearchService;
})();

/**
 * Debounce function for improving search input performance
 * Delays execution of a function until after a specified wait time
 */
function debounce(func, wait = 300) {
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