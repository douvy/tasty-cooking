// Script to fix tag alignment and text spacing on all recipe pages
const fs = require('fs');
const path = require('path');

const RECIPE_DIR = '/Users/Jim/Documents/GitHub/tasty-cooking';

// Get all HTML files except index.html and cucumber-salad.html
const recipeFiles = fs.readdirSync(RECIPE_DIR)
  .filter(file => file.endsWith('.html') && file !== 'index.html' && file !== 'cucumber-salad.html')
  .map(file => path.join(RECIPE_DIR, file));

console.log(`Found ${recipeFiles.length} recipe files to fix`);

// Create backup directory
const backupDir = '/tmp/alignment-backup-' + Date.now();
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
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Fix tag section margin and alignment
    content = content.replace(
      /<div class="mb-[34] flex flex-wrap gap-2">/g, 
      '<div class="mb-4 flex flex-wrap gap-2">'
    );
    
    // 2. Fix paragraph spacing in description
    content = content.replace(
      /<p class="mb-0 leading-7">/g,
      '<p class="leading-7">'
    );
    
    content = content.replace(
      /<p class="mb-[0-9]+ leading-7">/g,
      '<p class="leading-7">'
    );
    
    // Write updated content back to file
    fs.writeFileSync(filePath, content, 'utf8');
    
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