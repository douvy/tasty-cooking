// Script to update the timer UI/UX in all recipe pages
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RECIPE_DIR = '/Users/Jim/Documents/GitHub/tasty-cooking';

// Get all HTML files except index.html
const getRecipeFiles = () => {
  const files = fs.readdirSync(RECIPE_DIR)
    .filter(file => file.endsWith('.html') && file !== 'index.html')
    .map(file => path.join(RECIPE_DIR, file));
  
  console.log(`Found ${files.length} recipe files to process`);
  return files;
};

// Process a single file
const processFile = (filePath) => {
  console.log(`Processing ${path.basename(filePath)}...`);
  
  try {
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find the prep/ready section
    const prepSectionRegex = /<div class="flex items-center justify-start space-x-[0-9]+ mb-[0-9]+">([\s\S]*?)<\/div>[\s\S]*?<\/div>/;
    const match = content.match(prepSectionRegex);
    
    if (!match) {
      console.log(`  ⚠️ Could not find prep/ready section in ${path.basename(filePath)}, skipping.`);
      return false;
    }
    
    // Extract prep time, ready time, and servings
    const prepTimeMatch = content.match(/Prep: ([^\/]+)/);
    const readyTimeMatch = content.match(/Ready: ([^<"]+)/);
    
    // Find the servings
    const servingsRegex = /<i class="fas fa-(utensils|blender)[^>]*><\/i>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/;
    const servingsMatch = content.match(servingsRegex);
    
    if (!prepTimeMatch || !readyTimeMatch) {
      console.log(`  ⚠️ Could not extract prep/ready times in ${path.basename(filePath)}, skipping.`);
      return false;
    }
    
    const prepTime = prepTimeMatch[1].trim();
    const readyTime = readyTimeMatch[1].trim();
    const servingsIcon = servingsMatch ? servingsMatch[1] : 'utensils';
    const servings = servingsMatch ? servingsMatch[2].trim() : '4-6';
    
    console.log(`  Extracted: Prep: ${prepTime}, Ready: ${readyTime}, Servings: ${servings}`);
    
    // Create the improved UI/UX section
    const newSection = `<div class="flex flex-wrap items-center gap-6 mb-5">
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
    
    // Replace the old section
    const updatedContent = content.replace(prepSectionRegex, newSection);
    
    // Also update the tags section spacing for consistency
    const finalContent = updatedContent.replace(
      /<div class="mb-3 flex flex-wrap gap-2">/g, 
      '<div class="mb-4 flex flex-wrap gap-2">'
    );
    
    // Write back to file
    fs.writeFileSync(filePath, finalContent, 'utf8');
    console.log(`  ✅ Updated successfully`);
    return true;
  } catch (error) {
    console.error(`  ❌ Error processing ${path.basename(filePath)}: ${error.message}`);
    return false;
  }
};

// Main function
const main = () => {
  console.log('🔄 Starting recipe timer UI/UX update...\n');
  
  // Create backup first
  console.log('📦 Creating backup...');
  const backupDir = '/tmp/tasty-cooking-backup-' + Date.now();
  execSync(`mkdir -p ${backupDir} && cp ${RECIPE_DIR}/*.html ${backupDir}/`);
  console.log(`Backup created at ${backupDir}\n`);
  
  const files = getRecipeFiles();
  
  let successCount = 0;
  let failCount = 0;
  
  // Process each file
  files.forEach(file => {
    const success = processFile(file);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  });
  
  console.log('\n🏁 Update complete!');
  console.log(`✅ ${successCount} files updated successfully`);
  if (failCount > 0) {
    console.log(`⚠️ ${failCount} files skipped or failed`);
  }
};

// Run the script
main();