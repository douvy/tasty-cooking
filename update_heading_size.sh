#\!/bin/bash

# Find all HTML files in the repository
find /Users/Jim/Documents/GitHub/tasty-cooking -name "*.html" | while read file; do
    echo "Checking $file..."
    
    # Check if the file contains h3 headers with text-lg
    if grep -q '<h3 class="text-lg font-semibold mb-1 mt-4">' "$file"; then
        echo "Updating heading size in $file..."
        
        # Replace text-lg with text-xl in h3 tags
        sed -i.bak 's/<h3 class="text-lg font-semibold mb-1 mt-4">/<h3 class="text-xl font-semibold mb-1 mt-4">/g' "$file"
        
        # Remove backup file
        rm -f "$file.bak"
        
        echo "Updated heading size in $file"
    fi
done

echo "All files have been updated to use text-xl for ingredient section headers."
