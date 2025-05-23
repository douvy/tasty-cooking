#\!/bin/bash

# This script updates all recipe HTML files to match the structure of sesame-green-beans.html
# But preserves the footer to avoid breaking pages

# Find all HTML files except index.html and sesame-green-beans.html
recipe_files=$(find . -name "*.html" -not -path "./index.html" -not -path "./sesame-green-beans.html")

# Process each recipe file
for file in $recipe_files; do
  echo "Processing $file..."
  
  # Update header structure
  sed -i '' 's/<header class="absolute top-0 left-0 w-full z-30 bg-black bg-opacity-50">/<div class="container-fluid border-divider-b z-30 bg-black bg-opacity-80 absolute top-0 left-0 right-0">/g' "$file"
  sed -i '' 's/<div class="container mx-auto flex justify-between items-center p-4 sm:pl-0 sm:pr-0">/<header class="container mx-auto flex flex-wrap items-center p-4 px-4">/g' "$file"
  
  # Update navigation and search structure
  sed -i '' '/<div class="flex items-center text-sm text-light-grayish-orange">/,/<\/div>/c\
            <\!-- Logo and Navigation - Mobile version -->\
            <div class="flex items-center justify-between text-sm md:hidden">\
                <\!-- Spacer div to push navigation to the edge -->\
                <div class="flex-grow"></div>\
            </div>\
            \
            <\!-- Logo and Navigation - Desktop version -->\
            <div class="hidden md:block md:flex-none md:mr-auto">\
                <a href="index" class="hover:text-gray-300 flex items-center whitespace-nowrap">\
                    <img src="assets/img/logo.png" alt="Tasty Cooking Logo" class="h-6 w-auto mr-3">\
                    <span class="font-cheee-wowie text-xl text-[#e2ded8]">Tasty Cooking</span>\
                </a>\
            </div>' "$file"
  
  # Update Connect Button to Search
  sed -i '' '/<div class="ml-auto inline-block uppercase text-sm text-light-grayish-orange">/,/<\/div>/c\
            <\!-- Search -->\
            <div class="flex justify-center w-full -ml-2 sm:ml-0 md:flex md:w-auto md:ml-auto md:mr-4" id="search">\
                <div class="mx-auto text-base relative z-10 w-full sm:w-11/12">\
                    <div class="relative">\
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3">\
                            <i class="fas fa-search text-darker-gray"></i>\
                        </span>\
                        <input type="text" placeholder="Search recipes" class="w-full md:w-64 pl-10 pr-4 py-2 rounded-sm bg-black text-white placeholder-gray-50 focus:outline-none focus:ring-0 focus:border-none" id="search-bar" autocomplete="off">\
                    </div>\
                    <div id="search-results" class="absolute left-0 w-full bg-black text-white mt-1 rounded-sm shadow-lg z-50 hidden">\
                        <\!-- Dynamic search results will be displayed here -->\
                    </div>\
                </div>\
            </div>' "$file"
  
  # Close header properly
  sed -i '' 's/<\/header>/<\/header>\n    <\/div>/g' "$file"
  
  # Update hero section
  sed -i '' 's/<section class="relative">/<section class="relative -mt-0 pt-0">/g' "$file"
  
  # Update hero content structure with container
  sed -i '' '/<div class="absolute bottom-0 left-0 bg-light-grayish-orange mb-5 ml-4 sm:ml-16 pb-5 pt-5 px-6 py-2 border-dark-brown-all">/c\
        <div class="absolute bottom-0 left-0 right-0">\
            <div class="container mx-auto px-4">\
                <div class="bg-light-grayish-orange mb-5 inline-block pb-5 pt-5 px-6 py-2 border-dark-brown-all">' "$file"
  
  # Add closing divs after h1
  sed -i '' 's/<\/h1>/<\/h1>\n                <\/div>\n            <\/div>\n        <\/div>/g' "$file"
  
  # Update description section padding
  sed -i '' 's/<section class="py-8 px-4">/<section class="py-8 pt-6 mt-0 sm:mt-0">/g' "$file"
  
  # Update container with px-4 padding
  sed -i '' 's/<div class="container mx-auto">/<div class="container mx-auto px-4">/g' "$file"
  
  # Update ingredients section
  sed -i '' 's/<section class="bg-light-grayish-orange text-black py-8 px-4">/<section class="bg-light-grayish-orange text-black py-8">/g' "$file"
  
  # Update instructions section
  sed -i '' 's/<section class="py-8 px-4 mb-2">/<section class="py-8 mb-2">/g' "$file"
  
  # Update footer padding but preserve structure
  sed -i '' 's/<div class="container mx-auto flex items-center justify-between px-4 sm:pl-4 sm:pr-0">/<div class="container mx-auto flex items-center justify-between px-4">/g' "$file"
  
  # Update JavaScript reference
  sed -i '' 's/<script src="js\/mobile.js"><\/script>/<script src="js\/recipe-search.js"><\/script>/g' "$file"
  
  echo "Completed updating $file"
done

echo "All recipe files have been updated safely\!"
