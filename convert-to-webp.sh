#!/bin/bash

# Advanced WebP conversion script with responsive sizes
# Requirements: cwebp (from webp package) and ImageMagick for resizing

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo "Error: cwebp is not installed. Please install it first:"
    echo "On macOS: brew install webp"
    echo "On Ubuntu/Debian: sudo apt-get install webp"
    echo "On CentOS/RHEL: sudo yum install libwebp-tools"
    exit 1
fi

# Check if ImageMagick is installed (for resizing)
if ! command -v convert &> /dev/null; then
    echo "Warning: ImageMagick is not installed. Responsive images will not be created."
    echo "On macOS: brew install imagemagick"
    echo "On Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "On CentOS/RHEL: sudo yum install imagemagick"
    RESIZE=0
else
    RESIZE=1
fi

# Create webp directories if they don't exist
mkdir -p assets/img/webp
mkdir -p assets/img/webp/mobile
mkdir -p assets/img/webp/tablet

# Quality settings
QUALITY=85
QUALITY_MOBILE=75
QUALITY_TABLET=80

# Process image function with optional resize
process_image() {
    local img="$1"
    local output_dir="$2"
    local quality="$3"
    local width="$4"
    
    # Get filename without extension
    filename=$(basename -- "$img")
    name="${filename%.*}"
    
    # Create output path
    output="$output_dir/$name.webp"
    
    # If width is specified and ImageMagick is available, resize first
    if [ -n "$width" ] && [ $RESIZE -eq 1 ]; then
        echo "Resizing and converting $img to $width px width WebP..."
        convert "$img" -resize "${width}x" -quality 95 /tmp/resized_$name.jpg
        cwebp -q $quality /tmp/resized_$name.jpg -o "$output"
        rm /tmp/resized_$name.jpg
    else
        echo "Converting $img to WebP with quality $quality..."
        cwebp -q $quality "$img" -o "$output"
    fi
}

# Process all images in different sizes
echo "=== Starting WebP conversion with responsive sizes ==="

for img in assets/img/*.jpg assets/img/*.jpeg assets/img/*.png; do
    # Skip if file doesn't exist or is in webp directory
    [[ -f "$img" && ! "$img" =~ "webp" ]] || continue
    
    # Create full-size WebP
    process_image "$img" "assets/img/webp" $QUALITY
    
    # Create tablet-size WebP (800px width)
    process_image "$img" "assets/img/webp/tablet" $QUALITY_TABLET "800"
    
    # Create mobile-size WebP (480px width)
    process_image "$img" "assets/img/webp/mobile" $QUALITY_MOBILE "480"
done

echo "=== Conversion complete! ==="
echo "Full-size WebPs: assets/img/webp/"
echo "Tablet-size WebPs: assets/img/webp/tablet/"
echo "Mobile-size WebPs: assets/img/webp/mobile/"
echo ""
echo "Recommended HTML usage:"
echo "<picture>"
echo "  <source media=\"(max-width: 480px)\" srcset=\"assets/img/webp/mobile/image.webp\" type=\"image/webp\">"
echo "  <source media=\"(max-width: 800px)\" srcset=\"assets/img/webp/tablet/image.webp\" type=\"image/webp\">"
echo "  <source srcset=\"assets/img/webp/image.webp\" type=\"image/webp\">"
echo "  <img src=\"assets/img/image.jpg\" alt=\"Image description\" loading=\"lazy\">"
echo "</picture>"