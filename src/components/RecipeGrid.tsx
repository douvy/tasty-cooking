import React, { useEffect, useState, useRef, useCallback } from 'react';
import RecipeCard from './RecipeCard';
import TagsFilter from './TagsFilter';
import SortDropdown from './SortDropdown';
import { Recipe } from '@/types';
import { getSearchService } from '@/lib/search-service';

interface RecipeGridProps {
  initialRecipes?: Recipe[];
}

const RecipeGrid: React.FC<RecipeGridProps> = ({ initialRecipes = [] }) => {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(initialRecipes);
  const [loading, setLoading] = useState(initialRecipes.length === 0);
  const [visibleRecipes, setVisibleRecipes] = useState<Recipe[]>(initialRecipes.slice(0, 12));
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'default' | 'alphabetical'>('default');
  const [defaultOrder, setDefaultOrder] = useState<Record<string, number>>(() => {
    // Initialize with initial recipes if available
    const orderMap: Record<string, number> = {};
    initialRecipes.forEach((recipe, index) => {
      orderMap[recipe.link] = index;
    });
    return orderMap;
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const observerTarget = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const recipesPerPage = 12;

  // Load recipes on component mount
  useEffect(() => {
    // If we already have initial recipes from SSR/SSG, we're ready to go
    if (initialRecipes.length > 0) {
      
      // Initialize search service with our MDX recipes
      const searchService = getSearchService();
      
      // Store default order (already done in state initializer)
      setRecipes(initialRecipes);
      setFilteredRecipes(initialRecipes);
      setLoading(false);
      
      // Load first page
      setVisibleRecipes(initialRecipes.slice(0, recipesPerPage));
      return;
    }
    
    // Otherwise load recipes from search service (should only happen if no MDX recipes)
    const searchService = getSearchService();
    
    if (!searchService.isLoaded()) {
      searchService.loadRecipes().then(recipes => {
        // Store default order
        const orderMap: Record<string, number> = {};
        recipes.forEach((recipe, index) => {
          orderMap[recipe.link] = index;
        });
        setDefaultOrder(orderMap);
        
        setRecipes(recipes);
        setFilteredRecipes(recipes);
        setLoading(false);
        
        // Load first page
        setVisibleRecipes(recipes.slice(0, recipesPerPage));
      });
    } else {
      const allRecipes = searchService.getAllRecipes();
      
      // Store default order
      const orderMap: Record<string, number> = {};
      allRecipes.forEach((recipe, index) => {
        orderMap[recipe.link] = index;
      });
      setDefaultOrder(orderMap);
      
      setRecipes(allRecipes);
      setFilteredRecipes(allRecipes);
      setLoading(false);
      
      // Load first page
      setVisibleRecipes(allRecipes.slice(0, recipesPerPage));
    }
  }, [initialRecipes]);
  
  // Load more recipes for infinite scroll
  const loadMoreRecipes = useCallback(() => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    // Use setTimeout to simulate a network request and add a slight delay
    setTimeout(() => {
      const startIndex = currentPage * recipesPerPage;
      const endIndex = startIndex + recipesPerPage;
      const nextBatch = filteredRecipes.slice(startIndex, endIndex);
      
      if (nextBatch.length > 0) {
        // New recipes to add with opacity data
        const newRecipes = nextBatch.map(recipe => ({
          ...recipe,
          newlyLoaded: true // Mark as newly loaded for opacity effect
        }));
        
        // Update visible recipes
        setVisibleRecipes(prev => [...prev, ...newRecipes]);
        setCurrentPage(prev => prev + 1);
        
        // Remove the newlyLoaded flag after animation completes
        setTimeout(() => {
          setVisibleRecipes(prev => 
            prev.map(recipe => ({
              ...recipe,
              newlyLoaded: false
            }))
          );
        }, 1000);
      }
      
      setIsLoadingMore(false);
    }, 250); // Small delay before loading more
  }, [currentPage, filteredRecipes, isLoadingMore]);
  
  // Set up infinite scrolling
  useEffect(() => {
    if (loading) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        // Only trigger when scrolling down and we have more recipes to load
        if (entries[0].isIntersecting && 
            visibleRecipes.length < filteredRecipes.length && 
            !isLoadingMore) {
          loadMoreRecipes();
        }
      },
      { 
        threshold: 0.1,       // Trigger when 10% of the element is visible
        rootMargin: '500px',  // Start loading before the element is visible (increased for better preloading)
        root: null            // Use viewport as root
      }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loading, visibleRecipes, filteredRecipes, isLoadingMore, loadMoreRecipes]);
  
  // Handle tag changes
  useEffect(() => {
    if (loading) return;
    
    // Use our already loaded recipes as the base
    let filtered = [...recipes];
    
    // Apply tag filtering
    if (selectedTags.length > 0) {
      filtered = filtered.filter(recipe => {
        // Normalize both selectedTags and recipe.tags for case-insensitive comparison
        const normalizedSelectedTags = selectedTags.map(tag => tag.toLowerCase());
        const normalizedRecipeTags = recipe.tags.map(tag => 
          typeof tag === 'string' ? tag.toLowerCase() : tag
        );
        
        return normalizedSelectedTags.every(tag => normalizedRecipeTags.includes(tag));
      });
    }
    
    // Apply sorting
    if (sortOrder === 'alphabetical') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }
    
    setFilteredRecipes(filtered);
    setCurrentPage(1);
    
    // Reset to initial page with smooth transition
    const initialRecipes = filtered.slice(0, recipesPerPage).map(recipe => ({
      ...recipe,
      newlyLoaded: false
    }));
    
    setVisibleRecipes(initialRecipes);
  }, [selectedTags, sortOrder, loading, defaultOrder]);
  
  // Handle tag selection
  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
  };
  
  // Handle sort change
  const handleSortChange = (order: 'default' | 'alphabetical') => {
    setSortOrder(order);
  };
  
  return (
    <section className="py-5 sm:py-6 mt-0 min-h-[90vh]">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap mb-2 sm:mb-3">
          <div className="w-1/2 flex">
            <h2 className="text-off-white text-2xl font-windsor-bold tracking-wide mt-1.5 sm:mt-[1px]">
              <span id="recipe-count">{filteredRecipes.length}</span>&nbsp;Recipes
            </h2>
          </div>
          <div className="w-1/2 flex items-start sm:-mt-1 justify-end space-x-2 sm:space-x-3">
            {/* Filters */}
            <TagsFilter 
              selectedTags={selectedTags}
              onTagsChange={handleTagsChange}
            />
            
            {/* Sort */}
            <SortDropdown 
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
            />
          </div>
        </div>
        
        {/* Selected tags display */}
        {selectedTags.length > 0 && (
          <div id="selected-tags-container" className="flex flex-wrap items-center mb-5 mt-1 order-3 w-full">
            {selectedTags.map(tag => (
              <span 
                key={tag}
                data-tag={tag}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-base font-medium bg-[#2e3523] text-off-white mr-2 mb-2 cursor-pointer hover:bg-[#323927] transition-colors duration-200 focus:outline-none"
                onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                onMouseDown={(e) => e.preventDefault()} /* Prevent focus */
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' ')} 
                <button 
                  className="ml-1.5 text-[#8B9168] hover:text-off-white focus:outline-none" 
                  aria-label={`Remove ${tag} filter`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTags(selectedTags.filter(t => t !== tag));
                  }}
                  onMouseDown={(e) => e.preventDefault()} /* Prevent focus */
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        
        {/* Recipe Grid */}
        <div 
          id="recipe-grid" 
          ref={gridRef}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 mt-4 sm:mt-4 mb-8"
        >
          {loading ? (
            // Loading placeholders
            Array(6).fill(0).map((_, index) => (
              <div key={index} className="bg-[#2A2F1E] rounded-3xl overflow-hidden shadow-lg relative h-48 sm:h-64 animate-pulse"></div>
            ))
          ) : visibleRecipes.length > 0 ? (
            // Render recipes with opacity for newly loaded items
            visibleRecipes.map((recipe, index) => (
              <RecipeCard 
                key={`${recipe.link}-${index}`}
                recipe={recipe}
                className="recipe-card"
                style={{ 
                  opacity: (recipe as any).newlyLoaded ? 0.65 : 1,
                  transition: 'opacity 1000ms ease-in-out'
                }}
                index={index}
              />
            ))
          ) : (
            // No results message
            <div className="col-span-2 lg:col-span-3 flex flex-col items-center justify-center text-center text-off-white py-16">
              <p className="text-2xl sm:text-3xl font-windsor-bold">No matching recipes</p>
              <p className="mt-2 text-lg sm:text-xl">Try removing some tags</p>
            </div>
          )}
        </div>
        
        {/* Subtle loading indicator for infinite scroll */}
        {isLoadingMore && (
          <div className="flex justify-center -mt-4 mb-8 opacity-60">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent border-[#8B9168] animate-spin"></div>
          </div>
        )}
        
        {/* Invisible observer target for infinite scrolling - positioned better */}
        {!loading && visibleRecipes.length > 0 && visibleRecipes.length < filteredRecipes.length && (
          <div ref={observerTarget} className="h-32 w-full -mt-24" aria-hidden="true" />
        )}
      </div>
    </section>
  );
};

export default RecipeGrid;