#\!/usr/bin/env python3
import os
import re
import glob

# The new header code we want to apply to all recipe pages
NEW_HEADER = '''<body>
    <\!-- Header -->
    <div class="container-fluid border-divider-b z-30 bg-black bg-opacity-80 absolute top-0 left-0 right-0">
        <header class="container mx-auto flex flex-wrap items-center p-4 px-4">
            <\!-- Logo and Navigation - Mobile version -->
            <div class="flex items-center justify-between text-sm md:hidden w-full" style="margin-bottom: 1.1rem;">
                <a href="index" class="hover:text-gray-300 flex items-center whitespace-nowrap">
                    <img src="assets/img/logo.png" alt="Tasty Cooking Logo" class="h-6 w-auto mr-3">
                    <span class="font-cheee-wowie text-xl text-[#e2ded8]">Tasty Cooking</span>
                </a>
            </div>'''

# Get all HTML files except index.html and sesame-green-beans.html
html_files = glob.glob('/Users/Jim/Documents/GitHub/tasty-cooking/*.html')
html_files = [f for f in html_files if not (f.endswith('index.html') or f.endswith('sesame-green-beans.html'))]

# Process each file
for file_path in html_files:
    print(f"Processing {file_path}...")
    
    with open(file_path, 'r') as file:
        content = file.read()
    
    # Use regex to replace the old header section with the new one
    pattern = r'<body>.*?<div class="flex items-center justify-between text-sm md:hidden">'
    replacement = NEW_HEADER
    
    # Make the replacement using regex with DOTALL flag to match across lines
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    with open(file_path, 'w') as file:
        file.write(new_content)

print("Header update complete\!")
