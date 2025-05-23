#!/bin/bash

# Step 1: Navigate to the root directory of the repository
cd /Users/servizodobre/git/servizodobre.github.io

# Step 2: Copy html files to the templates folder
#cp index.html backend/app/templates/index.html
#cp frontend/*.html backend/app/templates/.

# Step 3: Commit and push to GitHub
git add .
git commit -m "Deploy static website"
git push origin main

# Step 4: Restart the Flask application in a new terminal
FLASK_APP_PATH="/Users/servizodobre/git/servizodobre.github.io/backend/app.py"
TERMINAL_COMMAND="python3 $FLASK_APP_PATH"

# Kill any existing Flask processes
pkill -f "$FLASK_APP_PATH"

# Start Flask in a new terminal
osascript <<EOF
    tell application "Terminal"
        do script "$TERMINAL_COMMAND"
    end tell
EOF
