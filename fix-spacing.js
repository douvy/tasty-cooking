// Script to fix the spacing issues on recipe pages
const fs = require('fs');
const path = require('path');

const RECIPE_DIR = '/Users/Jim/Documents/GitHub/tasty-cooking';

// Get all HTML files except index.html
const recipeFiles = fs.readdirSync(RECIPE_DIR)
  .filter(file => file.endsWith('.html') && file !== 'index.html' && file !== 'cucumber-salad.html')
  .map(file => path.join(RECIPE_DIR, file));

console.log(`Found ${recipeFiles.length} recipe files to fix`);

// Create backup directory
const backupDir = '/tmp/spacing-backup-' + Date.now();
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
    
    // Fix spacing issues
    let updatedContent = content
      // Update margin-bottom from mb-2 to mb-5 for the time/servings section
      .replace(/<div class="flex items-center justify-start space-x-4 mb-2">/g, 
               '<div class="flex items-center justify-start space-x-4 mb-5">')
      
      // Update margin-bottom from mb-3 to mb-4 for the tags section
      .replace(/<div class="mb-3 flex flex-wrap gap-2">/g, 
               '<div class="mb-4 flex flex-wrap gap-2">');
    
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