// Variables for dropdowns and their buttons
const sortDropdownButton = document.getElementById('dropdown-button');
const sortDropdownMenu = document.getElementById('dropdown-menu');
const sortDropdownText = sortDropdownButton.querySelector('span');
const tagsDropdownButton = document.getElementById('tags-dropdown-button');
const tagsDropdownMenu = document.getElementById('tags-dropdown-menu');
const selectedTagsContainer = document.getElementById('selected-tags');

// Variables for recipes and search functionality
const recipeGrid = document.getElementById('recipe-grid');
const recipeCount = document.getElementById('recipe-count');
const searchBar = document.getElementById('search-bar');
const searchResults = document.getElementById('search-results');
let defaultOrder = [];
let recipes = [];
let currentIndex = -1;
let allRecipes = []; // Store all recipes
let visibleRecipes = []; // Store currently visible recipes
let currentPage = 1;
const recipesPerPage = 12; // Initial load of 12 recipes (6 rows of 2 on mobile, 4 rows of 3 on desktop)
let isLoading = false; // Flag to prevent multiple simultaneous loads

// Disable autocomplete for the search bar
searchBar.setAttribute('autocomplete', 'off');

// Save the default order of the cards and their titles and initialize pagination
function initializeRecipes() {
    // Store all recipe cards for pagination
    allRecipes = Array.from(document.querySelectorAll('#recipe-grid .block'));
    
    // Store recipes for search functionality
    allRecipes.forEach(card => {
        defaultOrder.push(card);
        recipes.push({
            title: card.querySelector('.recipe-title').innerText,
            element: card,
            link: card.getAttribute('href'),
            imgSrc: card.querySelector('img').src
        });
    });
    
    // Initially hide all recipes
    allRecipes.forEach(card => {
        card.style.display = 'none';
    });
    
    // Display only the first page of recipes
    showRecipesForPage(1);
    
    // Setup infinite scroll
    setupInfiniteScroll();
}

// Show recipes for the specified page
function showRecipesForPage(page) {
    const startIndex = (page - 1) * recipesPerPage;
    const endIndex = startIndex + recipesPerPage;
    
    // Show only recipes for the current page
    for (let i = startIndex; i < endIndex && i < allRecipes.length; i++) {
        allRecipes[i].style.display = '';
        visibleRecipes.push(allRecipes[i]);
    }
    
    updateRecipeCount();
}

// Setup infinite scroll
function setupInfiniteScroll() {
    // Create intersection observer for infinite scroll
    const observer = new IntersectionObserver((entries) => {
        // If the last visible recipe is visible and we're not already loading
        if (entries[0].isIntersecting && !isLoading) {
            // Check if there are more recipes to load
            if (currentPage * recipesPerPage < allRecipes.length) {
                loadMoreRecipes();
            }
        }
    }, { threshold: 0.1 });
    
    // Observe the last visible recipe
    function observeLastRecipe() {
        const lastVisibleRecipe = visibleRecipes[visibleRecipes.length - 1];
        if (lastVisibleRecipe) {
            observer.observe(lastVisibleRecipe);
        }
    }
    
    // Load more recipes when scrolling
    function loadMoreRecipes() {
        isLoading = true;
        
        // Get next set of recipes and add them with opacity initially
        const startIndex = currentPage * recipesPerPage;
        const endIndex = startIndex + recipesPerPage;
        const nextRecipes = [];
        
        for (let i = startIndex; i < endIndex && i < allRecipes.length; i++) {
            // Add opacity class for fade-in effect (25% opacity - more noticeable)
            allRecipes[i].classList.add('opacity-25');
            allRecipes[i].style.display = '';
            nextRecipes.push(allRecipes[i]);
            visibleRecipes.push(allRecipes[i]);
        }
        
        // Use requestAnimationFrame for smoother transition
        requestAnimationFrame(() => {
            // Small delay before removing opacity for visual effect
            setTimeout(() => {
                nextRecipes.forEach(recipe => {
                    recipe.classList.remove('opacity-25'); // Updated to match the new opacity class
                    recipe.classList.add('transition-opacity', 'duration-500');
                });
                
                currentPage++;
                isLoading = false;
                
                // Update the observed element
                observer.disconnect();
                observeLastRecipe();
            }, 200);
        });
        
        updateRecipeCount();
    }
    
    // Start observing
    observeLastRecipe();
}

