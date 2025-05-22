#\!/bin/bash

# New footer content from index.html
NEW_FOOTER='<footer class="bg-[#0a0b0d] w-full border-t border-dark-gray-top z-50 pt-3 pb-3">
        <div class="container mx-auto flex items-center justify-between px-4 sm:pl-4 sm:pr-0">
            <ul class="text-xs font-normal text-gray-400 flex items-center gap-3">
                <li class="inline-block mr-2 pt-2 pb-2">
                    <a href="index" rel="noopener noreferrer" class="text-lg font-windsor-bold">Home</a>
                </li>
            </ul>
        </div>
    </footer>'

# Get all HTML files except index.html
find . -name "*.html" -not -name "index.html" | while read file; do
  echo "Updating footer in $file"
  
  # Use perl to replace the footer section
  perl -i -0pe 's/<footer.*?<\/footer>/$ENV{NEW_FOOTER}/s' "$file"
done

echo "Footer updated in all HTML files"
