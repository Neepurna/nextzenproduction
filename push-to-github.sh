#!/bin/bash

# GitHub Push Script for Movie Ticketing System
# This script safely prepares and pushes your code to GitHub

echo "🔒 Checking for sensitive data..."

# Check if .gitignore exists
if [ ! -f .gitignore ]; then
    echo "❌ .gitignore not found!"
    exit 1
fi

echo "✅ .gitignore configured"

# Initialize git if needed
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check git status
echo ""
echo "📊 Git Status:"
git status --short

echo ""
echo "📝 Files to be committed:"
git status --short | wc -l

echo ""
read -p "👉 Do you want to continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Aborted"
    exit 1
fi

# Add all files
echo "➕ Adding files to git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "✅ No changes to commit"
else
    echo "💾 Committing changes..."
    read -p "Enter commit message (or press Enter for default): " commit_msg
    if [ -z "$commit_msg" ]; then
        commit_msg="Update movie ticketing system - Production ready"
    fi
    git commit -m "$commit_msg"
    echo "✅ Changes committed"
fi

# Check if remote exists
if git remote | grep -q origin; then
    echo "✅ Remote 'origin' already configured"
    echo "📍 Remote URL: $(git remote get-url origin)"
    
    echo ""
    read -p "👉 Push to GitHub? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Pushing to GitHub..."
        git push origin main || git push origin master
        echo "✅ Pushed to GitHub!"
    else
        echo "⏸️  Skipped push. You can push manually with: git push"
    fi
else
    echo "⚠️  No remote repository configured"
    echo ""
    echo "📋 To add your GitHub repository:"
    echo "1. Create a new repository on GitHub"
    echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo "3. Run: git push -u origin main"
    echo ""
    read -p "Enter GitHub repository URL (or press Enter to skip): " repo_url
    
    if [ ! -z "$repo_url" ]; then
        echo "🔗 Adding remote repository..."
        git remote add origin "$repo_url"
        
        # Set default branch name
        git branch -M main
        
        echo "🚀 Pushing to GitHub..."
        git push -u origin main
        echo "✅ Pushed to GitHub!"
    else
        echo "⏸️  Skipped. Add remote manually later."
    fi
fi

echo ""
echo "✅ Done!"
echo ""
echo "📚 Next steps:"
echo "   - Visit your GitHub repository"
echo "   - Add repository secrets for deployment"
echo "   - Set up GitHub Actions (optional)"
