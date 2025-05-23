#\!/bin/bash

# Script to update tag styles across all recipe pages

echo "Updating tag styles in all recipe HTML files..."

# Find all HTML files except index.html and cucumber-salad.html (which is already updated)
find . -name "*.html" -not -name "index.html" -not -name "cucumber-salad.html" | while read file; do
  echo "Processing $file"
  
  # First update the container div - remove gap-2 class
  sed -i '' 's/<div class="mb-4 flex flex-wrap gap-2">/<div class="mb-4 flex flex-wrap">/g' "$file"
  
  # Then update all the tag spans with the new styling
  sed -i '' 's/<span class="bg-\[#33353c\] text-white px-2 py-1 rounded-sm text-sm">/<span class="inline-flex items-center px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-sm text-sm font-medium bg-\[#33353c\] capitalize text-white mr-3 sm:mr-4 mb-1 mt-2 cursor-pointer hover:bg-\[#3b3d44\]">/g' "$file"
done

echo "All tag styles updated successfully\!"
