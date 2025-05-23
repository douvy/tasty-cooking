#!/bin/bash

# List of pages to fix
pages=(
  "roasted-cauliflower.html"
  "roasted-broccolini.html" 
  "roasted-sweet-potato-salad.html"
  "romesco.html"
  "spaghetti-pomodoro.html"
)

# Reference page with correct structure
REFERENCE_PAGE="sesame-green-beans.html"

# Function to fix a single file
fix_file() {
  local file=$1
  echo "Processing $file"
  
  # Extract title and content from the target file
  local title=$(grep -o '<h1 class="text-black text-xl font-bold"[^>]*>.*</h1>' "$file" | sed -E 's/<h1 class="text-black text-xl font-bold"[^>]*>(.*)<\/h1>/\1/')
  local description=$(grep -o '<p class="leading-7">.*</p>' "$file" | sed -E 's/<p class="leading-7">(.*)<\/p>/\1/')
  local recipe_content=$(sed -n '/<section class="bg-light-grayish-orange/,/<footer class=/p' "$file")
  
  # Create temp file
  local temp_file=$(mktemp)
  
  # 1. Copy head section from the target file
  sed -n '1,/<body>/p' "$file" > "$temp_file"
  
  # 2. Copy the modern header from reference file
  sed -n '/<body>/,/<section class="relative/p' "$REFERENCE_PAGE" | tail -n +2 >> "$temp_file"
  
  # 3. Add the hero section with correct image path
  local image_path=$(grep -o '<img src="[^"]*"' "$file" | head -1 | sed -E 's/<img src="([^"]*)"/\1/')
  echo "<section class=\"relative -mt-0 pt-0\">" >> "$temp_file"
  echo "    <img src=\"$image_path\" alt=\"$title\" class=\"w-full h-96 object-cover\">" >> "$temp_file"
  echo "    <div class=\"absolute bottom-0 left-0 right-0\">" >> "$temp_file"
  echo "        <div class=\"container mx-auto px-4\">" >> "$temp_file"
  echo "            <div class=\"bg-light-grayish-orange mb-5 inline-block pb-5 pt-5 px-6 py-2 border-dark-brown-all\">" >> "$temp_file"
  echo "                <h1 class=\"text-black text-xl font-bold\">$title</h1>" >> "$temp_file"
  echo "            </div>" >> "$temp_file"
  echo "        </div>" >> "$temp_file"
  echo "    </div>" >> "$temp_file"
  echo "</section>" >> "$temp_file"
  
  # 4. Add the description section with proper structure
  echo "" >> "$temp_file"
  echo "<section class=\"py-8 pt-6 mt-0 sm:mt-0\">" >> "$temp_file"
  echo "    <div class=\"container mx-auto px-4\">" >> "$temp_file"
  
  # Extract and add the time and servings
  local time_servings=$(sed -n '/<div class="flex items-center justify-start space-x-4 mb-2">/,/<div class="mb-3 flex flex-wrap gap-2">/p' "$file")
  echo "$time_servings" >> "$temp_file"
  
  # Extract and add the tags
  local tags=$(sed -n '/<div class="mb-3 flex flex-wrap gap-2">/,/<div class="max-w-3xl text-light-gray">/p' "$file")
  echo "$tags" >> "$temp_file"
  
  # Add the description
  echo "            <div class=\"max-w-3xl text-light-gray\">" >> "$temp_file"
  echo "                <p class=\"leading-7\">$description</p>" >> "$temp_file"
  echo "            </div>" >> "$temp_file"
  echo "        </div>" >> "$temp_file"
  echo "    </section>" >> "$temp_file"
  echo "" >> "$temp_file"
  
  # 5. Add the ingredients and instructions sections
  echo "$recipe_content" | sed 's/py-8 px-4/py-8/g' | sed 's/<div class="container mx-auto">/<div class="container mx-auto px-4">/g' >> "$temp_file"
  
  # 6. Add the modern footer
  sed -n '/<footer class/,/<script src="js\/recipe-search.js"><\/script>/p' "$REFERENCE_PAGE" >> "$temp_file"
  
  # 7. Add any modal content if it exists
  if grep -q "id=\"myModal\"" "$file"; then
    sed -n '/<div id="myModal"/,/<script src="js\/mobile.js">/p' "$file" >> "$temp_file"
  fi
  
  # 8. Close the HTML
  echo "</body>" >> "$temp_file"
  echo "</html>" >> "$temp_file"
  
  # Test if the temp file looks correct
  local lines_original=$(wc -l < "$file")
  local lines_new=$(wc -l < "$temp_file")
  
  # Ensure the new file is not too small (at least 75% of original)
  if [ "$lines_new" -gt $(($lines_original * 3 / 4)) ]; then
    echo "File $file: original had $lines_original lines, new has $lines_new lines"
    # Make backup
    cp "$file" "${file}.bak"
    # Replace with fixed version
    cp "$temp_file" "$file"
    echo "✅ Successfully updated $file (backup saved as ${file}.bak)"
  else
    echo "⚠️ WARNING: Not replacing $file as the new version seems too small ($lines_new lines vs $lines_original)"
    # Save the temp file for inspection
    cp "$temp_file" "${file}.new"
    echo "   Problematic output saved to ${file}.new for inspection"
  fi
  
  # Clean up
  rm "$temp_file"
}

# Make the script more robust
set -e
echo "📋 Starting fix for specific pages..."
echo "🔍 Using $REFERENCE_PAGE as reference for structure"
echo ""

# Process each file
for page in "${pages[@]}"; do
  if [ -f "$page" ]; then
    fix_file "$page"
  else
    echo "⚠️ Warning: $page not found in current directory"
  fi
done

echo ""
echo "✨ Finished processing all specified pages"