// Initialize recipes and pagination
initializeRecipes();

// Function to update recipe count
function updateRecipeCount() {
    // When filtering is active, show count of visible recipes
    if (Array.from(selectedTagsContainer.children).length > 0) {
        const count = document.querySelectorAll('#recipe-grid > a:not([style*="display: none"])').length;
        recipeCount.textContent = count;
    } else {
        // In default/paginated view, show total recipe count
        recipeCount.textContent = allRecipes.length;
    }
}

// Dropdown toggle for tags
tagsDropdownButton.addEventListener('click', function(event) {
    event.stopPropagation();  // Prevent the event from bubbling up
    tagsDropdownMenu.classList.toggle('hidden');
    tagsDropdownButton.querySelector('svg').classList.toggle('transform');
    tagsDropdownButton.querySelector('svg').classList.toggle('rotate-180');
    // Collapse the sort dropdown if it's open
    sortDropdownMenu.classList.add('hidden');
    // Reset sort dropdown caret
    sortDropdownButton.querySelector('svg').classList.remove('transform', 'rotate-180');
});

// Dropdown toggle for sort
sortDropdownButton.addEventListener('click', function(event) {
    event.stopPropagation();  // Prevent the event from bubbling up
    sortDropdownMenu.classList.toggle('hidden');
    sortDropdownButton.querySelector('svg').classList.toggle('transform');
    sortDropdownButton.querySelector('svg').classList.toggle('rotate-180');
    // Collapse the tags dropdown if it's open
    tagsDropdownMenu.classList.add('hidden');
    // Reset tags dropdown caret
    tagsDropdownButton.querySelector('svg').classList.remove('transform', 'rotate-180');
});

// Handle tag selection
document.querySelectorAll('[data-tag]').forEach(function(element) {
    element.addEventListener('click', function(event) {
        event.preventDefault();
        const tag = event.target.getAttribute('data-tag');

        // Toggle tag active state
        if (event.target.classList.contains('bg-[#232717]')) {
            event.target.classList.remove('bg-[#232717]', 'text-off-white');
            removeTagLabel(tag);
        } else {
            event.target.classList.add('bg-[#232717]', 'text-off-white');
            addTagLabel(tag);
        }

        filterRecipes();
    });
});

function addTagLabel(tag) {
    // Check if tag is already added
    if (Array.from(selectedTagsContainer.children).some(child => child.textContent.trim().startsWith(tag))) {
        return;
    }

    // Add tag label
    const tagLabel = document.createElement('span');
    tagLabel.className = 'inline-flex items-center px-3 py-1 sm:py-2 text-sm rounded-sm bg-[#2e3523] capitalize text-off-white mt-2 mr-1 sm:mr-2 cursor-pointer hover:bg-light-gray';
    tagLabel.innerHTML = `${tag} <button type="button" class="ml-2 text-gray" aria-label="Remove tag"><i class="fas fa-times font-light"></i></button>`;
    selectedTagsContainer.appendChild(tagLabel);

    // Add close event to the new tag
    tagLabel.addEventListener('click', function() {
        tagLabel.remove();
        removeActiveState(tag);
        filterRecipes();
    });

    // Change icon color on hover
    tagLabel.addEventListener('mouseover', function() {
        tagLabel.querySelector('i').classList.add('text-off-white');
    });

    tagLabel.addEventListener('mouseout', function() {
        tagLabel.querySelector('i').classList.remove('text-off-white');
    });
}

function removeTagLabel(tag) {
    Array.from(selectedTagsContainer.children).forEach(child => {
        if (child.textContent.trim().startsWith(tag)) {
            child.remove();
        }
    });
}

