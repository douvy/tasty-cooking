// Search functionality for recipe pages
document.addEventListener('DOMContentLoaded', function() {
    // Variables for search functionality
    const searchBar = document.getElementById('search-bar');
    const searchResults = document.getElementById('search-results');
    
    if (!searchBar || !searchResults) {
        console.error("Critical search elements not found on page");
        return;
    }
    
    // Initialize the search service
    const searchService = new SearchService({
        debounceTime: 300, // 300ms debounce for smooth typing experience
        fuzzyMatchThreshold: 0.3 // Lower threshold for more inclusive results
    });
    
    let currentIndex = -1;
    
    // Setup ARIA attributes for accessibility
    searchBar.setAttribute('role', 'combobox');
    searchBar.setAttribute('aria-expanded', 'false');
    searchBar.setAttribute('aria-autocomplete', 'list');
    searchBar.setAttribute('aria-controls', 'search-results');
    searchBar.setAttribute('aria-haspopup', 'listbox');
    searchBar.setAttribute('autocomplete', 'off');
    
    searchResults.setAttribute('role', 'listbox');
    searchResults.setAttribute('aria-label', 'Recipe search results');
    
    // Setup results UI on recipe data load
    searchService.on('recipesLoaded', function(recipes) {
        // If search is active, refresh results
        if (searchBar.value.trim().length > 0) {
            handleSearchInput();
        }
    });
    
    // Create a debounced search handler for better performance
    const handleSearchInput = debounce(function() {
        const query = searchBar.value.toLowerCase().trim();
        
        // Clear previous results
        searchResults.innerHTML = '';
        currentIndex = -1;
        
        // Update ARIA attributes
        searchBar.setAttribute('aria-expanded', 'true'); // Always true since we'll show results
        
        if (query.length === 0) {
            // If query is empty, show all recipes
            fetch('/')
                .then(response => response.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const recipeCards = doc.querySelectorAll('#recipe-grid > a');
                    const allHomeRecipes = [];
                    
                    recipeCards.forEach(card => {
                        const title = card.querySelector('.recipe-title')?.textContent || '';
                        const link = card.getAttribute('href') || '';
                        let img = card.querySelector('img');
                        const imgSrc = img ? img.getAttribute('src') : '';
                        
                        if (title && link) {
                            allHomeRecipes.push({
                                title: title,
                                link: link,
                                img: imgSrc
                            });
                        }
                    });
                    
                    // Always show these recipes regardless of what's in the cache
                    if (allHomeRecipes.length > 0) {
                        showResults(allHomeRecipes);
                    } else {
                        // Fallback to service if fetch fails
                        const allRecipes = searchService.getAllRecipes();
                        if (allRecipes.length > 0) {
                            showResults(allRecipes);
                        }
                    }
                })
                .catch(error => {
                    // If fetch fails, fall back to service
                    const allRecipes = searchService.getAllRecipes();
                    if (allRecipes.length > 0) {
                        showResults(allRecipes);
                    }
                });
            return;
        }
        
        // If recipes aren't loaded yet, show loading indicator
        if (!searchService.isLoaded()) {
            showLoadingIndicator();
            return;
        }
        
        // Get search results from the service - use 100 for limit to ensure we show all possible matches
        const filteredRecipes = searchService.search(query, 100);
        
        // Show search results
        if (filteredRecipes.length > 0) {
            showResults(filteredRecipes);
        } else {
            showNoResultsMessage();
        }
    }, 300);
    
    // Show loading indicator
    function showLoadingIndicator() {
        searchResults.classList.remove('hidden');
        adjustResultsWidth();
        
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'px-4 py-3 text-off-white text-center';
        loadingDiv.textContent = 'Loading recipes...';
        loadingDiv.setAttribute('role', 'status');
        loadingDiv.setAttribute('aria-live', 'polite');
        searchResults.appendChild(loadingDiv);
    }
    
    // Show search results with scrollable container
    function showResults(recipes) {
        searchResults.classList.remove('hidden');
        adjustResultsWidth();
        
        // Apply max-height and make scrollable
        const maxHeight = window.innerHeight - searchResults.getBoundingClientRect().top - 20; // 20px buffer
        searchResults.style.maxHeight = `${maxHeight}px`;
        searchResults.style.overflowY = 'auto';
        
        // Lock body scroll when dropdown is visible
        document.body.style.overflow = 'hidden';
        
        // Create scrollable container for results
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results-container w-full';
        
        // Create result items
        recipes.forEach((recipe, index) => {
            const div = document.createElement('div');
            div.className = 'px-4 py-2 cursor-pointer hover:bg-[#222616] flex items-center space-x-2 border-b border-[#2f3525] w-full';
            div.setAttribute('role', 'option');
            div.setAttribute('id', `search-result-${index}`);
            div.setAttribute('aria-selected', 'false');
            div.setAttribute('tabindex', '-1');
            
            div.innerHTML = `
                <img src="${recipe.img}" alt="" class="w-5 h-5 rounded-sm object-cover"> 
                <span class="text-off-white capitalize truncate">${recipe.title.toLowerCase()}</span>
            `;
            div.addEventListener('click', () => {
                window.location.href = recipe.link;
            });
            resultsContainer.appendChild(div);
        });
        
        searchResults.appendChild(resultsContainer);
    }
    
    // Show no results message
    function showNoResultsMessage() {
        searchResults.classList.remove('hidden');
        adjustResultsWidth();
        
        // Apply max-height and make scrollable
        const maxHeight = window.innerHeight - searchResults.getBoundingClientRect().top - 20; // 20px buffer
        searchResults.style.maxHeight = `${maxHeight}px`;
        searchResults.style.overflowY = 'auto';
        
        // Lock body scroll when dropdown is visible
        document.body.style.overflow = 'hidden';
        
        const noMatchesDiv = document.createElement('div');
        noMatchesDiv.className = 'px-4 py-3 text-off-white text-center';
        noMatchesDiv.textContent = 'No matching recipes found';
        noMatchesDiv.setAttribute('role', 'status');
        noMatchesDiv.setAttribute('aria-live', 'polite');
        searchResults.appendChild(noMatchesDiv);
    }
    
    // Adjust search results width based on screen size
    function adjustResultsWidth() {
        if (window.innerWidth >= 768) {
            searchResults.style.width = searchBar.offsetWidth + 'px';
        } else {
            searchResults.style.width = '100%';
        }
    }
    
    // Add event listener for input
    searchBar.addEventListener('input', handleSearchInput);
    
    // Add keyboard navigation
    searchBar.addEventListener('keydown', function(event) {
        const results = Array.from(searchResults.querySelectorAll('[role="option"]'));
        
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (currentIndex < results.length - 1) {
                currentIndex++;
                updateHighlightedResult(results);
                
                // Update ARIA attributes
                searchBar.setAttribute('aria-activedescendant', `search-result-${currentIndex}`);
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (currentIndex > 0) {
                currentIndex--;
                updateHighlightedResult(results);
                
                // Update ARIA attributes
                searchBar.setAttribute('aria-activedescendant', `search-result-${currentIndex}`);
            }
        } else if (event.key === 'Enter') {
            if (currentIndex > -1 && currentIndex < results.length) {
                results[currentIndex].click();
            }
        } else if (event.key === 'Escape') {
            searchResults.classList.add('hidden');
            searchBar.setAttribute('aria-expanded', 'false');
            
            // Re-enable body scrolling when closing dropdown
            document.body.style.overflow = '';
        }
    });
    
    function updateHighlightedResult(results) {
        results.forEach((result, index) => {
            if (index === currentIndex) {
                result.style.backgroundColor = '#222616';
                result.setAttribute('aria-selected', 'true');
            } else {
                result.style.backgroundColor = '';
                result.setAttribute('aria-selected', 'false');
            }
        });
        
        // Ensure the selected item is visible (scroll into view if needed)
        if (currentIndex > -1 && results[currentIndex]) {
            results[currentIndex].scrollIntoView({ block: 'nearest' });
        }
    }
    
    // Hide search results when clicking outside
    document.addEventListener('click', function(event) {
        if (!searchBar.contains(event.target) && !searchResults.contains(event.target)) {
            searchResults.classList.add('hidden');
            searchBar.setAttribute('aria-expanded', 'false');
            
            // Re-enable body scrolling
            document.body.style.overflow = '';
        }
    });
    
    // Add window resize listener to adjust search results width
    window.addEventListener('resize', () => {
        if (searchResults && !searchResults.classList.contains('hidden')) {
            adjustResultsWidth();
        }
    });
    
    // Handle focus and blur events
    searchBar.addEventListener('focus', function() {
        // Lock body scroll immediately on focus
        document.body.style.overflow = 'hidden';
        
        // If there's text in the search bar, show results again
        if (this.value.trim().length > 0) {
            handleSearchInput();
        } else {
            // If no input yet, force a reload of all recipes from index page and show them
            // This bypasses any caching issues to ensure we get ALL recipes
            fetch('/')
                .then(response => response.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const recipeCards = doc.querySelectorAll('#recipe-grid > a');
                    const allHomeRecipes = [];
                    
                    recipeCards.forEach(card => {
                        const title = card.querySelector('.recipe-title')?.textContent || '';
                        const link = card.getAttribute('href') || '';
                        let img = card.querySelector('img');
                        const imgSrc = img ? img.getAttribute('src') : '';
                        
                        if (title && link) {
                            allHomeRecipes.push({
                                title: title,
                                link: link,
                                img: imgSrc
                            });
                        }
                    });
                    
                    // Always show these recipes regardless of what's in the cache
                    if (allHomeRecipes.length > 0) {
                        showResults(allHomeRecipes);
                    } else {
                        // Fallback to service if fetch fails
                        const allRecipes = searchService.getAllRecipes();
                        if (allRecipes.length > 0) {
                            showResults(allRecipes);
                        }
                    }
                })
                .catch(error => {
                    // If fetch fails, fall back to service
                    const allRecipes = searchService.getAllRecipes();
                    if (allRecipes.length > 0) {
                        showResults(allRecipes);
                    }
                });
        }
    });
    
    searchBar.addEventListener('blur', function(event) {
        // Don't unlock if we're clicking in the results
        if (!searchResults.contains(event.relatedTarget)) {
            // Only unlock if we're not staying within the search UI
            setTimeout(() => {
                if (searchResults.classList.contains('hidden')) {
                    document.body.style.overflow = '';
                }
            }, 100);
        }
    });
});