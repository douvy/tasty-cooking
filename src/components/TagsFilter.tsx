import React, { useState, useRef, useEffect } from 'react';
import { getTagDisplayName } from '@/lib/tags';

interface TagsFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TagsFilter: React.FC<TagsFilterProps> = ({ selectedTags, onTagsChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const availableTags = [
    'breakfast',
    'condiments',
    'gluten-free',
    'healthy',
    'meat',
    'quick',
    'seafood',
    'spicy',
    'vegan',
    'vegetable',
    'vegetarian'
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };
  
  const closeOnEsc = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="relative inline-block">
      <div className="relative text-left">
        <div>
          <button 
            id="tags-dropdown-button" 
            ref={buttonRef}
            className={`dropdown-button inline-flex justify-center items-center rounded-full px-4 py-2 bg-[#2e3523] text-base font-medium text-off-white hover:bg-[#323927] focus:bg-[#323927] transition-colors duration-200 ${isDropdownOpen ? 'ring-1 ring-[#8B9168]' : ''}`} 
            aria-haspopup="true" 
            aria-expanded={isDropdownOpen ? "true" : "false"} 
            aria-controls="tags-dropdown-menu"
            onClick={toggleDropdown}
            onKeyDown={closeOnEsc}
          >
            <span className="mr-1">Tags</span>
            <svg className="h-5 w-5 text-off-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
        
        {isDropdownOpen && (
          <div 
            id="tags-dropdown-menu" 
            ref={dropdownRef}
            className="tags-dropdown-menu origin-top-right absolute right-0 mt-2 w-56 rounded-3xl shadow-lg bg-[#2A2F1E] border border-[#3a4228] focus:outline-none z-50 overflow-hidden"
          >
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="tags-options-menu">
              {availableTags.map((tag) => (
                <button 
                  key={tag}
                  className={`w-full text-left px-4 py-2.5 text-base text-off-white ${
                    selectedTags.includes(tag) ? 'bg-[#232717]' : 'hover:bg-[#252A19]'
                  } transition-colors duration-200 focus:outline-none`}
                  role="menuitem" 
                  data-tag={tag}
                  onClick={() => handleTagClick(tag)}
                  onMouseDown={(e) => e.preventDefault()} /* Prevent focus */
                >
                  {getTagDisplayName(tag)}
                  {selectedTags.includes(tag) && (
                    <span className="float-right text-[#8B9168]">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Selected tags removed from here - now handled in RecipeGrid component */}
    </div>
  );
};

export default TagsFilter;