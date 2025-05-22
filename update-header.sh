#\!/bin/bash

# Define the search pattern and replacement text
search='<div class="flex items-center text-sm text-light-grayish-orange">\s*<nav class="space-x-4 uppercase relative inline-block ml-3 sm:ml-0 text-sm">\s*<a href="index" class="hover:text-gray-300">Recipes</a>'
replace='<div class="flex items-center text-sm text-light-grayish-orange">\n                <nav class="space-x-4 relative inline-block ml-3 sm:ml-0">\n                    <a href="index" class="hover:text-gray-300 flex items-center whitespace-nowrap">\n                        <img src="assets/img/logo.png" alt="Tasty Cooking Logo" class="h-6 w-auto mr-3">\n                        <span style="font-family: '\''Windsor Bold'\'', serif; position: relative; top: 2px;" class="text-xl">Tasty Cooking</span>'

# Find all HTML files except index.html and sesame-green-beans.html
for file in *.html; do
  if [ "$file" \!= "index.html" ] && [ "$file" \!= "sesame-green-beans.html" ]; then
    # Use perl for more reliable regex handling and inline replacement
    perl -i -0pe "s|<div class=\"flex items-center text-sm text-light-grayish-orange\">\s*<nav class=\"space-x-4 uppercase relative inline-block ml-3 sm:ml-0 text-sm\">\s*<a href=\"index\" class=\"hover:text-gray-300\">Recipes</a>|<div class=\"flex items-center text-sm text-light-grayish-orange\">\n                <nav class=\"space-x-4 relative inline-block ml-3 sm:ml-0\">\n                    <a href=\"index\" class=\"hover:text-gray-300 flex items-center whitespace-nowrap\">\n                        <img src=\"assets/img/logo.png\" alt=\"Tasty Cooking Logo\" class=\"h-6 w-auto mr-3\">\n                        <span style=\"font-family: 'Windsor Bold', serif; position: relative; top: 2px;\" class=\"text-xl\">Tasty Cooking</span>|s" "$file"
    echo "Updated $file"
  fi
done
