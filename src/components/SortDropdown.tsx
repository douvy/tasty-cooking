import React, { useState, useRef, useEffect } from 'react';

interface SortDropdownProps {
  sortOrder: 'default' | 'alphabetical';
  onSortChange: (order: 'default' | 'alphabetical') => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ sortOrder, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };
  
  const handleSortChange = (newSort: 'default' | 'alphabetical') => {
    if (sortOrder !== newSort) {
      onSortChange(newSort);
    }
    setIsOpen(false);
  };
  
  const closeOnEsc = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left hidden sm:inline-block">
      <div>
        <button 
          id="dropdown-button" 
          ref={buttonRef}
          className={`dropdown-button inline-flex justify-center items-center rounded-full px-4 py-2 bg-[#2e3523] text-base font-medium text-off-white hover:bg-[#323927] focus:bg-[#323927] transition-colors duration-200 ${isOpen ? 'ring-1 ring-[#8B9168]' : ''}`} 
          aria-haspopup="true" 
          aria-expanded={isOpen ? "true" : "false"} 
          aria-controls="dropdown-menu"
          onClick={toggleDropdown}
          onKeyDown={closeOnEsc}
        >
          <span className="mr-1">Sort: {sortOrder.charAt(0).toUpperCase() + sortOrder.slice(1)}</span>
          <svg className="h-5 w-5 text-off-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>
      {isOpen && (
        <div 
          id="dropdown-menu" 
          ref={dropdownRef}
          className="sort-dropdown-menu origin-top-right absolute right-0 mt-2 w-56 rounded-3xl shadow-lg bg-[#2A2F1E] border border-[#3a4228] focus:outline-none z-50 overflow-hidden"
        >
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <button 
              className={`w-full text-left px-4 py-2.5 text-base text-off-white ${sortOrder === 'default' ? 'bg-[#232717]' : 'hover:bg-[#252A19]'} transition-colors duration-200 focus:outline-none`} 
              role="menuitem" 
              data-sort="default"
              onClick={() => handleSortChange('default')}
              onMouseDown={(e) => e.preventDefault()} /* Prevent focus */
            >
              Default
              {sortOrder === 'default' && (
                <span className="float-right text-[#8B9168]">✓</span>
              )}
            </button>
            <button 
              className={`w-full text-left px-4 py-2.5 text-base text-off-white ${sortOrder === 'alphabetical' ? 'bg-[#232717]' : 'hover:bg-[#252A19]'} transition-colors duration-200 focus:outline-none`} 
              role="menuitem" 
              data-sort="alphabetical"
              onClick={() => handleSortChange('alphabetical')}
              onMouseDown={(e) => e.preventDefault()} /* Prevent focus */
            >
              Alphabetical
              {sortOrder === 'alphabetical' && (
                <span className="float-right text-[#8B9168]">✓</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;