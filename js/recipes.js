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

// Disable autocomplete for the search bar
searchBar.setAttribute('autocomplete', 'off');

// Save the default order of the cards and their titles
document.querySelectorAll('#recipe-grid .block').forEach(card => {
    defaultOrder.push(card);
    recipes.push({
        title: card.querySelector('.recipe-title').innerText,
        element: card,
        link: card.getAttribute('href'),
        imgSrc: card.querySelector('img').src
    });
});

// Function to update recipe count
function updateRecipeCount() {
    const count = document.querySelectorAll('#recipe-grid > a:not([style*="display: none"])').length;
    recipeCount.textContent = count;
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
        if (event.target.classList.contains('bg-gray')) {
            event.target.classList.remove('bg-gray', 'text-white');
            removeTagLabel(tag);
        } else {
            event.target.classList.add('bg-gray', 'text-white');
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
    tagLabel.className = 'inline-flex items-center px-3 py-1 rounded-sm text-xs bg-gray capitalize text-light-green mr-2 cursor-pointer hover:bg-light-gray';
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
        tagLabel.querySelector('i').classList.add('text-white');
    });

    tagLabel.addEventListener('mouseout', function() {
        tagLabel.querySelector('i').classList.remove('text-white');
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
            element.classList.remove('bg-gray', 'text-white');
        }
    });
}

// Function to filter recipes based on tags
function filterRecipes() {
    const selectedTags = Array.from(selectedTagsContainer.children).map(tag => tag.textContent.trim().split(' ')[0]);
    const recipes = document.querySelectorAll('#recipe-grid > a');

    recipes.forEach(recipe => {
        const recipeTags = recipe.getAttribute('data-tags').split(' ');
        if (selectedTags.every(tag => recipeTags.includes(tag))) {
            recipe.style.display = '';
        } else {
            recipe.style.display = 'none';
        }
    });

    updateRecipeCount();
}

// Handle sort selection
document.querySelectorAll('[data-sort]').forEach(function(element) {
    element.addEventListener('click', function(event) {
        event.preventDefault();
        const sortOption = event.target.getAttribute('data-sort');

        // Remove active class from all sort options
        document.querySelectorAll('[data-sort]').forEach(el => el.classList.remove('bg-gray', 'text-white'));

        // Add active class to the selected sort option
        event.target.classList.add('bg-gray', 'text-white');

        // Sort recipes based on the selected sort type
        const recipes = Array.from(document.querySelectorAll('#recipe-grid > a'));
        const recipeGrid = document.getElementById('recipe-grid');

        if (sortOption === 'alphabetical') {
            recipes.sort((a, b) => a.querySelector('.recipe-title').textContent.localeCompare(b.querySelector('.recipe-title').textContent));
        } else {
            // Restore to the initial order
            recipes.sort((a, b) => defaultOrder.indexOf(a) - defaultOrder.indexOf(b));
        }

        // Clear current recipes and append sorted ones
        recipeGrid.innerHTML = '';
        recipes.forEach(recipe => recipeGrid.appendChild(recipe));

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

// Mobile menu functionality
const mobileMenuButton = document.getElementById('mobile-menu-button');
const closeMenuButton = document.getElementById('close-mobile-menu');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuButton && mobileMenu && closeMenuButton) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.remove('hidden');
        document.body.classList.add('overflow-hidden'); // Prevent scrolling when menu is open
    });

    closeMenuButton.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    });

    // Handle mobile menu category links
    document.querySelectorAll('#mobile-menu a[data-tag]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tag = link.getAttribute('data-tag');
            
            // Close mobile menu
            mobileMenu.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
            
            // Clear existing tags
            selectedTagsContainer.innerHTML = '';
            
            // Reset all tag buttons in dropdown
            document.querySelectorAll('[data-tag]').forEach(el => {
                el.classList.remove('bg-gray', 'text-white');
            });
            
            // Find and activate the tag in the dropdown
            document.querySelectorAll(`[data-tag="${tag}"]`).forEach(el => {
                el.classList.add('bg-gray', 'text-white');
            });
            
            // Add the tag label
            addTagLabel(tag);
            
            // Filter recipes
            filterRecipes();
            
            // Scroll to recipes section
            window.scrollTo({
                top: document.querySelector('#recipe-grid').offsetTop - 100,
                behavior: 'smooth'
            });
        });
    });
}

