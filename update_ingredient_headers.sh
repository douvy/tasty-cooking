#\!/bin/bash

# Function to capitalize first letter of each word
capitalize_words() {
    echo "$1" | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)} 1'
}

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
    echo "Processing $file..."
    
    # Use sed to transform each file
    sed -i.bak 's/<h2 class="text-lg font-bold mt-5 uppercase">/<h3 class="text-lg font-semibold mb-1">/g' "$file"
    sed -i.bak 's/<\/h2>/<\/h3>/g' "$file"
    
    # Update list spacing for better separation
    sed -i.bak 's/<ul class="list-disc pl-6 leading-8">/<ul class="list-disc pl-6 leading-8 mb-4">/g' "$file"
    
    # Remove backup files
    rm -f "$file.bak"
    
    echo "Updated $file"
done

echo "All files have been updated."
