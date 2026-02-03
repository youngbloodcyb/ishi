#!/bin/bash

# Script to recursively remove all node_modules directories in the monorepo

echo "🔍 Searching for node_modules directories..."

# Find all node_modules directories and count them
count=$(find . -name "node_modules" -type d | wc -l)

if [ "$count" -eq 0 ]; then
    echo "✅ No node_modules directories found."
    exit 0
fi

echo "📦 Found $count node_modules directories"
echo ""
echo "🗑️  Removing the following directories:"
echo ""

# Find all node_modules directories, display them, then remove them
find . -name "node_modules" -type d -prune | while read -r dir; do
    echo "  Removing: $(cd "$(dirname "$dir")" && pwd)/$(basename "$dir")"
    rm -rf "$dir"
done

echo ""
echo "✅ All node_modules directories have been removed!"
