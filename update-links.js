const fs = require('fs');
const path = require('path');

// Main function to update links in all HTML files
async function updateHtmlLinks() {
  try {
    // Get all HTML files in the project directory
    const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));
    console.log(`Found ${htmlFiles.length} HTML files to process.`);
    
    let filesUpdated = 0;
    
    // Process each HTML file
    for (const fileName of htmlFiles) {
      try {
        const filePath = `./${fileName}`;
        // Read file content
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Original content before any changes
        const originalContent = content;
        
        // Pattern to find HTML links - using regex with a negative lookahead to avoid external links
        // This matches href="something.html" where something doesn't contain :// (which would indicate external URL)
        const linkPattern = /href=["']([^"':]+\.html)["']/g;
        
        // Replace the .html extension in internal links
        content = content.replace(linkPattern, (match, p1) => {
          // Remove .html from the link
          const newLink = p1.replace(/\.html$/, '');
          return `href="${newLink}"`;
        });
        
        // Only write to file if changes were made
        if (content !== originalContent) {
          fs.writeFileSync(filePath, content, 'utf8');
          filesUpdated++;
          console.log(`Updated links in: ${fileName}`);
        }
      } catch (fileError) {
        console.error(`Error processing file ${fileName}: ${fileError.message}`);
      }
    }
    
    console.log(`Successfully updated links in ${filesUpdated} HTML files.`);
  } catch (error) {
    console.error(`Error updating HTML links: ${error.message}`);
  }
}

// Run the function
updateHtmlLinks();