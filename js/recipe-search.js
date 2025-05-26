// Search functionality for recipe pages
document.addEventListener('DOMContentLoaded', function() {
    // Variables for search functionality
    const searchBar = document.getElementById('search-bar');
    const searchResults = document.getElementById('search-results');
    
    if (!searchBar || !searchResults) {
        console.error("Critical search elements not found on page");
        return;
    }
    
    // Dynamic recipe list - fetched from sitemap.xml or by scanning the server
    let recipes = [];
    let recipesLoaded = false;
    
    // Fetch the sitemap to get all recipes
    fetch('/sitemap.xml')
        .then(response => response.text())
        .then(xml => {
            const parser = new DOMParser();
            const sitemap = parser.parseFromString(xml, 'text/xml');
            const urls = sitemap.querySelectorAll('url loc');
            
            // Process all URLs from the sitemap
            urls.forEach(url => {
                const fullUrl = url.textContent;
                // Skip non-recipe pages like index, CSS, etc.
                if (fullUrl.includes('index.html') || 
                    fullUrl.includes('.css') || 
                    fullUrl.includes('.js') || 
                    fullUrl.includes('robots.txt') ||
                    fullUrl.includes('manifest.json')) {
                    return;
                }
                
                // Extract the recipe slug (file name without extension)
                const urlParts = fullUrl.split('/');
                const slug = urlParts[urlParts.length - 1].replace('.html', '');
                
                if (slug) {
                    // Derive image path from slug
                    const imgName = slug.replace(/-/g, '-');
                    let imgPath;
                    
                    // Handle special cases for image paths
                    if (slug === 'roasted-broccolini') {
                        imgPath = 'assets/img/grilled-broccolini.jpg';
                    } else if (slug === 'honey-butter-pancakes') {
                        imgPath = 'assets/img/pancakes.jpg';
                    } else if (slug === 'sesame-orange-chicken') {
                        imgPath = 'assets/img/spicy-orange-sesame-chicken.jpg';
                    } else if (slug === 'nashville-hot-chicken') {
                        imgPath = 'assets/img/nashville-chicken.jpg';
                    } else if (slug === 'pomodoro-sauce') {
                        imgPath = 'assets/img/pomodoro.jpg';
                    } else {
                        imgPath = `assets/img/${slug}.jpg`;
                    }
                    
                    // Convert slug to title (capitalize first letter of each word)
                    const title = slug.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ');
                    
                    recipes.push({
                        title: title,
                        link: slug,
                        img: imgPath
                    });
                }
            });
            
            // Recipes loaded successfully from sitemap
            recipesLoaded = true;
        })
        .catch(error => {
            console.error('Error loading sitemap:', error);
            // Fall back to scanning HTML files
            fetchRecipesFromHTML();
        });
    
    // Fallback method - fetch the index page and extract recipes
    function fetchRecipesFromHTML() {
        fetch('/')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const recipeCards = doc.querySelectorAll('#recipe-grid > a');
                
                recipeCards.forEach(card => {
                    const title = card.querySelector('.recipe-title')?.textContent || '';
                    const link = card.getAttribute('href') || '';
                    let img = card.querySelector('img');
                    const imgSrc = img ? img.getAttribute('src') : '';
                    
                    if (title && link) {
                        recipes.push({
                            title: title,
                            link: link,
                            img: imgSrc
                        });
                    }
                });
                
                // Recipes loaded successfully from HTML
                recipesLoaded = true;
            })
            .catch(error => {
                console.error('Error fetching recipes from HTML:', error);
                // Fall back to basic recipes only if everything else failed
                loadBasicRecipes();
            });
    }
    
    // Last resort fallback - just load a few basic recipes
    function loadBasicRecipes() {
        recipes = [
            { title: "Sesame Green Beans", link: "sesame-green-beans", img: "assets/img/sesame-green-beans.jpg" },
            { title: "Guacamole", link: "guacamole", img: "assets/img/guacamole.jpg" }
        ];
        // Using fallback recipe list
        recipesLoaded = true;
    }
    
    let currentIndex = -1;

    // Disable autocomplete for the search bar
    searchBar.setAttribute('autocomplete', 'off');
    
    // Add event listener for input
    searchBar.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        // Process search query
        
        // Clear previous results
        searchResults.innerHTML = '';
        currentIndex = -1;
        
        if (query.length > 0) {
            // If recipes aren't loaded yet, show loading indicator
            if (!recipesLoaded || recipes.length === 0) {
                searchResults.classList.remove('hidden');
                
                if (window.innerWidth >= 768) {
                    searchResults.style.width = searchBar.offsetWidth + 'px';
                } else {
                    searchResults.style.width = '100%';
                }
                
                const loadingDiv = document.createElement('div');
                loadingDiv.className = 'px-4 py-3 text-off-white text-center';
                loadingDiv.textContent = 'Loading recipes...';
                searchResults.appendChild(loadingDiv);
                return;
            }
            
            // Filter recipes based on query
            const filteredRecipes = recipes.filter(recipe => 
                recipe.title.toLowerCase().includes(query)
            );
            
            // Process filtered recipes
            
            if (filteredRecipes.length > 0) {
                // Make search results visible and ensure it's the right width
                searchResults.classList.remove('hidden');
                
                // On desktop, ensure search results width matches search bar width
                if (window.innerWidth >= 768) {
                    searchResults.style.width = searchBar.offsetWidth + 'px';
                } else {
                    searchResults.style.width = '100%';
                }
                
                // Create result items
                filteredRecipes.forEach(recipe => {
                    const div = document.createElement('div');
                    div.className = 'px-4 py-2 cursor-pointer hover:bg-[#222616] flex items-center space-x-2 border-b border-[#2f3525] w-full';
                    div.innerHTML = `
                        <img src="${recipe.img}" alt="${recipe.title}" class="w-5 h-5 rounded-sm object-cover"> 
                        <span class="text-off-white capitalize truncate">${recipe.title.toLowerCase()}</span>
                    `;
                    div.addEventListener('click', () => {
                        window.location.href = recipe.link;
                    });
                    searchResults.appendChild(div);
                });
            } else {
                // Show "no matches" message instead of hiding
                searchResults.classList.remove('hidden');
                
                // On desktop, ensure search results width matches search bar width
                if (window.innerWidth >= 768) {
                    searchResults.style.width = searchBar.offsetWidth + 'px';
                } else {
                    searchResults.style.width = '100%';
                }
                
                // Add a "no matches" message to the dropdown
                const noMatchesDiv = document.createElement('div');
                noMatchesDiv.className = 'px-4 py-3 text-off-white text-center';
                noMatchesDiv.textContent = 'No matching recipes found';
                searchResults.appendChild(noMatchesDiv);
            }
        } else {
            // Hide search results if query is empty
            searchResults.classList.add('hidden');
        }
    });
    
    // Add keyboard navigation
    searchBar.addEventListener('keydown', function(event) {
        const results = Array.from(searchResults.children);
        
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (currentIndex < results.length - 1) {
                currentIndex++;
                updateHighlightedResult(results);
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (currentIndex > 0) {
                currentIndex--;
                updateHighlightedResult(results);
            }
        } else if (event.key === 'Enter') {
            if (currentIndex > -1 && currentIndex < results.length) {
                results[currentIndex].click();
            }
        } else if (event.key === 'Escape') {
            searchResults.classList.add('hidden');
        }
    });
    
    function updateHighlightedResult(results) {
        results.forEach((result, index) => {
            if (index === currentIndex) {
                // Use !important to ensure style takes precedence over any CSS rules
                result.style.setProperty('background-color', '#222616', 'important');
            } else {
                // Remove inline style when not selected
                result.style.backgroundColor = '';
            }
        });
    }
    
    // Hide search results when clicking outside
    document.addEventListener('click', function(event) {
        if (!searchBar.contains(event.target) && !searchResults.contains(event.target)) {
            searchResults.classList.add('hidden');
        }
    });
    
    // Add window resize listener to adjust search results width
    window.addEventListener('resize', () => {
        // Update search results width when window is resized
        if (searchResults && !searchResults.classList.contains('hidden')) {
            if (window.innerWidth >= 768) {
                searchResults.style.width = searchBar.offsetWidth + 'px';
            } else {
                searchResults.style.width = '100%';
            }
        }
    });
    
    // Handle focus and blur events
    searchBar.addEventListener('focus', function() {
        // If there's text in the search bar, show results again
        if (this.value.trim().length > 0) {
            // Trigger input event to rebuild results
            this.dispatchEvent(new Event('input'));
        }
    });
});