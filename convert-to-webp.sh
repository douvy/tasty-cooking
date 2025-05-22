#!/bin/bash

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo "Error: cwebp is not installed. Please install it first:"
    echo "On macOS: brew install webp"
    echo "On Ubuntu/Debian: sudo apt-get install webp"
    exit 1
fi

# Create webp directory if it doesn't exist
mkdir -p assets/img/webp

# Loop through all image files
for img in assets/img/*.jpg assets/img/*.png; do
    # Skip if file doesn't exist
    [ -f "$img" ] || continue
    
    # Get filename without extension
    filename=$(basename -- "$img")
    name="${filename%.*}"
    
    # Convert to WebP with 80% quality
    echo "Converting $img to WebP..."
    cwebp -q 80 "$img" -o "assets/img/webp/$name.webp"
done

echo "Conversion complete!"