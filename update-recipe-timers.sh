#!/bin/bash

# Update recipe timing sections for better UI/UX
# This script updates all recipe HTML files to have a better design for the prep/ready section

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔍 Finding recipe HTML files..."
RECIPE_FILES=$(find /Users/Jim/Documents/GitHub/tasty-cooking -name "*.html" ! -name "index.html" -type f)
COUNT=$(echo "$RECIPE_FILES" | wc -l)
COUNT=$(echo $COUNT | tr -d '[:space:]')

echo -e "${GREEN}Found $COUNT recipe files to update${NC}"
echo ""

# Counter for successful updates
UPDATED=0
SKIPPED=0
FAILED=0

# Process each file
for FILE in $RECIPE_FILES; do
  FILENAME=$(basename "$FILE")
  echo -e "${YELLOW}Processing $FILENAME...${NC}"
  
  # Extract prep time and ready time
  PREP_TIME=$(grep -o 'Prep: [^/]*' "$FILE" | head -1 | sed 's/Prep: //')
  READY_TIME=$(grep -o 'Ready: [^<]*' "$FILE" | head -1 | sed 's/Ready: //')
  SERVINGS=$(grep -A1 'fa-utensils\|fa-blender' "$FILE" | grep -o '>.*<' | head -1 | sed 's/>//;s/<$//')
  
  if [ -z "$PREP_TIME" ] || [ -z "$READY_TIME" ]; then
    echo -e "${RED}  ❌ Could not extract prep/ready time, skipping.${NC}"
    SKIPPED=$((SKIPPED+1))
    continue
  fi
  
  # Handle case where SERVINGS couldn't be extracted
  if [ -z "$SERVINGS" ]; then
    SERVINGS="4-6" # Default fallback
    echo -e "${YELLOW}  ⚠️ Could not extract servings, using default: $SERVINGS${NC}"
  fi
  
  # Determine the servings icon (most use utensils, but some use blender)
  if grep -q 'fa-blender' "$FILE"; then
    SERVINGS_ICON="fa-blender"
  else
    SERVINGS_ICON="fa-utensils"
  fi
  
  # The pattern to search for
  PATTERN='<div class="flex items-center justify-start space-x-[0-9]+ mb-[0-9]+">.*?<i class="fas fa-clock.*?<\/div>.*?<\/div>'
  
  # The replacement (improved UI/UX design)
  REPLACEMENT='<div class="flex flex-wrap items-center gap-6 mb-5">
                <div class="flex items-center">
                    <i class="fas fa-clock text-light-grayish-orange text-sm sm:text-base mr-2"></i>
                    <span class="text-sm sm:text-lg font-bold text-light-gray">Prep: '"$PREP_TIME"'</span>
                </div>
                <div class="flex items-center">
                    <i class="fas fa-hourglass-half text-light-grayish-orange text-sm sm:text-base mr-2"></i>
                    <span class="text-sm sm:text-lg font-bold text-light-gray">Ready: '"$READY_TIME"'</span>
                </div>
                <div class="flex items-center">
                    <i class="fas '"$SERVINGS_ICON"' text-light-grayish-orange text-sm sm:text-base mr-2"></i>
                    <span class="text-sm sm:text-lg font-bold text-light-gray">'"$SERVINGS"'</span>
                </div>
            </div>'
  
  # Create a temporary file for the replacement
  TMP_FILE=$(mktemp)
  
  # Use perl for the multiline replacement (more reliable than sed for this)
  perl -0777 -pe 's/'"$PATTERN"'/'"$REPLACEMENT"'/s' "$FILE" > "$TMP_FILE"
  
  # Check if the replacement was successful (compare file sizes)
  if [ "$(stat -f%z "$TMP_FILE")" -gt 1000 ]; then
    mv "$TMP_FILE" "$FILE"
    echo -e "${GREEN}  ✅ Updated successfully${NC}"
    UPDATED=$((UPDATED+1))
  else
    rm "$TMP_FILE"
    echo -e "${RED}  ❌ Update failed, pattern not found or output too small${NC}"
    FAILED=$((FAILED+1))
  fi
  
  # Also update the tags section for consistent spacing
  sed -i '' 's/<div class="mb-3 flex flex-wrap gap-2">/<div class="mb-4 flex flex-wrap gap-2">/g' "$FILE"
done

echo ""
echo -e "${GREEN}✅ $UPDATED files updated successfully${NC}"
if [ "$SKIPPED" -gt 0 ]; then
  echo -e "${YELLOW}⚠️ $SKIPPED files skipped${NC}"
fi
if [ "$FAILED" -gt 0 ]; then
  echo -e "${RED}❌ $FAILED files failed${NC}"
fi

echo ""
echo "Script completed. Check the files to verify the updates."