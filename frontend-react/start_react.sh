#!/bin/bash
echo "🚀 Starting React Dashboard outside VS Code..."
echo "📍 Directory: $(pwd)"
echo "🔧 Node version: $(node --version)"
echo "📦 npm version: $(npm --version)"
echo ""
echo "🌐 URLs will be:"
echo "   Local:  http://localhost:3000/"
echo "   Remote: http://45.137.194.210:3000/"
echo ""
echo "Press Ctrl+C to stop"
echo "==========================================="
npm run dev
