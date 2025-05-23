#\!/bin/bash

# Function to capitalize the first letter of each word
capitalize_words() {
    local text="$1"
    echo "$text" | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))} 1'
}

# Find all HTML files that might have ingredient sections
find /Users/Jim/Documents/GitHub/tasty-cooking -name "*.html" | while read file; do
    echo "Checking $file..."
    
    # Look for lowercase section headers in h3 tags
    lowercase_sections=$(grep -o '<h3 class="text-lg font-semibold mb-1 mt-4">[a-z][^<]*</h3>' "$file" || true)
    
    if [ -n "$lowercase_sections" ]; then
        echo "Found lowercase sections in $file:"
        echo "$lowercase_sections"
        echo "Fixing..."
        
        # Create a temporary file
        temp_file=$(mktemp)
        
        # Process the file
        while IFS= read -r line; do
            # Check if line contains a lowercase h3 header
            if [[ $line =~ \<h3\ class=\"text-lg\ font-semibold\ mb-1\ mt-4\"\>[a-z] ]]; then
                # Extract the header text
                header_text=$(echo "$line" | sed -E 's/.*<h3 class="text-lg font-semibold mb-1 mt-4">([^<]*)<\/h3>.*/\1/')
                
                # Capitalize the first letter of each word
                capitalized=$(capitalize_words "$header_text")
                
                # Replace the header in the line
                new_line=$(echo "$line" | sed -E "s/>$header_text</>$capitalized</")
                
                echo "$new_line" >> "$temp_file"
            else
                echo "$line" >> "$temp_file"
            fi
        done < "$file"
        
        # Replace the original file
        mv "$temp_file" "$file"
        echo "Fixed lowercase headers in $file"
    fi
done

echo "All files have been checked and fixed for capitalization."
