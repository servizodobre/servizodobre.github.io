#!/bin/bash

# Step 1: Export static HTML files
python export_static.py

# Step 2: Move files to the root directory
cp -r output/* .

# Step 3: Commit and push to GitHub
git add .
git commit -m "Deploy static website"
git push origin main
