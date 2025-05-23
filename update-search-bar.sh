#\!/bin/bash

# Loop through all HTML files (excluding index.html)
for file in $(find . -name "*.html" -not -name "index.html"); do
  echo "Updating search bar in $file"
  
  # Use sed to replace the search icon and search bar styling
  sed -i '' '
    # Update the search icon class and color
    s/<i class="fas fa-search text-darker-gray"><\/i>/<i class="far fa-search text-white fa-sm"><\/i>/g
    
    # Update the search bar background color
    s/class="w-full md:w-64 pl-10 pr-4 py-2 rounded-sm bg-black text-white placeholder-gray-50 focus:outline-none focus:ring-0 focus:border-none"/class="w-full md:w-64 pl-10 pr-4 py-2 rounded-sm bg-\[#33353c\] text-white placeholder-gray-50 focus:outline-none focus:ring-0 focus:border-none"/g
  ' "$file"
done

echo "Search bar update complete"
