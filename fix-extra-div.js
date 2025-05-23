// Script to fix extra </div> tag on all recipe pages
const fs = require('fs');
const path = require('path');

const RECIPE_DIR = '/Users/Jim/Documents/GitHub/tasty-cooking';

// Get all HTML files except index.html and cucumber-salad.html
const recipeFiles = fs.readdirSync(RECIPE_DIR)
  .filter(file => file.endsWith('.html') && file !== 'index.html' && file !== 'cucumber-salad.html' && file !== 'avocado-wraps.html')
  .map(file => path.join(RECIPE_DIR, file));

console.log(`Found ${recipeFiles.length} recipe files to fix`);

// Create backup directory
const backupDir = '/tmp/div-backup-' + Date.now();
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
    
    // Look for the specific pattern: an extra </div> before the Tags Section comment
    const fixedContent = content.replace(
      /<\/div>\s+<\!-- Tags Section -->/g,
      '<!-- Tags Section -->'
    );
    
    // Write updated content back to file
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    
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