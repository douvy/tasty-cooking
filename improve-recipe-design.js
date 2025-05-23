// Script to improve recipe design on all pages
const fs = require('fs');
const path = require('path');

const RECIPE_DIR = '/Users/Jim/Documents/GitHub/tasty-cooking';

// Get all HTML files except index.html and cucumber-salad.html
const recipeFiles = fs.readdirSync(RECIPE_DIR)
  .filter(file => file.endsWith('.html') && file !== 'index.html' && file !== 'cucumber-salad.html')
  .map(file => path.join(RECIPE_DIR, file));

console.log(`Found ${recipeFiles.length} recipe files to improve`);

// Create backup directory
const backupDir = '/tmp/design-backup-' + Date.now();
fs.mkdirSync(backupDir, { recursive: true });
console.log(`Created backup directory: ${backupDir}`);

// Process each file
let successCount = 0;
let failCount = 0;

recipeFiles.forEach(filePath => {
  const filename = path.basename(filePath);
  console.log(`Processing ${filename}...`);
  
  try {
    // Create backup
    fs.copyFileSync(filePath, path.join(backupDir, filename));
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract prep and ready times
    let prepTime = "20 min";
    let readyTime = "30 min";
    
    // Try to extract prep time and ready time
    const timeMatch = content.match(/(Prep:|PREP:)\s*([^\/]+)\s*\/\s*(Ready:|READY:)\s*([^<]+)/i);
    if (timeMatch) {
      prepTime = timeMatch[2].trim();
      readyTime = timeMatch[4].trim();
    } else {
      // Try to extract just ready time if prep time is not available
      const readyMatch = content.match(/(Ready:|READY:)\s*([^<]+)/i);
      if (readyMatch) {
        readyTime = readyMatch[2].trim();
      }
    }
    
    // Extract servings
    const servingsMatch = content.match(/<i class="fas fa-utensils[^>]*><\/i>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/);
    const servings = servingsMatch ? servingsMatch[1].trim() : "4-6";
    
    // Icon for servings (usually utensils, but some use blender)
    const servingsIcon = content.includes('fa-blender') ? 'blender' : 'utensils';
    
    console.log(`  Found: Prep: ${prepTime}, Ready: ${readyTime}, Servings: ${servings}`);
    
    // Find the section to replace
    const timeSection = content.match(/<div class="flex items-center justify-start space-x-4 mb-[25]">([\s\S]*?)<\/div>[\s\S]*?<\/div>/);
    
    if (!timeSection) {
      console.log(`  ⚠️ Could not find time section, skipping`);
      failCount++;
      return;
    }
    
    // Create the improved design section
    const improvedDesign = `<div class="flex flex-wrap items-center gap-6 mb-5">
                <div class="flex items-center">
                    <i class="fas fa-clock text-light-grayish-orange text-sm sm:text-base mr-2"></i>
                    <span class="text-sm sm:text-lg font-bold text-light-gray">Prep: ${prepTime}</span>
                </div>
                <div class="flex items-center">
                    <i class="fas fa-hourglass-half text-light-grayish-orange text-sm sm:text-base mr-2"></i>
                    <span class="text-sm sm:text-lg font-bold text-light-gray">Ready: ${readyTime}</span>
                </div>
                <div class="flex items-center">
                    <i class="fas fa-${servingsIcon} text-light-grayish-orange text-sm sm:text-base mr-2"></i>
                    <span class="text-sm sm:text-lg font-bold text-light-gray">${servings}</span>
                </div>
            </div>`;
    
    // Replace the time section
    let updatedContent = content.replace(timeSection[0], improvedDesign);
    
    // Write updated content back to file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    
    console.log(`  ✅ Updated successfully`);
    successCount++;
  } catch (error) {
    console.error(`  ❌ Error processing ${filename}: ${error.message}`);
    failCount++;
  }
});

console.log("\n--- Summary ---");
console.log(`✅ Successfully updated: ${successCount} files`);
console.log(`❌ Failed to update: ${failCount} files`);
console.log(`Backup created at: ${backupDir}`);