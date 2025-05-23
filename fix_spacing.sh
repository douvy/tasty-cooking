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
    "/Users/Jim/Documents/GitHub/tasty-cooking/cajun-honey-butter-salmon.html"
    "/Users/Jim/Documents/GitHub/tasty-cooking/nashville-hot-chicken.html"
    "/Users/Jim/Documents/GitHub/tasty-cooking/cucumber-salad.html"
)

# Loop through each file
for file in "${files[@]}"; do
    echo "Fixing spacing in $file..."
    
    # Add mt-4 class to all h3 tags for proper spacing
    sed -i.bak 's/<h3 class="text-lg font-semibold mb-1">/<h3 class="text-lg font-semibold mb-1 mt-4">/g' "$file"
    
    # Make sure all lists have mb-4 for proper spacing
    sed -i.bak 's/<ul class="list-disc pl-6 leading-8">/<ul class="list-disc pl-6 leading-8 mb-4">/g' "$file"
    
    # Remove backup files
    rm -f "$file.bak"
    
    echo "Fixed spacing in $file"
done

echo "All files have been updated with proper spacing."
