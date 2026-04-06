#!/usr/bin/env python3
"""
Fetch place names from Census Bureau API and generate fips_places.json

Uses the Census Bureau's API to get official FIPS place codes to place name mappings.
API: https://api.census.gov/data/2020/dec/pl

This replaces placeholder names like "Place 12345" with actual city names.
"""

import json
import os
import urllib.request
import time
from pathlib import Path

# State FIPS codes (2-digit)
STATE_FIPS = {
    "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA",
    "08": "CO", "09": "CT", "10": "DE", "11": "DC", "12": "FL",
    "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN",
    "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME",
    "24": "MD", "25": "MA", "26": "MI", "27": "MN", "28": "MS",
    "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
    "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND",
    "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI",
    "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT",
    "50": "VT", "51": "VA", "53": "WA", "54": "WV", "55": "WI",
    "56": "WY", "72": "PR"
}


def clean_place_name(name):
    """Clean up Census place name.

    Census names are like "Los Angeles city, California" or "Unincorporated CDP, California"
    We want to extract just the place name without the state or type suffix.
    """
    # Remove state suffix (everything after the last comma)
    if ', ' in name:
        name = name.rsplit(', ', 1)[0]

    # Remove type suffix (city, town, CDP, village, borough, etc.)
    # but keep it for display since it helps distinguish places
    # Actually, keep the full name for clarity
    return name


def fetch_places_for_state(state_fips, state_abbr):
    """Fetch all places for a single state from Census API."""
    url = f"https://api.census.gov/data/2020/dec/pl?get=NAME&for=place:*&in=state:{state_fips}"

    try:
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'BridgeReport/1.0'}
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"  Error fetching {state_abbr}: {e}")
        return {}

    places = {}
    # Skip header row
    for row in data[1:]:
        name = row[0]
        place_fips = row[2]  # 5-digit place FIPS

        clean_name = clean_place_name(name)
        key = f"{state_abbr}-{place_fips}"
        places[key] = clean_name

    return places


def fetch_all_places():
    """Fetch place names for all states."""
    all_places = {}

    for state_fips, state_abbr in STATE_FIPS.items():
        print(f"  Fetching {state_abbr}...", end="", flush=True)

        places = fetch_places_for_state(state_fips, state_abbr)
        all_places.update(places)

        print(f" {len(places)} places")

        # Small delay to be nice to the API
        time.sleep(0.2)

    return all_places


def load_existing_places(filepath):
    """Load existing fips_places.json to see what place codes we need."""
    if not os.path.exists(filepath):
        return {}

    with open(filepath, 'r') as f:
        return json.load(f)


def main():
    # Paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    output_path = project_root / "data" / "meta" / "fips_places.json"

    # Load existing file to see what FIPS codes we have
    existing = load_existing_places(output_path)
    print(f"Existing file has {len(existing)} entries")

    # Sample of existing data
    sample = list(existing.items())[:5]
    print(f"Sample existing entries: {sample}")

    # Fetch census data
    print("\nFetching from Census Bureau API...")
    census_places = fetch_all_places()

    print(f"\nTotal fetched: {len(census_places)} places from Census")

    # Update with census data, keeping only entries that exist in our data
    updated = {}
    found = 0
    not_found = []

    for key in existing.keys():
        if key in census_places:
            updated[key] = census_places[key]
            found += 1
        else:
            # Keep the placeholder if we can't find a match
            updated[key] = existing[key]
            not_found.append(key)

    print(f"\nMatched {found} places with Census data")
    print(f"Could not find {len(not_found)} places")

    if not_found:
        print(f"First 20 unmatched: {not_found[:20]}")

    # Write output
    print(f"\nWriting to {output_path}")
    with open(output_path, 'w') as f:
        json.dump(updated, f, indent=2, sort_keys=True)

    print("Done!")

    # Show sample of updated data
    print(f"\nSample updated entries:")
    for k, v in list(updated.items())[:15]:
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
