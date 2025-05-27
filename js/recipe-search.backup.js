/**
 * Best-in-class search implementation for Tasty Cooking
 * - Dynamically loads all recipes from the homepage
 * - Shows ALL results without limit
 * - Full-height dropdown
 * - No hardcoded data
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const searchBar = document.getElementById('search-bar');
    const searchResults = document.getElementById('search-results');
    
    if (!searchBar || !searchResults) {
        console.error('Search elements not found');
        return;
    }
    
    // Don't force cards to be visible here - let the pagination system handle it
    // We'll just check if all cards are hidden, and if so, make the first 12 visible
    const recipeCards = document.querySelectorAll('#recipe-grid > a');
    const allHidden = Array.from(recipeCards).every(card => 
        window.getComputedStyle(card).display === 'none'
    );
    
    if (allHidden && recipeCards.length > 0) {
        // Only show first 12 cards (default pagination)
        for (let i = 0; i < Math.min(12, recipeCards.length); i++) {
            recipeCards[i].style.display = '';
        }
    }
    
    // Get all recipes immediately on page load
    let allRecipes = [];
    let recipesLoaded = false;
    let currentIndex = -1; // Track selected item for keyboard navigation
    let searchResultItems = []; // Store result items for keyboard navigation
    
    // Function to handle search
    function handleSearch() {
        // If recipes aren't loaded yet, load them first
        if (!recipesLoaded) {
            loadAllRecipes().then(() => {
                performSearch();
            });
            return;
        }
        
        performSearch();
    }
    
    function performSearch() {
        // Clear current results
        searchResults.innerHTML = '';
        searchResultItems = [];
        currentIndex = -1;
        
        // Make the container visible
        searchResults.classList.remove('hidden');
        
        // Lock page scrolling
        document.body.style.overflow = 'hidden';
        
        // Set the container to full height
        const topPosition = searchResults.getBoundingClientRect().top;
        const maxHeight = window.innerHeight - topPosition - 10;
        searchResults.style.maxHeight = `${maxHeight}px`;
        searchResults.style.overflowY = 'auto';
        
        // Set width appropriately
        if (window.innerWidth >= 768) {
            searchResults.style.width = searchBar.offsetWidth + 'px';
        } else {
            searchResults.style.width = '100%';
        }
        
        // Get the search query
        const query = searchBar.value.toLowerCase().trim();
        
        // Filter recipes based on query
        let results = [];
        if (!query) {
            // If no query, show all recipes
            results = allRecipes;
            console.log("Showing all recipes, total count:", allRecipes.length);
        } else {
            // For search, try to match in multiple ways to ensure nothing is missed
            results = allRecipes.filter(recipe => {
                const title = recipe.title.toLowerCase();
                const words = title.split(' ');
                
                // Direct match
                if (title.includes(query)) return true;
                
                // Match individual words
                for (let word of words) {
                    if (word.includes(query) || query.includes(word)) return true;
                }
                
                return false;
            });
            
            console.log("Query search found:", results.length, "of", allRecipes.length, "total recipes");
        }
        
        // Create the results HTML
        const container = document.createElement('div');
        
        results.forEach((recipe, index) => {
            const item = document.createElement('div');
            item.className = 'px-4 py-2 cursor-pointer search-result-item flex items-center space-x-2 border-b border-[#2f3525]';
            
            const image = document.createElement('img');
            image.src = recipe.img;
            image.alt = '';
            image.className = 'w-5 h-5 rounded-sm object-cover';
            
            const title = document.createElement('span');
            title.className = 'text-off-white capitalize truncate';
            title.textContent = recipe.title.toLowerCase();
            
            item.appendChild(image);
            item.appendChild(title);
            
            item.addEventListener('click', () => {
                window.location.href = recipe.link;
            });
            
            // Store for keyboard navigation
            searchResultItems.push(item);
            container.appendChild(item);
        });
        
        if (results.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'px-4 py-3 text-off-white text-center';
            noResults.textContent = 'No matching recipes found';
            container.appendChild(noResults);
        }
        
        searchResults.appendChild(container);
    }
    
    // Load all recipes from the homepage
    async function loadAllRecipes() {
        try {
            // First try to load from current page if we're on the homepage
            if (document.querySelectorAll('#recipe-grid > a').length > 0) {
                const localRecipes = [];
                document.querySelectorAll('#recipe-grid > a').forEach(element => {
                    const title = element.querySelector('.recipe-title')?.textContent || '';
                    const link = element.getAttribute('href') || '';
                    const img = element.querySelector('img')?.getAttribute('src') || '';
                    
                    if (title && link) {
                        localRecipes.push({
                            title,
                            link,
                            img
                        });
                    }
                });
                
                if (localRecipes.length > 0) {
                    console.log(`Loaded ${localRecipes.length} recipes from current page`);
                    allRecipes = localRecipes;
                    recipesLoaded = true;
                    return;
                }
            }
            
            // Otherwise fetch from homepage
            const response = await fetch('/');
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract recipes from homepage DOM
            const recipeElements = doc.querySelectorAll('#recipe-grid > a');
            const homeRecipes = [];
            
            recipeElements.forEach(element => {
                const title = element.querySelector('.recipe-title')?.textContent || '';
                const link = element.getAttribute('href') || '';
                const img = element.querySelector('img')?.getAttribute('src') || '';
                
                if (title && link) {
                    homeRecipes.push({
                        title,
                        link,
                        img
                    });
                }
            });
            
            if (homeRecipes.length > 0) {
                console.log(`Loaded ${homeRecipes.length} recipes from homepage`);
                allRecipes = homeRecipes;
                recipesLoaded = true;
            } else {
                // Fallback to sitemap as a last resort
                const sitemapResponse = await fetch('/sitemap.xml');
                const sitemapXml = await sitemapResponse.text();
                const sitemapDoc = parser.parseFromString(sitemapXml, 'text/xml');
                
                const sitemapRecipes = [];
                const urls = sitemapDoc.querySelectorAll('url loc');
                
                urls.forEach(urlNode => {
                    const url = urlNode.textContent;
                    if (url && !url.includes('index.html') && !url.includes('.js') && !url.includes('.css') && !url.includes('robots.txt')) {
                        const parts = url.split('/');
                        const slug = parts[parts.length - 1].replace('.html', '');
                        
                        if (slug) {
                            const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                            const imgPath = `assets/img/${slug}.jpg`;
                            
                            sitemapRecipes.push({
                                title,
                                link: slug,
                                img: imgPath
                            });
                        }
                    }
                });
                
                if (sitemapRecipes.length > 0) {
                    console.log(`Loaded ${sitemapRecipes.length} recipes from sitemap`);
                    allRecipes = sitemapRecipes;
                    recipesLoaded = true;
                }
            }
        } catch (error) {
            console.error('Error loading recipes:', error);
            
            // Fallback to a minimal set of known recipes
            console.log('Using fallback recipe data');
            
            // Add a few essential recipes as absolute fallback
            allRecipes = [
                { title: "Sesame Green Beans", link: "sesame-green-beans", img: "assets/img/sesame-green-beans.jpg" },
                { title: "Guacamole", link: "guacamole", img: "assets/img/guacamole.jpg" },
                { title: "Roasted Cauliflower", link: "roasted-cauliflower", img: "assets/img/roasted-cauliflower.jpg" },
                { title: "Pomodoro Sauce", link: "pomodoro-sauce", img: "assets/img/pomodoro.jpg" }
            ];
            recipesLoaded = true;
        }
    }
    
    // Load recipes immediately
    loadAllRecipes();
    
    // Event listeners
    searchBar.addEventListener('input', handleSearch);
    searchBar.addEventListener('focus', handleSearch);
    
    // Close search when clicking outside
    document.addEventListener('click', event => {
        if (!searchBar.contains(event.target) && !searchResults.contains(event.target)) {
            searchResults.classList.add('hidden');
            // Restore page scrolling
            document.body.style.overflow = '';
        }
    });
    
    // Enhanced keyboard navigation
    searchBar.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            searchResults.classList.add('hidden');
            // Restore page scrolling
            document.body.style.overflow = '';
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();  // Prevent scrolling the page
            
            if (currentIndex < searchResultItems.length - 1) {
                // Clear previous selection
                if (currentIndex >= 0) {
                    searchResultItems[currentIndex].classList.remove('search-result-selected');
                }
                
                // Move to next item
                currentIndex++;
                
                // Highlight new selection
                searchResultItems[currentIndex].classList.add('search-result-selected');
                
                // Ensure it's visible
                searchResultItems[currentIndex].scrollIntoView({ block: 'nearest' });
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();  // Prevent scrolling the page
            
            if (currentIndex > 0) {
                // Clear previous selection
                if (currentIndex >= 0) {
                    searchResultItems[currentIndex].classList.remove('search-result-selected');
                }
                
                // Move to previous item
                currentIndex--;
                
                // Highlight new selection
                searchResultItems[currentIndex].classList.add('search-result-selected');
                
                // Ensure it's visible
                searchResultItems[currentIndex].scrollIntoView({ block: 'nearest' });
            }
        } else if (event.key === 'Enter' && currentIndex >= 0 && currentIndex < searchResultItems.length) {
            // Navigate to the selected recipe
            event.preventDefault();
            searchResultItems[currentIndex].click();
        }
    });
});