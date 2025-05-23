// Script to update recipe prep/ready section across all recipe pages
const fs = require('fs');
const path = require('path');

// Define paths
const RECIPE_DIR = '/Users/Jim/Documents/GitHub/tasty-cooking';

// Get list of recipe HTML files
const recipeFiles = fs.readdirSync(RECIPE_DIR)
  .filter(file => file.endsWith('.html') && file !== 'index.html')
  .map(file => path.join(RECIPE_DIR, file));

console.log(`Found ${recipeFiles.length} recipe files to update`);

// Create a backup first
const backupDir = '/tmp/recipe-backup-' + Date.now();
fs.mkdirSync(backupDir, { recursive: true });
console.log(`Created backup directory: ${backupDir}`);

// Function to extract prep/ready times and servings
function extractInfo(content) {
  // Extract prep time
  let prepMatch = content.match(/Prep: ([^\/]+)/i);
  if (!prepMatch) prepMatch = content.match(/PREP: ([^\/]+)/i);
  const prepTime = prepMatch ? prepMatch[1].trim() : "20 min";
  
  // Extract ready time
  let readyMatch = content.match(/Ready: ([^<"]+)/i);
  if (!readyMatch) readyMatch = content.match(/READY: ([^<"]+)/i);
  const readyTime = readyMatch ? readyMatch[1].trim() : "1 hr";
  
  // Extract servings - look for text after utensils or blender icon
  const servingsMatch = content.match(/<i class="fas fa-(utensils|blender)[^>]*><\/i>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/);
  const servingsIcon = servingsMatch ? servingsMatch[1] : "utensils";
  const servings = servingsMatch ? servingsMatch[2].trim() : "4-6";
  
  return { prepTime, readyTime, servings, servingsIcon };
}

// Function to replace the prep/ready section
function updateRecipePage(filePath) {
  const filename = path.basename(filePath);
  console.log(`Processing ${filename}...`);
  
  try {
    // Create backup
    fs.copyFileSync(filePath, path.join(backupDir, filename));
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract information
    const { prepTime, readyTime, servings, servingsIcon } = extractInfo(content);
    console.log(`  Found: Prep: ${prepTime}, Ready: ${readyTime}, Servings: ${servings}`);
    
    // Create updated pattern (search for the flex container with clock icon)
    const pattern = new RegExp(
      '<div class="flex items-center justify-start space-x-[0-9]+ mb-[0-9]+">[\\s\\S]*?' + 
      '<i class="fas fa-clock[^>]*>[\\s\\S]*?Prep[^<]*\\/[^<]*Ready[^<]*<\\/p>[\\s\\S]*?' +
      '<\\/div>[\\s\\S]*?<\\/div>', 
      'i'
    );
    
    // New improved section HTML
    const replacement = `<div class="flex flex-wrap items-center gap-6 mb-5">
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
    
    // Perform the replacement
    let updatedContent = content.replace(pattern, replacement);
    
    // Also update the tags section margin for consistency
    updatedContent = updatedContent.replace(
      /<div class="mb-3 flex flex-wrap gap-2">/g,
      '<div class="mb-4 flex flex-wrap gap-2">'
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, updatedContent);
    
    // Verify the update by checking if the replacement text exists
    const verifyContent = fs.readFileSync(filePath, 'utf8');
    if (verifyContent.includes('fa-hourglass-half')) {
      console.log(`  ✅ Successfully updated ${filename}`);
      return true;
    } else {
      console.log(`  ❌ Update verification failed for ${filename}`);
      // Restore from backup
      fs.copyFileSync(path.join(backupDir, filename), filePath);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${filename}: ${error.message}`);
    // Try to restore from backup if it exists
    try {
      if (fs.existsSync(path.join(backupDir, filename))) {
        fs.copyFileSync(path.join(backupDir, filename), filePath);
        console.log(`  ⚠️ Restored ${filename} from backup`);
      }
    } catch (e) {
      console.error(`  ❌ Failed to restore backup: ${e.message}`);
    }
    return false;
  }
}

// Process all files
let successCount = 0;
let failCount = 0;

console.log("\nStarting updates...");
recipeFiles.forEach(file => {
  const success = updateRecipePage(file);
  if (success) {
    successCount++;
  } else {
    failCount++;
  }
});

console.log("\n--- Summary ---");
console.log(`✅ Successfully updated: ${successCount} files`);
console.log(`❌ Failed to update: ${failCount} files`);
console.log(`Backup created at: ${backupDir}`);