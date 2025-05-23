// Search functionality for recipe pages
document.addEventListener('DOMContentLoaded', function() {
    console.log("Recipe search script loaded");
    
    // Variables for search functionality
    const searchBar = document.getElementById('search-bar');
    const searchResults = document.getElementById('search-results');
    
    console.log("Search bar element:", searchBar);
    console.log("Search results element:", searchResults);
    
    if (!searchBar || !searchResults) {
        console.error("Critical search elements not found on page");
        return;
    }
    
    let recipes = [
        { title: "Sesame Green Beans", link: "sesame-green-beans", img: "assets/img/sesame-green-beans.jpg" },
        { title: "Guacamole", link: "guacamole", img: "assets/img/guacamole.jpg" },
        { title: "Roasted Cauliflower", link: "roasted-cauliflower", img: "assets/img/roasted-cauliflower.jpg" },
        { title: "Roasted Broccolini", link: "roasted-broccolini", img: "assets/img/grilled-broccolini.jpg" },
        { title: "Nashville Hot Chicken", link: "nashville-hot-chicken", img: "assets/img/nashville-chicken.jpg" },
        { title: "Honey Butter Pancakes", link: "honey-butter-pancakes", img: "assets/img/pancakes.jpg" },
        { title: "Charred Brussels Sprouts", link: "charred-brussels-sprouts", img: "assets/img/charred-brussels-sprouts.jpg" },
        { title: "Cajun Honey-Butter Salmon", link: "cajun-honey-butter-salmon", img: "assets/img/cajun-salmon.jpg" },
        { title: "Roasted Chicken", link: "roasted-chicken", img: "assets/img/roasted-chicken.jpg" },
        { title: "Black Bean Avocado Wraps", link: "avocado-wraps", img: "assets/img/black-bean-avocado-wraps.jpg" },
        { title: "Sesame Orange Chicken", link: "sesame-orange-chicken", img: "assets/img/spicy-orange-sesame-chicken.jpg" },
        { title: "Japanese Tebasaki Wings", link: "japanese-tebasaki-wings", img: "assets/img/japanese-wings.jpg" },
        { title: "Pineapple Ginger Smoothie", link: "pineapple-ginger-smoothie", img: "assets/img/pineapple-ginger-smoothie.jpg" },
        { title: "Salsa", link: "salsa", img: "assets/img/salsa.jpg" },
        { title: "Roasted Sweet Potato Salad", link: "roasted-sweet-potato-salad", img: "assets/img/roasted-sweet-potato-salad.jpg" },
        { title: "Crispy Baked Falafels", link: "falafels", img: "assets/img/falafals.jpg" },
        { title: "Spicy Kimchi Broccoli Rabe", link: "spicy-kimchi-broccoli-rabe", img: "assets/img/spicy-kimchi-broccoli-rabe.jpg" },
        { title: "California Za'atar", link: "california-za'atar", img: "assets/img/za'atar.jpg" },
        { title: "Soffrito", link: "soffrito", img: "assets/img/soffrito.jpg" },
        { title: "Chimichurri", link: "chimichurri", img: "assets/img/chimichurri.jpg" },
        { title: "Mojo de Ajo", link: "mojo-de-ajo", img: "assets/img/mojo-de-ajo.jpg" },
        { title: "Romesco", link: "romesco", img: "assets/img/romesco.jpg" },
        { title: "Rice & Black Bean Quesadillas", link: "quesadillas", img: "assets/img/quesadillas.jpg" },
        { title: "White Bean Wraps w/ Cucumber & Mint", link: "white-bean-wraps", img: "assets/img/white-bean-wraps.jpg" },
        { title: "Garlic Confit", link: "garlic-confit", img: "assets/img/garlic-confit.jpg" },
        { title: "Pineapple Kimchi", link: "pineapple-kimchi", img: "assets/img/pineapple-kimchi.jpg" },
        { title: "Pomodoro Sauce", link: "pomodoro-sauce", img: "assets/img/pomodoro.jpg" },
        { title: "Spaghetti Pomodoro", link: "spaghetti-pomodoro", img: "assets/img/spaghetti-pomodoro.jpg" },
        { title: "Grilled Buffalo Wings", link: "grilled-buffalo-wings", img: "assets/img/grilled-buffalo-wings.jpg" },
        { title: "Cucumber Salad", link: "cucumber-salad", img: "assets/img/cucumber-salad.jpg" },
        { title: "Sweet Potato Cakes", link: "sweet-potato-cakes", img: "assets/img/sweet-potato-cakes.jpg" },
        { title: "Leek Fritters", link: "leek-fritters", img: "assets/img/leek-fritters.jpg" }
    ];
    
    let currentIndex = -1;

    // Disable autocomplete for the search bar
    searchBar.setAttribute('autocomplete', 'off');
    
    // Add event listener for input
    searchBar.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        console.log("Search query:", query);
        
        // Clear previous results
        searchResults.innerHTML = '';
        currentIndex = -1;
        
        if (query.length > 0) {
            // Filter recipes based on query
            const filteredRecipes = recipes.filter(recipe => 
                recipe.title.toLowerCase().includes(query)
            );
            
            console.log("Filtered recipes:", filteredRecipes);
            
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
                    div.className = 'px-4 py-2 cursor-pointer hover:bg-[#1b1c21] flex items-center space-x-2 border-b border-[#34373d] w-full';
                    div.innerHTML = `
                        <img src="${recipe.img}" alt="${recipe.title}" class="w-5 h-5 rounded-sm object-cover"> 
                        <span class="text-white capitalize truncate">${recipe.title.toLowerCase()}</span>
                    `;
                    div.addEventListener('click', () => {
                        window.location.href = recipe.link;
                    });
                    searchResults.appendChild(div);
                });
            } else {
                // Hide search results if no matches
                searchResults.classList.add('hidden');
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
                result.classList.add('bg-gray-700');
            } else {
                result.classList.remove('bg-gray-700');
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