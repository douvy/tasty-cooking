#\!/bin/bash

# Find all HTML files and update tag styling
for file in *.html; do
  # Skip index.html as it's not a recipe page
  if [ "$file" \!= "index.html" ]; then
    echo "Processing $file..."
    # Replace bg-gray text-light-grayish-orange with bg-[#33353c] text-white
    sed -i '' 's/class="bg-gray text-light-grayish-orange/class="bg-[#33353c] text-white/g' "$file"
  fi
done

echo "All tags updated successfully\!"
