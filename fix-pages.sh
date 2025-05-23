#\!/bin/bash

# List of pages to fix
pages=(
  "/Users/Jim/Documents/GitHub/tasty-cooking/roasted-cauliflower.html"
  "/Users/Jim/Documents/GitHub/tasty-cooking/roasted-broccolini.html"
  "/Users/Jim/Documents/GitHub/tasty-cooking/roasted-sweet-potato-salad.html"
  "/Users/Jim/Documents/GitHub/tasty-cooking/romesco.html"
  "/Users/Jim/Documents/GitHub/tasty-cooking/spaghetti-pomodoro.html"
)

for page in "${pages[@]}"; do
  echo "Fixing $page..."
  
  # Create a temporary file
  tmp_file=$(mktemp)
  
  # Extract content up to the end of the footer
  awk '/<footer/,/<\/footer>/ {print} /<\/footer>/ {found=1; print ""; print "<script src=\"js/recipe-search.js\"></script>"; print "</body>"; print "</html>"; exit} \!found {print}' "$page" > "$tmp_file"
  
  # Replace the original file with the fixed one
  mv "$tmp_file" "$page"
  
  echo "Fixed $page"
done

echo "All specified pages have been fixed\!"
