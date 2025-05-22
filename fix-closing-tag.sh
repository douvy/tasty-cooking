#\!/bin/bash

# Fix missing closing </a> tag in all HTML files except index.html and sesame-green-beans.html
for file in *.html; do
  if [ "$file" \!= "index.html" ] && [ "$file" \!= "sesame-green-beans.html" ]; then
    # Use perl for more reliable regex handling and inline replacement
    perl -i -0pe "s|<span style=\"font-family: 'Windsor Bold', serif; position: relative; top: 2px;\" class=\"text-xl\">Tasty Cooking</span>\s*<\!-- More nav items -->|<span style=\"font-family: 'Windsor Bold', serif; position: relative; top: 2px;\" class=\"text-xl\">Tasty Cooking</span>\n                    </a>\n                    <\!-- More nav items -->|s" "$file"
    echo "Fixed $file"
  fi
done