function removeActiveState(tag) {
    document.querySelectorAll('[data-tag]').forEach(element => {
        if (element.getAttribute('data-tag') === tag) {
            element.classList.remove('bg-[#232717]', 'text-off-white');
        }
    });
}

// Function to filter recipes based on tags
function filterRecipes() {
    const selectedTags = Array.from(selectedTagsContainer.children).map(tag => tag.textContent.trim().split(' ')[0]);
    let visibleCount = 0;
    
    // Reset pagination when filtering
    currentPage = 1;
    visibleRecipes = [];
    
    // If no tags are selected, return to paginated view
    if (selectedTags.length === 0) {
        // Hide all recipes first
        allRecipes.forEach(recipe => {
            recipe.style.display = 'none';
        });
        
        // Show only first page
        showRecipesForPage(1);
        
        // Hide no results message if it exists
        const noResultsMsg = document.getElementById('no-results-message');
        if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
        
        // Re-enable infinite scroll for default view
        setupInfiniteScroll();
        return;
    }
    
    // When tags are selected, show all matching recipes at once (no pagination)
    allRecipes.forEach(recipe => {
        const recipeTags = recipe.getAttribute('data-tags').split(' ');
        if (selectedTags.every(tag => recipeTags.includes(tag))) {
            recipe.style.display = '';
            visibleRecipes.push(recipe);
            visibleCount++;
        } else {
            recipe.style.display = 'none';
        }
    });

    // Show or hide the "No results" message
    let noResultsMsg = document.getElementById('no-results-message');
    if (visibleCount === 0) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'no-results-message';
            noResultsMsg.className = 'text-center py-16 text-off-white w-full';
            noResultsMsg.innerHTML = '<p class="text-xl font-windsor-bold">No recipes match the selected filters</p><p class="mt-2 text-base">Try removing some tags to see more results</p>';
            recipeGrid.appendChild(noResultsMsg);
        } else {
            noResultsMsg.style.display = '';
        }
    } else if (noResultsMsg) {
        noResultsMsg.style.display = 'none';
    }

    updateRecipeCount();
}

// Handle sort selection
document.querySelectorAll('[data-sort]').forEach(function(element) {
    element.addEventListener('click', function(event) {
        event.preventDefault();
        const sortOption = event.target.getAttribute('data-sort');

        // Remove active class from all sort options
        document.querySelectorAll('[data-sort]').forEach(el => el.classList.remove('bg-gray', 'text-off-white'));

        // Add active class to the selected sort option
        event.target.classList.add('bg-gray', 'text-off-white');

        // Reset pagination
        currentPage = 1;
        visibleRecipes = [];

        // Sort all recipes
        if (sortOption === 'alphabetical') {
            allRecipes.sort((a, b) => a.querySelector('.recipe-title').textContent.localeCompare(b.querySelector('.recipe-title').textContent));
        } else {
            // Restore to the initial order
            allRecipes.sort((a, b) => defaultOrder.indexOf(a) - defaultOrder.indexOf(b));
        }

        // Hide all recipes first
        allRecipes.forEach(recipe => {
            recipe.style.display = 'none';
        });
        
        // Show first page
        showRecipesForPage(1);
        
        // Update the recipe grid - remove all recipes and add them back in sorted order
        // This ensures the DOM order matches the sorted order for proper infinite scrolling
        const tempRecipes = Array.from(allRecipes);
        recipeGrid.innerHTML = '';
        tempRecipes.forEach(recipe => recipeGrid.appendChild(recipe));
        
        // Reset infinite scroll
        setupInfiniteScroll();

        // Update sort button text
        sortDropdownText.textContent = event.target.textContent.trim();
        sortDropdownMenu.classList.add('hidden');
        // Reset sort dropdown caret
        sortDropdownButton.querySelector('svg').classList.remove('transform', 'rotate-180');
    });
});

