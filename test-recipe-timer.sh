#!/bin/bash

# Test the update on a single file
# Copy a file to a temp location and test the update

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test file
TEST_FILE="/Users/Jim/Documents/GitHub/tasty-cooking/avocado-wraps.html"
TEMP_FILE="/tmp/test-recipe-update.html"

echo "🔍 Testing on $(basename "$TEST_FILE")..."
cp "$TEST_FILE" "$TEMP_FILE"

# Extract prep time and ready time
PREP_TIME=$(grep -o 'Prep: [^/]*' "$TEMP_FILE" | head -1 | sed 's/Prep: //')
READY_TIME=$(grep -o 'Ready: [^<]*' "$TEMP_FILE" | head -1 | sed 's/Ready: //')
SERVINGS=$(grep -A1 'fa-utensils\|fa-blender' "$TEMP_FILE" | grep -o '>.*<' | head -1 | sed 's/>//;s/<$//')

echo "Extracted data:"
echo "  Prep time: $PREP_TIME"
echo "  Ready time: $READY_TIME"
echo "  Servings: $SERVINGS"

# Determine the servings icon
if grep -q 'fa-blender' "$TEMP_FILE"; then
  SERVINGS_ICON="fa-blender"
else
  SERVINGS_ICON="fa-utensils"
fi
echo "  Icon: $SERVINGS_ICON"

# The pattern to search for (using a simplified version for more reliable matching)
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

# Use perl for the multiline replacement
perl -0777 -pe 's/'"$PATTERN"'/'"$REPLACEMENT"'/s' "$TEMP_FILE" > "/tmp/test-output.html"

# Check if the replacement was successful
if [ "$(stat -f%z "/tmp/test-output.html")" -gt 1000 ]; then
  echo -e "${GREEN}✅ Test update successful${NC}"
  echo "Before:"
  grep -A5 "fa-clock" "$TEMP_FILE" | head -5
  echo "After:"
  grep -A5 "fa-clock" "/tmp/test-output.html" | head -5
else
  echo -e "${RED}❌ Test update failed${NC}"
fi

# Also update the tags section for consistent spacing
sed -i '' 's/<div class="mb-3 flex flex-wrap gap-2">/<div class="mb-4 flex flex-wrap gap-2">/g' "/tmp/test-output.html"

echo "File saved to /tmp/test-output.html for inspection"