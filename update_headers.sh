#\!/bin/bash

# The new header code we want to apply to all recipe pages
NEW_HEADER='    <\!-- Header -->
    <div class="container-fluid border-divider-b z-30 bg-black bg-opacity-80 absolute top-0 left-0 right-0">
        <header class="container mx-auto flex flex-wrap items-center p-4 px-4">
            <\!-- Logo and Navigation - Mobile version -->
            <div class="flex items-center justify-between text-sm md:hidden w-full" style="margin-bottom: 1.1rem;">
                <a href="index" class="hover:text-gray-300 flex items-center whitespace-nowrap">
                    <img src="assets/img/logo.png" alt="Tasty Cooking Logo" class="h-6 w-auto mr-3">
                    <span class="font-cheee-wowie text-xl text-[#e2ded8]">Tasty Cooking</span>
                </a>
            </div>'

# Get all HTML files except index.html and sesame-green-beans.html
HTML_FILES=$(find /Users/Jim/Documents/GitHub/tasty-cooking -name "*.html" | grep -v "index.html\|sesame-green-beans.html")

# Process each file
for file in $HTML_FILES; do
  echo "Processing $file..."
  
  # Use sed to replace the old header section with the new one
  sed -i '' -e '/<body>/,/<div class="flex items-center justify-between text-sm md:hidden">/c\
<body>\
'"$NEW_HEADER" "$file"
done

echo "Header update complete\!"