// Close the dropdown when clicking outside
window.addEventListener('click', (event) => {
    if (!sortDropdownButton.contains(event.target) && !sortDropdownMenu.contains(event.target)) {
        sortDropdownMenu.classList.add('hidden');
        sortDropdownButton.querySelector('svg').classList.remove('transform', 'rotate-180');
    }
    if (!tagsDropdownButton.contains(event.target) && !tagsDropdownMenu.contains(event.target)) {
        tagsDropdownMenu.classList.add('hidden');
        tagsDropdownButton.querySelector('svg').classList.remove('transform', 'rotate-180');
    }
});

// Prevent event from bubbling up when clicking inside the dropdown menus
sortDropdownMenu.addEventListener('click', (event) => {
    event.stopPropagation();
});
tagsDropdownMenu.addEventListener('click', (event) => {
    event.stopPropagation();
});

// Initial count update
updateRecipeCount();

// Make sure to update the count when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateRecipeCount();
});

// Mobile menu functionality removed

// Add lazy loading, WebP support, and responsiveness to all recipe images
document.querySelectorAll('#recipe-grid img').forEach(img => {
    img.setAttribute('loading', 'lazy');
    
    // Add sizes attribute for responsive loading
    img.setAttribute('sizes', '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw');
    
    // Add WebP support with picture element
    const imgSrc = img.getAttribute('src');
    if (imgSrc && img.parentNode.tagName.toLowerCase() !== 'picture') {
        // Create the WebP version path
        const imgName = imgSrc.split('/').pop().split('.')[0];
        const webpSrc = `assets/img/webp/${imgName}.webp`;
        
        // Create picture element
        const picture = document.createElement('picture');
        
        // Add WebP source
        const source = document.createElement('source');
        source.setAttribute('srcset', webpSrc);
        source.setAttribute('type', 'image/webp');
        picture.appendChild(source);
        
        // Clone current image as fallback
        const fallbackImg = img.cloneNode(true);
        fallbackImg.setAttribute('srcset', `${imgSrc} 800w`);
        picture.appendChild(fallbackImg);
        
        // Replace the original img with picture
        img.parentNode.replaceChild(picture, img);
    }
});

// Intelligent Search Functionality with scrollable container
searchBar.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    searchResults.innerHTML = '';
    currentIndex = -1; // Reset current index for keyboard navigation
    
    // Always show results - either filtered or all
    searchResults.classList.remove('hidden');
    
    // Apply max-height and make scrollable
    const maxHeight = window.innerHeight - searchResults.getBoundingClientRect().top - 20; // 20px buffer
    searchResults.style.maxHeight = `${maxHeight}px`;
    searchResults.style.overflowY = 'auto';
    
    // Create a container for results
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results-container w-full';
    
    if (query) {
        // Filter recipes based on query
        const filteredRecipes = recipes.filter(recipe => recipe.title.toLowerCase().includes(query));
        
        if (filteredRecipes.length) {
            // Show filtered recipes
            filteredRecipes.forEach((recipe, index) => {
                const div = document.createElement('div');
                // Add bottom border to all items
                div.className = 'px-4 py-2 cursor-pointer hover:bg-[#222616] flex items-center space-x-2 border-b border-[#2f3525]';
                div.setAttribute('role', 'option');
                div.setAttribute('id', `search-result-${index}`);
                div.setAttribute('aria-selected', 'false');
                div.innerHTML = `<img src="${recipe.imgSrc}" alt="${recipe.title}" class="w-5 h-5 rounded-sm"> <span class="text-off-white capitalize truncate">${recipe.title.toLowerCase()}</span>`;
                div.addEventListener('click', () => {
                    window.location.href = recipe.link;
                });
                resultsContainer.appendChild(div);
            });
        } else {
            // No matches message
            const noMatchesDiv = document.createElement('div');
            noMatchesDiv.className = 'px-4 py-3 text-off-white text-center';
            noMatchesDiv.textContent = 'No matching recipes found';
            noMatchesDiv.setAttribute('role', 'status');
            noMatchesDiv.setAttribute('aria-live', 'polite');
            resultsContainer.appendChild(noMatchesDiv);
        }
    } else {
        // No query - show all recipes
        recipes.forEach((recipe, index) => {
            const div = document.createElement('div');
            // Add bottom border to all items
            div.className = 'px-4 py-2 cursor-pointer hover:bg-[#222616] flex items-center space-x-2 border-b border-[#2f3525]';
            div.setAttribute('role', 'option');
            div.setAttribute('id', `search-result-${index}`);
            div.setAttribute('aria-selected', 'false');
            div.innerHTML = `<img src="${recipe.imgSrc}" alt="${recipe.title}" class="w-5 h-5 rounded-sm"> <span class="text-off-white capitalize truncate">${recipe.title.toLowerCase()}</span>`;
            div.addEventListener('click', () => {
                window.location.href = recipe.link;
            });
            resultsContainer.appendChild(div);
        });
        
        // Also update the page display
        // Reset pagination
        currentPage = 1;
        visibleRecipes = [];
        
        // Hide all recipes first
        allRecipes.forEach(recipe => {
            recipe.style.display = 'none';
        });
        
        // Show first page of recipes
        showRecipesForPage(1);
        
        // Reset infinite scroll
        setupInfiniteScroll();
    }
    
    // Add the results container to the dropdown
    searchResults.appendChild(resultsContainer);
});


