#\!/bin/bash

# List of pages to fix
pages=(
  "roasted-cauliflower.html"
  "roasted-broccolini.html" 
  "roasted-sweet-potato-salad.html"
  "romesco.html"
  "spaghetti-pomodoro.html"
)

# Function to fix a single file
fix_file() {
  local file=$1
  echo "Processing $file"
  
  # Create temp file
  local temp_file=$(mktemp)
  
  # Copy everything up to the closing footer tag
  sed -n '1,/<\/footer>/p' "$file" > "$temp_file"
  
  # Add proper script reference and closing tags
  echo "" >> "$temp_file"
  echo "<script src=\"js/recipe-search.js\"></script>" >> "$temp_file"
  echo "</body>" >> "$temp_file"
  echo "" >> "$temp_file"
  echo "</html>" >> "$temp_file"
  
  # Test if the temp file looks correct
  local lines_original=$(wc -l < "$file")
  local lines_new=$(wc -l < "$temp_file")
  
  # Ensure the new file is not too small
  if [ "$lines_new" -gt 100 ]; then
    echo "File $file: original had $lines_original lines, new has $lines_new lines"
    # Only replace if the line count seems reasonable
    cp "$temp_file" "$file"
    echo "Successfully updated $file"
  else
    echo "ERROR: Not replacing $file as the new version is too small ($lines_new lines)"
  fi
  
  # Clean up
  rm "$temp_file"
}

# Process each file
for page in "${pages[@]}"; do
  fix_file "/Users/Jim/Documents/GitHub/tasty-cooking/$page"
done

echo "Finished processing all specified pages"
