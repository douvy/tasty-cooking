/**
 * pagination.js
 * Best-in-class pagination system for Tasty Cooking
 * Features:
 * - Efficient infinite scrolling with IntersectionObserver
 * - Smooth fade-in animations for new content
 * - Proper memory management
 * - Handling for filtering and sorting integration
 */
document.addEventListener('DOMContentLoaded', function() {
  // Configuration
  const config = {
    recipesPerPage: 12,
    observerThreshold: 0.1,
    initialDelay: 50  // Small delay for stability
  };
  
  // State management
  const state = {
    currentPage: 1,
    isLoading: false,
    observer: null,
    allRecipes: [],
    visibleRecipes: [],
    filteredRecipes: null,  // Null when no filtering active
    sortOrder: 'default'    // Current sort order
  };
  
  // DOM Elements
  const elements = {
    recipeGrid: document.getElementById('recipe-grid'),
    recipeCount: document.getElementById('recipe-count'),
    sortDropdown: document.getElementById('dropdown-menu'),
    tagsContainer: document.getElementById('selected-tags')
  };
  
  // Initialize the system
  function initialize() {
    // Get all recipe cards and store them
    state.allRecipes = Array.from(document.querySelectorAll('#recipe-grid > a'));
    
    // Store default order for sorting
    state.defaultOrder = [...state.allRecipes];
    
    // Update recipe count
    updateRecipeCount();
    
    // Set initial display state - hide all recipes
    state.allRecipes.forEach(card => {
      card.style.display = 'none';
    });
    
    // Show first page after a small delay to ensure stability
    setTimeout(() => {
      showRecipesForPage(1);
      setupInfiniteScroll();
      setupEventListeners();
    }, config.initialDelay);
  }
  
  // Show recipes for the specified page
  function showRecipesForPage(page) {
    // Determine which recipes to use (filtered or all)
    const recipesToUse = state.filteredRecipes || state.allRecipes;
    
    // Calculate start and end indices
    const startIndex = (page - 1) * config.recipesPerPage;
    const endIndex = startIndex + config.recipesPerPage;
    
    // Clear visibleRecipes if this is page 1
    if (page === 1) {
      state.visibleRecipes = [];
    }
    
    // Show recipes for current page
    for (let i = startIndex; i < endIndex && i < recipesToUse.length; i++) {
      recipesToUse[i].style.display = '';
      state.visibleRecipes.push(recipesToUse[i]);
    }
  }
  
  // Load more recipes with smooth animation
  function loadMoreRecipes() {
    if (state.isLoading) return;
    state.isLoading = true;
    
    // Determine which recipes to use
    const recipesToUse = state.filteredRecipes || state.allRecipes;
    
    // Calculate indices for next page
    const startIndex = state.currentPage * config.recipesPerPage;
    const endIndex = startIndex + config.recipesPerPage;
    const nextRecipes = [];
    
    // Prepare next batch with initial opacity
    for (let i = startIndex; i < endIndex && i < recipesToUse.length; i++) {
      const card = recipesToUse[i];
      card.classList.add('opacity-0');
      card.style.display = '';
      nextRecipes.push(card);
      state.visibleRecipes.push(card);
    }
    
    // Use setTimeout for simpler, more compatible approach
    setTimeout(() => {
      // Apply transitions
      nextRecipes.forEach(recipe => {
        recipe.classList.remove('opacity-0');
        recipe.classList.add('opacity-100', 'transition-opacity', 'duration-500');
      });
      
      // Update state
      state.currentPage++;
      state.isLoading = false;
      
      // Update infinite scroll
      if (state.observer) {
        state.observer.disconnect();
      }
      observeLastRecipe();
    }, 50);
  }
  
  // Setup infinite scroll with IntersectionObserver
  function setupInfiniteScroll() {
    // Create the observer if it doesn't exist
    if (!state.observer) {
      state.observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !state.isLoading) {
          const recipesToUse = state.filteredRecipes || state.allRecipes;
          if (state.currentPage * config.recipesPerPage < recipesToUse.length) {
            loadMoreRecipes();
          }
        }
      }, { 
        threshold: config.observerThreshold,
        rootMargin: '100px' // Load a bit before reaching the bottom
      });
    }
    
    observeLastRecipe();
  }
  
  // Observe the last visible recipe
  function observeLastRecipe() {
    if (!state.observer || state.visibleRecipes.length === 0) return;
    
    const lastRecipe = state.visibleRecipes[state.visibleRecipes.length - 1];
    if (lastRecipe) {
      state.observer.observe(lastRecipe);
    }
  }
  
  // Update the recipe count display
  function updateRecipeCount() {
    if (!elements.recipeCount) return;
    
    if (state.filteredRecipes) {
      // When filtering, show the filtered count
      elements.recipeCount.textContent = state.filteredRecipes.length;
    } else {
      // Otherwise show total count
      elements.recipeCount.textContent = state.allRecipes.length;
    }
  }
  
  // Set up event listeners for sorting and filtering
  function setupEventListeners() {
    // Listen for tag filtering events
    if (elements.tagsContainer) {
      // Create a MutationObserver to detect when tags are added or removed
      const tagObserver = new MutationObserver(() => {
        handleTagFiltering();
      });
      
      tagObserver.observe(elements.tagsContainer, { 
        childList: true,
        subtree: false 
      });
      
      // Listen for custom events from tag-filtering.js
      document.addEventListener('tagsChanged', () => {
        handleTagFiltering();
      });
    }
    
    // Handle sort changes
    if (elements.sortDropdown) {
      elements.sortDropdown.addEventListener('click', (e) => {
        if (e.target.hasAttribute('data-sort')) {
          const sortOption = e.target.getAttribute('data-sort');
          if (sortOption !== state.sortOrder) {
            // Update the sort order state
            state.sortOrder = sortOption;
            
            // Update dropdown button text
            const dropdownButton = document.getElementById('dropdown-button');
            if (dropdownButton) {
              const textSpan = dropdownButton.querySelector('span');
              if (textSpan) {
                textSpan.textContent = sortOption.charAt(0).toUpperCase() + sortOption.slice(1);
              }
            }
            
            // Update active class in dropdown items
            const allSortOptions = elements.sortDropdown.querySelectorAll('[data-sort]');
            allSortOptions.forEach(option => {
              if (option.getAttribute('data-sort') === sortOption) {
                option.classList.add('bg-[#232717]');
                option.classList.remove('hover:bg-[#252A19]');
              } else {
                option.classList.remove('bg-[#232717]');
                option.classList.add('hover:bg-[#252A19]');
              }
            });
            
            // Perform the sorting
            handleSorting(sortOption);
            
            // Close the dropdown after selection
            elements.sortDropdown.classList.add('hidden');
          } else {
            // If the same option is clicked, just close the dropdown
            elements.sortDropdown.classList.add('hidden');
          }
        }
      });
    }
  }
  
  // Filter recipes based on selected tags
  function handleTagFiltering() {
    // Get selected tags using the data-tag attribute (more reliable than text content)
    const selectedTagElements = elements.tagsContainer.querySelectorAll('span');
    const selectedTags = Array.from(selectedTagElements).map(tag => 
      tag.getAttribute('data-tag').toLowerCase()
    );
    
    // Hide all recipes first
    state.allRecipes.forEach(recipe => {
      recipe.style.display = 'none';
    });
    
    if (selectedTags.length === 0) {
      // No filters active - return to default pagination view
      state.filteredRecipes = null;
      state.currentPage = 1;
      state.visibleRecipes = [];
      
      showRecipesForPage(1);
      setupInfiniteScroll();
      
      // Make sure to update the recipe count when all filters are removed
      updateRecipeCount();
    } else {
      console.log('Filtering by tags:', selectedTags);
      
      // Apply filters
      state.filteredRecipes = state.allRecipes.filter(recipe => {
        const recipeTags = recipe.getAttribute('data-tags').split(' ');
        const result = selectedTags.every(tag => recipeTags.includes(tag));
        return result;
      });
      
      console.log('Found matching recipes:', state.filteredRecipes.length);
      
      // Reset pagination
      state.currentPage = 1;
      state.visibleRecipes = [];
      
      // Show all filtered recipes
      state.filteredRecipes.forEach(recipe => {
        recipe.style.display = '';
        state.visibleRecipes.push(recipe);
      });
      
      // Update count and handle empty results
      updateRecipeCount();
      handleNoResults();
    }
  }
  
  // Show or hide "no results" message
  function handleNoResults() {
    let noResultsMsg = document.getElementById('no-results-message');
    
    if (state.filteredRecipes && state.filteredRecipes.length === 0) {
      // Show "no results" message
      if (!noResultsMsg) {
        noResultsMsg = document.createElement('div');
        noResultsMsg.id = 'no-results-message';
        noResultsMsg.className = 'absolute inset-0 flex flex-col items-center text-center text-off-white w-full';
        noResultsMsg.style.paddingTop = '100px'; // Position higher on the screen
        noResultsMsg.innerHTML = '<div class="max-w-xl mx-auto px-4"><p class="text-2xl sm:text-3xl font-windsor-bold">No matching recipes</p><p class="mt-2 text-lg sm:text-xl">Try removing some tags</p></div>';
        elements.recipeGrid.appendChild(noResultsMsg);
      } else {
        noResultsMsg.style.display = '';
      }
    } else if (noResultsMsg) {
      // Hide "no results" message
      noResultsMsg.style.display = 'none';
    }
  }
  
  // Handle sorting recipes
  function handleSorting(sortOption) {
    // Determine which recipes to sort
    const recipesToSort = state.filteredRecipes || state.allRecipes;
    
    // Sort the recipes
    if (sortOption === 'alphabetical') {
      recipesToSort.sort((a, b) => {
        const titleA = a.querySelector('.recipe-title').textContent.trim().toLowerCase();
        const titleB = b.querySelector('.recipe-title').textContent.trim().toLowerCase();
        return titleA.localeCompare(titleB);
      });
      
      // For debugging
      console.log('Sorted alphabetically:', recipesToSort.map(r => r.querySelector('.recipe-title').textContent.trim()));
    } else {
      // Default order (restore original order)
      const defaultOrderMap = new Map();
      state.defaultOrder.forEach((card, index) => {
        defaultOrderMap.set(card, index);
      });
      
      recipesToSort.sort((a, b) => {
        return defaultOrderMap.get(a) - defaultOrderMap.get(b);
      });
      
      // For debugging
      console.log('Restored to default order');
    }
    
    // Reset pagination
    state.currentPage = 1;
    state.visibleRecipes = [];
    
    // Hide all recipes
    state.allRecipes.forEach(recipe => {
      recipe.style.display = 'none';
    });
    
    // Reorder DOM elements to match the sorted array
    const recipeGrid = document.getElementById('recipe-grid');
    if (recipeGrid) {
      // Remove all recipe cards from the DOM
      const fragment = document.createDocumentFragment();
      
      // Add them back in the sorted order
      recipesToSort.forEach(recipe => {
        fragment.appendChild(recipe);
      });
      
      // Re-append all recipes in their new order
      recipeGrid.appendChild(fragment);
    }
    
    if (state.filteredRecipes) {
      // When filtering, show all filtered recipes
      state.filteredRecipes.forEach(recipe => {
        recipe.style.display = '';
        state.visibleRecipes.push(recipe);
      });
    } else {
      // Otherwise show first page with pagination
      showRecipesForPage(1);
      setupInfiniteScroll();
    }
  }
  
  // Initialize the system
  initialize();
});