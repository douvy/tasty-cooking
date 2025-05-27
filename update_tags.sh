#\!/bin/bash

# Script to update mismatched tags in index.html
# Generated from tag analysis

echo "Updating tags for beet-slaw..."
perl -i -pe 's/(href="beet-slaw"[^>]*data-tags=)"[^"]*"/${1}"healthy vegetable vegetarian vegan"/g' index.html

echo "Updating tags for california-za'atar..."
perl -i -pe 's/(href="california-za'atar"[^>]*data-tags=)"[^"]*"/${1}"condiments gluten-free healthy quick vegan vegetarian"/g' index.html

echo "Updating tags for charred-brussels-sprouts..."
perl -i -pe 's/(href="charred-brussels-sprouts"[^>]*data-tags=)"[^"]*"/${1}"gluten-free healthy meat quick vegetable"/g' index.html

echo "Updating tags for japanese-tebasaki-wings..."
perl -i -pe 's/(href="japanese-tebasaki-wings"[^>]*data-tags=)"[^"]*"/${1}"meat spicy gluten-free"/g' index.html

echo "Updating tags for pineapple-ginger-smoothie..."
perl -i -pe 's/(href="pineapple-ginger-smoothie"[^>]*data-tags=)"[^"]*"/${1}"gluten-free healthy vegan vegetarian"/g' index.html

echo "Updating tags for potato-green-bean-soup..."
perl -i -pe 's/(href="potato-green-bean-soup"[^>]*data-tags=)"[^"]*"/${1}"healthy vegetable vegetarian"/g' index.html

echo "Updating tags for roasted-garlic-lentil-soup..."
perl -i -pe 's/(href="roasted-garlic-lentil-soup"[^>]*data-tags=)"[^"]*"/${1}"healthy meat spicy"/g' index.html

echo "Updating tags for romesco..."
perl -i -pe 's/(href="romesco"[^>]*data-tags=)"[^"]*"/${1}"gluten-free healthy vegan vegetarian"/g' index.html

echo "Updating tags for spaghetti-pomodoro..."
perl -i -pe 's/(href="spaghetti-pomodoro"[^>]*data-tags=)"[^"]*"/${1}"condiments gluten-free healthy vegetarian"/g' index.html

echo "Updating tags for sweet-potato-hash..."
perl -i -pe 's/(href="sweet-potato-hash"[^>]*data-tags=)"[^"]*"/${1}"vegetable vegan vegetarian gluten-free healthy quick spicy breakfast"/g' index.html

echo "Updating tags for tomato-confit..."
perl -i -pe 's/(href="tomato-confit"[^>]*data-tags=)"[^"]*"/${1}"condiments gluten-free healthy vegan vegetarian"/g' index.html

echo "Tag updates complete\!"
