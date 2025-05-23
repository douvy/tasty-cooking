#\!/bin/bash

# Loop through all HTML files (excluding index.html)
for file in $(find . -name "*.html" -not -name "index.html"); do
  echo "Checking $file"
  
  # Check if the file contains the exact pattern we want to replace
  if grep -q 'id="search-results" class="absolute left-0 w-full bg-black text-white' "$file"; then
    echo "Updating search dropdown in $file"
    # Use sed to replace the search dropdown background color
    sed -i '' 's/id="search-results" class="absolute left-0 w-full bg-black text-white/id="search-results" class="absolute left-0 w-full bg-\[#1e2025\] text-white/g' "$file"
  fi
done

echo "Search dropdown update complete"
