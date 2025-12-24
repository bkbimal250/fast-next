#!/bin/bash
# Script to verify all required files exist for build

echo "Checking required files for Next.js build..."
echo ""

FRONTEND_DIR="/var/www/fast-next/frontend"
MISSING_FILES=0

# Check lib files
echo "Checking lib/ directory..."
LIB_FILES=(
  "lib/job.ts"
  "lib/application.ts"
  "lib/auth.ts"
  "lib/toast.ts"
  "lib/axios.ts"
  "lib/location.ts"
  "lib/spa.ts"
  "lib/message.ts"
  "lib/user.ts"
  "lib/analytics.ts"
  "lib/chatbot.ts"
  "lib/contact.ts"
  "lib/geo.ts"
  "lib/seo.ts"
  "lib/subscribe.ts"
)

for file in "${LIB_FILES[@]}"; do
  if [ ! -f "$FRONTEND_DIR/$file" ]; then
    echo "❌ MISSING: $file"
    MISSING_FILES=$((MISSING_FILES + 1))
  else
    echo "✓ Found: $file"
  fi
done

echo ""
echo "Checking components/ directory..."
COMPONENT_FILES=(
  "components/SEOHead.tsx"
  "components/Navbar.tsx"
  "components/JobCard.tsx"
  "components/MessageForm.tsx"
  "components/SearchBar.tsx"
  "components/Footer.tsx"
)

for file in "${COMPONENT_FILES[@]}"; do
  if [ ! -f "$FRONTEND_DIR/$file" ]; then
    echo "❌ MISSING: $file"
    MISSING_FILES=$((MISSING_FILES + 1))
  else
    echo "✓ Found: $file"
  fi
done

echo ""
if [ $MISSING_FILES -eq 0 ]; then
  echo "✅ All required files are present!"
else
  echo "❌ Found $MISSING_FILES missing file(s). Please copy them to the server."
  exit 1
fi

