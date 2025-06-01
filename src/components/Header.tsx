import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Recipe } from '@/types';
import { getSearchService, debounce } from '@/lib/search-service';
import { BLUR_DATA_URL } from '@/lib/constants';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchBarRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Check if on mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', debounce(checkMobile, 150));
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Close dropdown when clicking outside
  // Mobile search functionality
  useEffect(() => {
    if (showMobileSearch && !searchQuery.trim()) {
      // Preload all recipes when mobile search opens with empty query
      const searchService = getSearchService();
      setSearchResults(searchService.getAllRecipes());
    }
  }, [showMobileSearch, searchQuery]);

  // Handle click outside search results and lock body scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Skip if clicked element is a button with class containing 'search'
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' && 
          (target.className.includes('search') || target.innerText === 'Clear search')) {
        return;
      }
      
      if (
        searchBarRef.current && 
        !searchBarRef.current.contains(event.target as Node) &&
        searchResultsRef.current && 
        !searchResultsRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    
    // Lock body scroll when search results are shown
    if (showResults && !isMobile) {
      document.body.style.overflow = 'hidden';
    } else if (!showMobileSearch) {
      document.body.style.overflow = '';
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [showResults, showMobileSearch, isMobile]);
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowResults(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        Math.min(prev + 1, searchResults.length - 1)
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => 
        Math.max(prev - 1, -1)
      );
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        router.push(`/${searchResults[selectedIndex].link}`);
        setShowResults(false);
      }
    }
  };
  
  const debouncedSearch = debounce((query: string) => {
    const searchService = getSearchService();
    
    if (!query.trim()) {
      // When query is empty, show all recipes instead of empty results
      const allRecipes = searchService.getAllRecipes();
      setSearchResults(allRecipes);
      setIsSearching(false);
      return;
    }
    
    if (!searchService.isLoaded()) {
      setIsSearching(true);
      // Load recipes then search
      searchService.loadRecipes().then(() => {
        const results = searchService.search(query);
        setSearchResults(results);
        setIsSearching(false);
      });
    } else {
      // Already loaded, search immediately
      const results = searchService.search(query);
      setSearchResults(results);
      setIsSearching(false);
    }
  }, 250);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(true);
    debouncedSearch(query);
  };
  
  const handleSearchFocus = () => {
    setShowResults(true);
    const searchService = getSearchService();
    
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    } else {
      // Always show all recipes when search field is initially focused with no query
      setSearchResults(searchService.getAllRecipes());
    }
  };
  
  // Check if we're on a recipe page
  const isRecipePage = router.pathname === '/[slug]';
  
  return (
    <>
      <div className={`container-fluid border-divider-b ${isRecipePage ? 'absolute' : 'sticky'} top-0 left-0 w-full z-30 bg-primary`}>
        <header className="container mx-auto flex items-center p-4 px-4">
          {/* Logo and Navigation - Desktop version */}
          <div className="flex-none mr-auto flex items-center space-x-4">
            <Link href="/" className="hover:text-gray-300 flex items-center whitespace-nowrap">
              <Image 
                src="/assets/img/logo.png" 
                alt="Tasty Cooking Logo" 
                width={28} 
                height={28} 
                className="h-7 w-auto mr-2" 
                sizes="28px"
                priority
              />
              <span className="font-windsor-bold text-2xl text-off-white h-7">tasty cooking</span>
            </Link>
            {/* Development links removed */}
          </div>
          
          {/* Search */}
          <div className="flex-none ml-auto" id="search">
            {isMobile ? (
              <div>
                <button 
                  id="mobile-search-button" 
                  className="w-[45px] h-[45px] bg-[#2e3523] rounded-full flex items-center justify-center ml-3"
                  aria-label="Search recipes"
                  onClick={() => setShowMobileSearch(true)}
                >
                  <i className="far fa-search text-[#f2ede4] fa-sm"></i>
                </button>
              </div>
            ) : (
              <div className="text-base relative z-50 w-full">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <i className="far fa-search text-[#f2ede4] fa-sm"></i>
                  </span>
                  <input
                    type="text"
                    placeholder="Search recipes"
                    className="w-full md:w-[360px] pl-10 pr-4 py-2.5 rounded-full cursor-pointer hover:bg-[#323927] bg-[#2e3523] hover:bg-[#323927] text-off-white placeholder:text-[#aab49a] focus:outline-none focus:ring-2 focus:ring-[#d7e0cd] focus:border-none transition-colors duration-200"
                    id="search-bar"
                    autoComplete="off"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={handleSearchFocus}
                    onKeyDown={handleKeyDown}
                    ref={searchBarRef}
                  />
                </div>
                {showResults && (
                  <div
                    id="search-results"
                    className="absolute left-0 w-full md:w-[360px] bg-[#2A2F1E] text-off-white mt-2 rounded-3xl shadow-lg border border-[#3a4228] overflow-hidden z-50"
                    style={{
                      maxHeight: '70vh',
                      overflowY: 'auto'
                    }}
                    ref={searchResultsRef}
                    role="listbox"
                    aria-label="Search results"
                    onClick={(e) => e.stopPropagation()} // Prevent click events from bubbling up
                    onMouseDown={(e) => e.stopPropagation()} // Prevent mousedown events from bubbling up
                  >
                    <div className="py-1">
                      {isSearching ? (
                        <div className="px-4 py-3 text-off-white text-center">Loading recipes...</div>
                      ) : searchQuery.trim() === '' || searchResults.length > 0 ? (
                        searchResults.map((recipe, index) => (
                          <div
                            key={recipe.link}
                            className={`px-4 py-2 cursor-pointer search-result-item flex items-center space-x-3 hover:bg-[#232717] transition-colors duration-150 ${index === selectedIndex ? 'bg-[#232717]' : ''}`}
                            onClick={() => {
                              router.push(`/${recipe.link}`);
                              setShowResults(false);
                            }}
                            role="option"
                            aria-selected={index === selectedIndex}
                          >
                            <div className="w-8 h-8 rounded-full relative overflow-hidden flex-shrink-0">
                              <Image
                                src={recipe.img?.startsWith('/') ? recipe.img : `/${recipe.img}`}
                                alt=""
                                width={32}
                                height={32}
                                sizes="32px"
                                className="object-cover w-full h-full"
                                placeholder="blur"
                                blurDataURL={BLUR_DATA_URL}
                                loading="lazy"
                              />
                            </div>
                            <span className="text-off-white truncate text-base font-medium">{recipe.title}</span>
                          </div>
                        ))
                      ) : (
                        <div 
                          className="px-4 py-6 flex flex-col items-center justify-center space-y-4"
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <p className="text-off-white text-xl font-medium">No recipes found</p>
                          <button
                            id="clear-search-button"
                            className="px-4 py-2 bg-button hover:bg-button/90 text-white transition-colors duration-200 rounded-3xl text-base font-medium"
                            onClick={(e) => {
                              // Prevent any default behavior or event propagation
                              e.preventDefault();
                              e.stopPropagation();
                              
                              // Clear the search query
                              setSearchQuery('');
                              // Set loading state to false
                              setIsSearching(false);
                              // Get all recipes 
                              const searchService = getSearchService();
                              const allRecipes = searchService.getAllRecipes();
                              // Update the search results with all recipes
                              setSearchResults(allRecipes);
                              // Keep the search results visible
                              setShowResults(true);
                              
                              // Use a setTimeout to ensure the focus action comes after state updates
                              setTimeout(() => {
                                // Focus back on the search bar
                                if (searchBarRef.current) {
                                  searchBarRef.current.focus();
                                }
                                
                                // Make a second setTimeout to ensure the results stay visible
                                setTimeout(() => {
                                  setShowResults(true);
                                }, 100);
                              }, 0);
                            }}
                            onMouseDown={(e) => {
                              // Prevent the mousedown event from bubbling up
                              e.stopPropagation();
                            }}
                          >
                            Clear search
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>
      </div>
      
      {/* Mobile Search Modal */}
      {isMobile && showMobileSearch && (
        <div
          id="search-modal"
          className="fixed inset-0 bg-[#3f4427] z-50 flex flex-col"
          style={{ height: '100%', transform: 'translateY(0)' }}
        >
          <div className="bg-[#3f4427] border-b border-[#2f3525] p-4 flex items-center">
            <button
              className="text-off-white mr-4"
              onClick={() => setShowMobileSearch(false)}
              aria-label="Close search"
            >
              <i className="far fa-long-arrow-left text-xl"></i>
            </button>
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                <i className="far fa-search text-[#f2ede4] fa-sm"></i>
              </span>
              <input
                id="modal-search-input"
                type="text"
                placeholder="Search recipes"
                className="w-full bg-[#2e3523] cursor-pointer hover:bg-[#323927] text-off-white placeholder:text-[#8B9168] rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-[#8B9168] focus:border-none transition-colors duration-200"
                autoComplete="off"
                value={searchQuery}
                onChange={handleSearchChange}
                autoFocus
              />
            </div>
          </div>
          <div
            id="modal-search-results"
            className="flex-1 overflow-y-auto bg-[#2A2F1E]"
          >
            {isSearching ? (
              <div className="px-4 py-3 text-off-white text-center">Loading recipes...</div>
            ) : searchQuery.trim() === '' || searchResults.length > 0 ? (
              searchResults.map((recipe) => (
                <div
                  key={recipe.link}
                  className="px-4 py-3 cursor-pointer flex items-center space-x-3 border-b border-[#2f3525] hover:bg-[#232717] transition-colors duration-200"
                  onClick={() => {
                    router.push(`/${recipe.link}`);
                    setShowMobileSearch(false);
                  }}
                >
                  <div className="w-10 h-10 rounded-full relative overflow-hidden flex-shrink-0">
                    <Image
                      src={recipe.img?.startsWith('/') ? recipe.img : `/${recipe.img}`}
                      alt=""
                      width={40}
                      height={40}
                      sizes="40px"
                      className="object-cover w-full h-full"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      loading="lazy"
                    />
                  </div>
                  <span className="text-off-white text-base font-medium">{recipe.title}</span>
                </div>
              ))
            ) : (
              <div 
                className="px-4 py-8 flex flex-col items-center justify-center space-y-4"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <p className="text-off-white text-xl font-medium">No recipes found</p>
                <button
                  id="mobile-clear-search-button"
                  className="px-4 py-2 bg-button hover:bg-button/90 text-white transition-colors duration-200 rounded-3xl text-base font-medium"
                  onClick={(e) => {
                    // Prevent any default behavior or event propagation
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Clear the search query
                    setSearchQuery('');
                    // Set loading state to false
                    setIsSearching(false);
                    // Get all recipes 
                    const searchService = getSearchService();
                    const allRecipes = searchService.getAllRecipes();
                    // Update the search results with all recipes
                    setSearchResults(allRecipes);
                    // Keep mobile search open
                    setShowMobileSearch(true);
                    
                    // Ensure the state update is applied
                    setTimeout(() => {
                      setShowMobileSearch(true);
                    }, 100);
                  }}
                  onMouseDown={(e) => {
                    // Prevent the mousedown event from bubbling up
                    e.stopPropagation();
                  }}
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;