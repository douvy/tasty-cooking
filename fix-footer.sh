#\!/bin/bash

# This script fixes the footer indentation in all recipe HTML files

# Find all HTML files except index.html and sesame-green-beans.html
recipe_files=$(find /Users/Jim/Documents/GitHub/tasty-cooking -name "*.html" \! -path "*/sesame-green-beans.html" \! -path "*/index.html")

# Process each recipe file
for file in $recipe_files; do
  echo "Fixing footer in $file..."
  
  # Use sed to fix the specific indentation issue
  sed -i '' 's/<li class="inline-block pt-2 pb-2 ml-auto">/<                li class="inline-block pt-2 pb-2 ml-auto">/g' "$file"
  
  echo "Footer fixed in $file"
done

echo "All footers have been fixed\!"
