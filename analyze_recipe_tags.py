#\!/usr/bin/env python3
import os
import re
import glob
from bs4 import BeautifulSoup

def extract_tags_from_recipe_page(file_path):
    """Extract tags from a recipe HTML page."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Use BeautifulSoup for more reliable parsing
        soup = BeautifulSoup(content, 'html.parser')
        
        # Look for the tags section
        tags_section = None
        for comment in soup.find_all(string=lambda text: isinstance(text, str) and "Tags Section" in text):
            tags_section = comment.find_parent().find_next_sibling('div')
            if tags_section:
                break
        
        if not tags_section:
            return None
        
        # Extract all span elements in the tags section
        tags = []
        for span in tags_section.find_all('span', class_=lambda c: c and 'inline-flex' in c):
            tag_text = span.get_text().strip()
            if tag_text:
                tags.append(tag_text)
        
        return tags
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def extract_current_tags_from_index(index_content, recipe_name):
    """Extract current data-tags from index.html for a specific recipe."""
    pattern = f'href="{recipe_name}"[^>]*data-tags="([^"]*)"'
    match = re.search(pattern, index_content)
    if match:
        return match.group(1)
    return None

def main():
    # Read index.html content
    with open('index.html', 'r', encoding='utf-8') as f:
        index_content = f.read()
    
    # Create a report file
    with open('tag_analysis_report.txt', 'w', encoding='utf-8') as report:
        report.write("Recipe Tag Analysis Report\n")
        report.write("=========================\n\n")
        
        # Get all recipe HTML files
        recipe_files = [f for f in glob.glob("*.html") if f \!= "index.html"]
        report.write(f"Found {len(recipe_files)} recipe HTML files to analyze\n\n")
        
        mismatches = 0
        matches = 0
        errors = 0
        
        for recipe_file in recipe_files:
            recipe_name = recipe_file.replace('.html', '')
            print(f"Analyzing {recipe_name}...")
            
            # Extract tags from the recipe page
            recipe_tags = extract_tags_from_recipe_page(recipe_file)
            
            if recipe_tags is None:
                report.write(f"Recipe: {recipe_name} (ERROR)\n")
                report.write("No Tags Section found or error processing file\n\n")
                errors += 1
                continue
            
            # Format tags for data-tags attribute (lowercase, hyphenated)
            formatted_data_tags = ' '.join([tag.lower().replace(' ', '-') for tag in recipe_tags])
            
            # Get current data-tags from index.html
            current_data_tags = extract_current_tags_from_index(index_content, recipe_name)
            
            # Determine if tags match
            if current_data_tags == formatted_data_tags:
                status = "MATCH"
                matches += 1
            else:
                status = "MISMATCH"
                mismatches += 1
            
            # Write to report
            report.write(f"Recipe: {recipe_name} ({status})\n")
            report.write(f"Tags on recipe page: {', '.join(recipe_tags)}\n")
            report.write(f"Current data-tags in index.html: {current_data_tags}\n")
            report.write(f"Correct data-tags should be: {formatted_data_tags}\n\n")
        
        # Summary statistics
        report.write("Summary:\n")
        report.write(f"- Total recipes analyzed: {len(recipe_files)}\n")
        report.write(f"- Matches: {matches}\n")
        report.write(f"- Mismatches: {mismatches}\n")
        report.write(f"- Errors: {errors}\n")
    
    print(f"Analysis complete. Report generated in tag_analysis_report.txt")
    print(f"Found {mismatches} recipes with mismatched tags.")

if __name__ == "__main__":
    main()
