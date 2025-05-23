#\!/bin/bash

# This script updates just the footer in all recipe HTML files to match sesame-green-beans.html

# Get the footer from sesame-green-beans.html
FOOTER_HTML=$(sed -n '/<footer class="bg-/,/<\/footer>/p' /Users/Jim/Documents/GitHub/tasty-cooking/sesame-green-beans.html)

# Find all HTML files except index.html and sesame-green-beans.html
recipe_files=$(find /Users/Jim/Documents/GitHub/tasty-cooking -name "*.html" \! -path "*/sesame-green-beans.html" \! -path "*/index.html")

# Process each recipe file
for file in $recipe_files; do
  echo "Updating footer in $file..."
  
  # Create a temporary file
  tmp_file=$(mktemp)
  
  # Replace the footer section
  awk -v footer="$FOOTER_HTML" '
  BEGIN { footer_found = 0; }
  /<footer class="bg-/ { 
    footer_found = 1; 
    print footer; 
    next; 
  }
  footer_found && /<\/footer>/ { 
    footer_found = 0; 
    next; 
  }
  \!footer_found { print $0; }
  ' "$file" > "$tmp_file"
  
  # Replace the original file with the modified one
  mv "$tmp_file" "$file"
  
  echo "Footer updated in $file"
done

echo "All footers have been updated\!"