searchBar.addEventListener('keydown', function(event) {
    const results = Array.from(searchResults.querySelectorAll('[role="option"]'));
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
        document.body.style.overflow = '';
    }
});

function updateHighlightedResult(results) {
    results.forEach((result, index) => {
        if (index === currentIndex) {
            // Apply inline style directly instead of using the bg-dark-gray class
            result.style.backgroundColor = '#222616';
            result.setAttribute('aria-selected', 'true');
        } else {
            // Remove inline style when not selected
            result.style.backgroundColor = '';
            result.setAttribute('aria-selected', 'false');
        }
    });
    
    // Ensure the selected item is visible (scroll into view if needed)
    if (currentIndex > -1 && results[currentIndex]) {
        results[currentIndex].scrollIntoView({ block: 'nearest' });
    }
}

// Focus/blur handling for search bar with scroll lock
searchBar.addEventListener('focus', function() {
    // Lock body scroll immediately on focus
    document.body.style.overflow = 'hidden';
    
    // If there's text in the search bar, show results again
    if (this.value.trim().length > 0) {
        // Re-run the input handler to show results
        this.dispatchEvent(new Event('input'));
    } else {
        // If no input yet, show all recipes (to make it faster to browse)
        const allRecipesForSearch = recipes.slice(0, 100);
        if (allRecipesForSearch.length > 0) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('hidden');
            
            // Apply max-height and make scrollable
            const maxHeight = window.innerHeight - searchResults.getBoundingClientRect().top - 20; // 20px buffer
            searchResults.style.maxHeight = `${maxHeight}px`;
            searchResults.style.overflowY = 'auto';
            
            // Create a container for results
            const resultsContainer = document.createElement('div');
            resultsContainer.className = 'search-results-container w-full';
            
            allRecipesForSearch.forEach((recipe, index) => {
                const div = document.createElement('div');
                div.className = 'px-4 py-2 cursor-pointer hover:bg-[#222616] flex items-center space-x-2 border-b border-[#2f3525]';
                div.setAttribute('role', 'option');
                div.setAttribute('id', `search-result-${index}`);
                div.setAttribute('aria-selected', 'false');
                div.innerHTML = `<img src="${recipe.imgSrc}" alt="${recipe.title}" class="w-5 h-5 rounded-sm"> <span class="text-off-white capitalize truncate">${recipe.title.toLowerCase()}</span>`;
                div.addEventListener('click', () => {
                    window.location.href = recipe.link;
                });
                resultsContainer.appendChild(div);
            });
            
            searchResults.appendChild(resultsContainer);
        }
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

// Hide search results when clicking outside
window.addEventListener('click', (event) => {
    if (!searchBar.contains(event.target) && !searchResults.contains(event.target)) {
        searchResults.classList.add('hidden');
        document.body.style.overflow = '';
    }
});