// Add lazy loading, WebP support, and responsiveness to all recipe images
document.querySelectorAll('#recipe-grid img').forEach(img => {
    img.setAttribute('loading', 'lazy');
    
    // Add sizes attribute for responsive loading
    img.setAttribute('sizes', '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw');
    
    // Add WebP support with picture element
    const imgSrc = img.getAttribute('src');
    if (imgSrc && !img.parentNode.tagName.toLowerCase() === 'picture') {
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

// Intelligent Search Functionality
searchBar.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    searchResults.innerHTML = '';
    currentIndex = -1; // Reset current index for keyboard navigation
    if (query) {
        const filteredRecipes = recipes.filter(recipe => recipe.title.toLowerCase().includes(query));
        if (filteredRecipes.length) {
            searchResults.classList.remove('hidden');
            filteredRecipes.forEach(recipe => {
                const div = document.createElement('div');
                div.className = 'px-4 py-2 cursor-pointer hover:bg-gray flex items-center space-x-2 border-b border-dark-gray-all';
                div.innerHTML = `<img src="${recipe.imgSrc}" alt="${recipe.title}" class="w-5 h-5 rounded-sm"> <span class="text-gray capitalize truncate">${recipe.title.toLowerCase()}</span>`;
                div.addEventListener('click', () => {
                    window.location.href = recipe.link;
                });
                searchResults.appendChild(div);
            });
        } else {
            searchResults.classList.add('hidden');
        }
    } else {
        searchResults.classList.add('hidden');
        defaultOrder.forEach(card => recipeGrid.appendChild(card));
        updateRecipeCount();
    }
});

// Save Recipe Functionality
class RecipeSaver {
    constructor() {
        this.savedRecipes = this.getSavedRecipes();
        this.setupSaveButtons();
        this.renderSavedStatus();
    }

    // Get saved recipes from localStorage
    getSavedRecipes() {
        const saved = localStorage.getItem('savedRecipes');
        return saved ? JSON.parse(saved) : [];
    }

    // Save recipes to localStorage
    saveRecipes() {
        localStorage.setItem('savedRecipes', JSON.stringify(this.savedRecipes));
    }

    // Toggle save status for a recipe
    toggleSave(recipeUrl, recipeTitle, recipeImage) {
        const index = this.savedRecipes.findIndex(r => r.url === recipeUrl);
        
        if (index === -1) {
            // Add to saved recipes
            this.savedRecipes.push({
                url: recipeUrl,
                title: recipeTitle,
                image: recipeImage,
                dateSaved: new Date().toISOString()
            });
        } else {
            // Remove from saved recipes
            this.savedRecipes.splice(index, 1);
        }
        
        // Update localStorage
        this.saveRecipes();
        
        // Update UI
        this.renderSavedStatus();
        
        return index === -1; // Return true if saved, false if removed
    }

    // Check if a recipe is saved
    isSaved(recipeUrl) {
        return this.savedRecipes.some(recipe => recipe.url === recipeUrl);
    }

    // Setup save buttons on recipe pages
    setupSaveButtons() {
        // Add save button to recipe pages
        if (document.querySelector('body > section > img')) {
            // This is a recipe page
            const recipeTitle = document.querySelector('h1').textContent;
            const recipeImage = document.querySelector('section > img').src;
            const recipeUrl = window.location.pathname;
            
            // Create save button
            const saveButton = document.createElement('button');
            saveButton.className = 'save-recipe-btn fixed top-16 right-4 bg-black bg-opacity-75 p-2 rounded-full z-40 focus:outline-none focus:ring-2 focus:ring-light-green';
            saveButton.setAttribute('aria-label', this.isSaved(recipeUrl) ? 'Remove from saved recipes' : 'Save recipe');
            
            saveButton.innerHTML = this.isSaved(recipeUrl) 
                ? '<i class="fas fa-bookmark text-light-green fa-lg"></i>' 
                : '<i class="far fa-bookmark text-light-green fa-lg"></i>';
            
            // Add click event
            saveButton.addEventListener('click', () => {
                const isSaved = this.toggleSave(recipeUrl, recipeTitle, recipeImage);
                
                // Update button appearance
                saveButton.innerHTML = isSaved 
                    ? '<i class="fas fa-bookmark text-light-green fa-lg"></i>' 
                    : '<i class="far fa-bookmark text-light-green fa-lg"></i>';
                
                saveButton.setAttribute('aria-label', isSaved ? 'Remove from saved recipes' : 'Save recipe');
                
                // Show toast notification
                this.showToast(isSaved ? 'Recipe saved!' : 'Recipe removed');
            });
            
            // Add to DOM
            document.body.appendChild(saveButton);
        }
    }

    // Add save buttons to recipe cards on homepage
    renderSavedStatus() {
        // Add saved indicators to recipe cards on homepage
        document.querySelectorAll('#recipe-grid > a').forEach(card => {
            const recipeUrl = card.getAttribute('href');
            const isSaved = this.isSaved(recipeUrl);
            
            // Remove existing saved indicator if any
            const existingIndicator = card.querySelector('.saved-indicator');
            if (existingIndicator) {
                existingIndicator.remove();
            }
            
            // Add saved indicator if recipe is saved
            if (isSaved) {
                const indicator = document.createElement('div');
                indicator.className = 'saved-indicator absolute top-2 right-2 bg-black bg-opacity-75 p-1 rounded-full z-10';
                indicator.innerHTML = '<i class="fas fa-bookmark text-light-green"></i>';
                card.appendChild(indicator);
            }
        });
    }

    // Show toast notification
    showToast(message) {
        // Remove existing toast if any
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = 'toast-notification fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-light-green text-black px-4 py-2 rounded-sm z-50 transition-opacity duration-300';
        toast.textContent = message;
        
        // Add to DOM
        document.body.appendChild(toast);
        
        // Remove after 2 seconds
        setTimeout(() => {
            toast.classList.add('opacity-0');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 2000);
    }
}

// Initialize recipe saver when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RecipeSaver();
});

searchBar.addEventListener('keydown', function(event) {
    const results = Array.from(searchResults.children);
    if (event.key === 'ArrowDown') {
        if (currentIndex < results.length - 1) {
            currentIndex++;
            updateHighlightedResult(results);
        }
    } else if (event.key === 'ArrowUp') {
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
        searchBar.classList.remove('bg-dark-gray');
    }
});

function updateHighlightedResult(results) {
    results.forEach((result, index) => {
        if (index === currentIndex) {
            result.classList.add('bg-dark-gray');
        } else {
            result.classList.remove('bg-dark-gray');
        }
    });
}

// Change search bar background on focus
searchBar.addEventListener('focus', function() {
    searchBar.classList.add('bg-gray');
});

searchBar.addEventListener('blur', function() {
    searchBar.classList.remove('bg-dark-gray');
});

// Hide search results when clicking outside
window.addEventListener('click', (event) => {
    if (!searchBar.contains(event.target) && !searchResults.contains(event.target)) {
        searchResults.classList.add('hidden');
        searchBar.classList.remove('bg-dark-gray');
    }
});
