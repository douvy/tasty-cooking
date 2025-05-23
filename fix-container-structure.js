// Script to fix container structure on all recipe pages
const fs = require('fs');
const path = require('path');

const RECIPE_DIR = '/Users/Jim/Documents/GitHub/tasty-cooking';

// Get all HTML files except index.html and cucumber-salad.html
const recipeFiles = fs.readdirSync(RECIPE_DIR)
  .filter(file => file.endsWith('.html') && file !== 'index.html' && file !== 'cucumber-salad.html')
  .map(file => path.join(RECIPE_DIR, file));

console.log(`Found ${recipeFiles.length} recipe files to fix`);

// Create backup directory
const backupDir = '/tmp/structure-backup-' + Date.now();
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
    
    // Find and fix the structure issue
    // Look for pattern where there's an extra closing div after the time section
    let fixedContent = content.replace(
      /(<div class="flex flex-wrap items-center gap-6 mb-5">[\s\S]+?<\/div>[\s\S]+?<\/div>[\s\S]+?<\/div>)(\s+)(<\!-- Tags Section -->)/g,
      (match, p1, p2, p3) => {
        // Remove the extra closing div
        const fixed = p1.replace(/(<\/div>[\s\S]+?<\/div>[\s\S]+?)(<\/div>)(\s+)(<\!-- Tags Section -->)/, '$1$3$4');
        return fixed + p2 + p3;
      }
    );
    
    // If the pattern didn't match, try another approach
    if (fixedContent === content) {
      // Look for the specific issue: an extra </div> before the Tags Section comment
      fixedContent = content.replace(
        /(<\/div>)(\s+)(<\!-- Tags Section -->)/g,
        '$2$3'
      );
    }
    
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