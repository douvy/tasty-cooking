/**
 * tag-filtering.js
 * Handles tag filtering interactions for the Tasty Cooking website
 * - Tag dropdown toggling
 * - Tag selection and removal
 * - Dropdown visibility management
 * - Tag UI interactions
 */
document.addEventListener('DOMContentLoaded', function() {
  // Toggle dropdowns
  document.getElementById('tags-dropdown-button')?.addEventListener('click', function(e) {
    e.stopPropagation();
    document.getElementById('tags-dropdown-menu')?.classList.toggle('hidden');
  });
  
  document.getElementById('dropdown-button')?.addEventListener('click', function(e) {
    e.stopPropagation();
    document.getElementById('dropdown-menu')?.classList.toggle('hidden');
  });
  
  // Handle tag selection
  const tagsDropdownMenu = document.getElementById('tags-dropdown-menu');
  if (tagsDropdownMenu) {
    tagsDropdownMenu.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent closing the dropdown
      
      const tagLink = e.target.closest('[data-tag]');
      if (tagLink) {
        const tagName = tagLink.getAttribute('data-tag');
        const tagText = tagLink.textContent.trim();
        
        // Check if tag is already selected
        const selectedTagsContainer = document.getElementById('selected-tags');
        const existingTags = Array.from(selectedTagsContainer.querySelectorAll('span')).map(tag => 
          tag.getAttribute('data-tag')
        );
        
        if (existingTags.includes(tagName)) {
          // Tag already selected, remove it
          const tagToRemove = selectedTagsContainer.querySelector(`span[data-tag="${tagName}"]`);
          if (tagToRemove) {
            selectedTagsContainer.removeChild(tagToRemove);
            // Remove active class from dropdown item
            tagLink.classList.remove('bg-[#232717]');
            tagLink.classList.add('hover:bg-[#252A19]');
            
            // Check if this was the last tag and trigger tag filtering
            if (selectedTagsContainer.querySelectorAll('span').length === 0) {
              // Trigger a custom event that pagination.js will listen for
              document.dispatchEvent(new CustomEvent('tagsChanged'));
            }
          }
        } else {
          // Add the tag
          const newTag = document.createElement('span');
          newTag.className = 'inline-flex items-center px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-sm text-sm font-medium bg-[#2e3523] capitalize text-off-white mr-3 mb-3 cursor-pointer';
          newTag.setAttribute('data-tag', tagName);
          newTag.innerHTML = `${tagText} <button class="ml-1.5 text-off-white hover:text-white" aria-label="Remove ${tagText} filter">&times;</button>`;
          
          // Make the entire tag clickable
          newTag.addEventListener('click', function() {
            selectedTagsContainer.removeChild(newTag);
            // Also remove active class from dropdown item
            const dropdownItem = document.querySelector(`#tags-dropdown-menu [data-tag="${tagName}"]`);
            if (dropdownItem) {
              dropdownItem.classList.remove('bg-[#232717]');
              dropdownItem.classList.add('hover:bg-[#252A19]');
            }
            
            // Check if this was the last tag and trigger tag filtering
            if (selectedTagsContainer.querySelectorAll('span').length === 0) {
              // Trigger a custom event that pagination.js will listen for
              document.dispatchEvent(new CustomEvent('tagsChanged'));
            }
          });
          
          selectedTagsContainer.appendChild(newTag);
          
          // Add active class to dropdown item
          tagLink.classList.add('bg-[#232717]');
          tagLink.classList.remove('hover:bg-[#252A19]');
        }
      }
    });
  }
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', function(e) {
    // Don't close tags dropdown if clicking inside it or on a selected tag
    if (!e.target.closest('#tags-dropdown-menu') && 
        !e.target.closest('#tags-dropdown-button') && 
        !e.target.closest('#selected-tags')) {
      document.getElementById('tags-dropdown-menu')?.classList.add('hidden');
    }
    
    // Always close sort dropdown when clicking outside
    if (!e.target.closest('#dropdown-menu') && !e.target.closest('#dropdown-button')) {
      document.getElementById('dropdown-menu')?.classList.add('hidden');
    }
  });
});