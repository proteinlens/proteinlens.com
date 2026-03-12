#!/usr/bin/env bash
# Submit all sitemap URLs to IndexNow after deploy.
# Usage: ./scripts/indexnow-submit.sh
set -euo pipefail

SITE_URL="https://www.proteinlens.com"
KEY="f688d2e7668f5080a2d692bb1cac61d5"
KEY_LOCATION="${SITE_URL}/${KEY}.txt"
SITEMAP="frontend/public/sitemap.xml"

# Extract all <loc> URLs from sitemap
URLS=$(grep -oP '(?<=<loc>)[^<]+' "$SITEMAP")
URL_COUNT=$(echo "$URLS" | wc -l)

echo "📤 Submitting $URL_COUNT URLs to IndexNow..."

# Build JSON array of URLs
URL_JSON=$(echo "$URLS" | jq -R . | jq -s .)

PAYLOAD=$(jq -n \
  --arg host "www.proteinlens.com" \
  --arg key "$KEY" \
  --arg keyLocation "$KEY_LOCATION" \
  --argjson urlList "$URL_JSON" \
  '{host: $host, key: $key, keyLocation: $keyLocation, urlList: $urlList}')

# Submit to IndexNow (Microsoft/Bing endpoint — shared with Yandex, Naver, Seznam)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "https://api.indexnow.org/IndexNow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "202" ]; then
  echo "✅ IndexNow accepted ($HTTP_CODE) — $URL_COUNT URLs submitted"
else
  echo "⚠️ IndexNow returned HTTP $HTTP_CODE"
  echo "$BODY"
  # Don't fail the build for IndexNow issues
  exit 0
fi
