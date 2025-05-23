#\!/bin/bash

# List of files to update
files=(
    "/Users/Jim/Documents/GitHub/tasty-cooking/honey-butter-pancakes.html"
    "/Users/Jim/Documents/GitHub/tasty-cooking/chimichurri.html"
    "/Users/Jim/Documents/GitHub/tasty-cooking/tomato-confit.html"
    "/Users/Jim/Documents/GitHub/tasty-cooking/soffrito.html"
    "/Users/Jim/Documents/GitHub/tasty-cooking/roasted-chicken.html"
    "/Users/Jim/Documents/GitHub/tasty-cooking/mojo-de-ajo.html"
    "/Users/Jim/Documents/GitHub/tasty-cooking/romesco.html"
    "/Users/Jim/Documents/GitHub/tasty-cooking/garlic-confit.html"
    "/Users/Jim/Documents/GitHub/tasty-cooking/grilled-buffalo-wings.html"
    "/Users/Jim/Documents/GitHub/tasty-cooking/pomodoro-sauce.html"
    "/Users/Jim/Documents/GitHub/tasty-cooking/california-za'atar.html"
)

# Loop through each file
for file in "${files[@]}"; do
    echo "Fixing $file..."
    
    # Fix the incorrect closing tag
    sed -i.bak 's/<h2 class="text-3xl font-bold mb-3" style="text-transform: none \!important;">Ingredients<\/h3>/<h2 class="text-3xl font-bold mb-3" style="text-transform: none \!important;">Ingredients<\/h2>/g' "$file"
    
    # Capitalize first letter of the section headers
    if grep -q '<h3 class="text-lg font-semibold mb-1">makes' "$file"; then
        sed -i.bak 's/<h3 class="text-lg font-semibold mb-1">makes/<h3 class="text-lg font-semibold mb-1">Makes/g' "$file"
    fi
    
    # Remove backup files
    rm -f "$file.bak"
    
    echo "Fixed $file"
done

echo "All files have been fixed."
