#!/bin/bash

echo "🔥 Firebase Service Account Key Setup"
echo "======================================"
echo ""

echo "📋 Current Status:"
if [ -f "backend/config/serviceAccountKey.json" ]; then
    echo "✅ Service account file exists"
    
    # Check if it's the template
    if grep -q "YOUR_PRIVATE_KEY_ID" backend/config/serviceAccountKey.json; then
        echo "⚠️  Template file detected - needs replacement"
        echo ""
        echo "🔧 To get your actual service account key:"
        echo "1. Go to: https://console.firebase.google.com/project/healthify-31b19/settings/serviceaccounts/adminsdk"
        echo "2. Click 'Generate new private key'"
        echo "3. Download the JSON file"
        echo "4. Replace: backend/config/serviceAccountKey.json"
        echo ""
        echo "📝 Or run this command after downloading:"
        echo "   cp ~/Downloads/healthify-31b19-firebase-adminsdk-*.json backend/config/serviceAccountKey.json"
    else
        echo "✅ Real service account key detected"
        echo ""
        echo "🧪 Testing Firebase connection..."
        cd backend && node test-firebase.js
    fi
else
    echo "❌ Service account file not found"
    echo ""
    echo "🔧 To create the service account key:"
    echo "1. Go to: https://console.firebase.google.com/project/healthify-31b19/settings/serviceaccounts/adminsdk"
    echo "2. Click 'Generate new private key'"
    echo "3. Download the JSON file"
    echo "4. Save as: backend/config/serviceAccountKey.json"
fi

echo ""
echo "📚 For detailed instructions, see: FIREBASE_CONNECTION_TEST.md"
echo "🚀 Ready to test Firebase connection!"
