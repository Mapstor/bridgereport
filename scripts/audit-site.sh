#!/bin/bash

# Site audit script - checks all pages for 404s and thin content
# Thin content = less than 5000 bytes of HTML

BASE_URL="http://localhost:7060"
OUTPUT_DIR="/tmp/site-audit"
mkdir -p "$OUTPUT_DIR"

TOTAL=0
OK=0
ERRORS=0
THIN=0

# Arrays to store results
declare -a ERROR_URLS
declare -a THIN_URLS

check_url() {
    local url="$1"
    local full_url="${BASE_URL}${url}"

    # Get HTTP status and content length
    response=$(curl -s -o "$OUTPUT_DIR/temp.html" -w "%{http_code}|%{size_download}" "$full_url" 2>/dev/null)
    http_code=$(echo "$response" | cut -d'|' -f1)
    size=$(echo "$response" | cut -d'|' -f2)

    ((TOTAL++))

    if [ "$http_code" -ge 400 ]; then
        ((ERRORS++))
        ERROR_URLS+=("$http_code $url")
        echo "ERROR $http_code: $url"
    elif [ "$size" -lt 5000 ]; then
        ((THIN++))
        THIN_URLS+=("${size}B $url")
        echo "THIN ${size}B: $url"
    else
        ((OK++))
        # Quiet for OK pages
    fi
}

echo "=== SITE AUDIT STARTING ==="
echo ""

# Static pages
echo "--- Checking Static Pages ---"
for page in "/" "/rankings" "/covered-bridges" "/historic-bridges" "/longest-bridges" "/oldest-bridges" "/longest-span-bridges" "/worst-condition-bridges" "/most-trafficked-bridges" "/bridges-near-me" "/widgets" "/guides" "/bridges/by-material" "/bridges/by-design"; do
    check_url "$page"
done
echo "Static pages checked: $TOTAL"

# State pages
echo ""
echo "--- Checking State Pages ---"
state_start=$TOTAL
for state_file in data/states/*.json; do
    state=$(basename "$state_file" .json)
    state_lower=$(echo "$state" | tr '[:upper:]' '[:lower:]')
    check_url "/state/${state_lower}"
    check_url "/worst-bridges/${state_lower}"
    check_url "/covered-bridges/${state_lower}"
done
echo "State pages checked: $((TOTAL - state_start))"

# County pages - use proper slugs from fips_counties.json
echo ""
echo "--- Checking County Pages ---"
county_start=$TOTAL

# Extract county slugs from fips_counties.json and test them
node -e "
const fs = require('fs');
const counties = JSON.parse(fs.readFileSync('data/meta/fips_counties.json', 'utf8'));
for (const [key, name] of Object.entries(counties)) {
    if (key === 'NA-000') continue;
    const [state, fips] = key.split('-');
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    console.log(state.toLowerCase() + '/' + slug);
}
" | while read line; do
    check_url "/county/${line}"
done
echo "County pages checked: $((TOTAL - county_start))"

# City pages - sample 3 per state
echo ""
echo "--- Checking City Pages (sampled - 3 per state) ---"
city_start=$TOTAL

# Extract city slugs from city JSON files
for state_dir in data/cities/*/; do
    state=$(basename "$state_dir")
    state_lower=$(echo "$state" | tr '[:upper:]' '[:lower:]')
    count=0
    for city_file in "$state_dir"*.json; do
        if [ -f "$city_file" ] && [ $count -lt 3 ]; then
            # Extract the city slug from the JSON file
            slug=$(node -e "const d=require('$city_file'); console.log(d.slug || '')" 2>/dev/null)
            if [ -n "$slug" ]; then
                check_url "/city/${state_lower}/${slug}"
                ((count++))
            fi
        fi
    done
done
echo "City pages checked: $((TOTAL - city_start))"

# Bridge pages - sample 3 per state
echo ""
echo "--- Checking Bridge Pages (sampled - 3 per state) ---"
bridge_start=$TOTAL
for state_dir in data/bridges/*/; do
    state=$(basename "$state_dir")
    state_lower=$(echo "$state" | tr '[:upper:]' '[:lower:]')
    count=0
    for bridge_file in "$state_dir"*.json; do
        if [ -f "$bridge_file" ] && [ $count -lt 3 ]; then
            bridge_id=$(basename "$bridge_file" .json)
            # URL encode spaces
            encoded_id=$(echo "$bridge_id" | sed 's/ /%20/g')
            check_url "/bridge/${state_lower}/${encoded_id}"
            ((count++))
        fi
    done
done
echo "Bridge pages checked: $((TOTAL - bridge_start))"

# Material pages
echo ""
echo "--- Checking Material Pages ---"
mat_start=$TOTAL
for slug in steel concrete prestressed-concrete wood aluminum masonry iron; do
    check_url "/bridges/by-material/${slug}"
done
echo "Material pages checked: $((TOTAL - mat_start))"

# Design pages
echo ""
echo "--- Checking Design Pages ---"
design_start=$TOTAL
for slug in slab stringer-multi-beam girder-floorbeam tee-beam box-beam-multiple box-beam-single frame culvert truss-deck truss-thru arch-deck arch-thru suspension cable-stayed movable-lift movable-bascule movable-swing tunnel; do
    check_url "/bridges/by-design/${slug}"
done
echo "Design pages checked: $((TOTAL - design_start))"

# Guide pages
echo ""
echo "--- Checking Guide Pages ---"
guide_start=$TOTAL
for slug in understanding-bridge-conditions understanding-bridge-materials bridge-safety-ratings reading-inspection-reports san-andreas-fault earthquake-magnitude-scale what-causes-earthquakes; do
    check_url "/guides/${slug}"
done
echo "Guide pages checked: $((TOTAL - guide_start))"

echo ""
echo "=== AUDIT COMPLETE ==="
echo ""
echo "SUMMARY:"
echo "  Total pages checked: $TOTAL"
echo "  OK: $OK"
echo "  404/Errors: $ERRORS"
echo "  Thin content (<5KB): $THIN"
echo ""

if [ ${#ERROR_URLS[@]} -gt 0 ]; then
    echo "=== 404/ERROR PAGES ==="
    printf '%s\n' "${ERROR_URLS[@]}"
    echo ""
fi

if [ ${#THIN_URLS[@]} -gt 0 ]; then
    echo "=== THIN CONTENT PAGES ==="
    printf '%s\n' "${THIN_URLS[@]}"
fi
