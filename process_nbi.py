#!/usr/bin/env python3
"""
BridgeReport.org — NBI Data Processing Pipeline
=================================================

USAGE:
  1. Download NBI delimited CSV from FHWA:
     https://www.fhwa.dot.gov/bridge/nbi/ascii2024.cfm
     → "Highway Bridges for all States (in a single file)" → Delimited → zip
  
  2. Extract zip, rename the CSV to nbi_raw.csv, place in this directory
  
  3. Run: python3 process_nbi.py
  
  4. Output goes to ./data/ (~200MB of JSON files)

OUTPUT:
  data/
  ├── national.json                    # National summary stats
  ├── states/TX.json                   # Per-state summaries (52 files)
  ├── counties/TX/201.json             # Per-county summaries (~3,143 files)
  ├── cities/TX/35000.json             # Per-city summaries  
  ├── bridges/TX/structure_id.json     # Individual bridge records (~623K files)
  ├── rankings/
  │   ├── worst_states.json            # States ranked by % deficient
  │   ├── best_states.json
  │   ├── longest_bridges.json         # Top 500 longest
  │   ├── oldest_bridges.json          # Top 500 oldest
  │   ├── most_trafficked.json         # Top 500 by ADT
  │   ├── worst_bridges.json           # Top 500 lowest ratings
  │   └── historic_bridges.json        # NRHP bridges
  └── meta/
      ├── sitemap_states.json          # For XML sitemap generation
      ├── sitemap_counties.json
      └── all_codes.json               # Lookup tables
"""

import csv
import json
import os
import sys
import time
from datetime import datetime
from collections import defaultdict

# ─────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────

INPUT_FILE = "nbi_raw.csv"
OUTPUT_DIR = "data"

# ─────────────────────────────────────────────────────────
# LOOKUP TABLES
# ─────────────────────────────────────────────────────────

FIPS_TO_STATE = {
    "01":"AL","02":"AK","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT",
    "10":"DE","11":"DC","12":"FL","13":"GA","15":"HI","16":"ID","17":"IL",
    "18":"IN","19":"IA","20":"KS","21":"KY","22":"LA","23":"ME","24":"MD",
    "25":"MA","26":"MI","27":"MN","28":"MS","29":"MO","30":"MT","31":"NE",
    "32":"NV","33":"NH","34":"NJ","35":"NM","36":"NY","37":"NC","38":"ND",
    "39":"OH","40":"OK","41":"OR","42":"PA","44":"RI","45":"SC","46":"SD",
    "47":"TN","48":"TX","49":"UT","50":"VT","51":"VA","53":"WA","54":"WV",
    "55":"WI","56":"WY","66":"GU","72":"PR","78":"VI",
}

STATE_NAMES = {
    "AL":"Alabama","AK":"Alaska","AZ":"Arizona","AR":"Arkansas","CA":"California",
    "CO":"Colorado","CT":"Connecticut","DE":"Delaware","DC":"District of Columbia",
    "FL":"Florida","GA":"Georgia","HI":"Hawaii","ID":"Idaho","IL":"Illinois",
    "IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana",
    "ME":"Maine","MD":"Maryland","MA":"Massachusetts","MI":"Michigan","MN":"Minnesota",
    "MS":"Mississippi","MO":"Missouri","MT":"Montana","NE":"Nebraska","NV":"Nevada",
    "NH":"New Hampshire","NJ":"New Jersey","NM":"New Mexico","NY":"New York",
    "NC":"North Carolina","ND":"North Dakota","OH":"Ohio","OK":"Oklahoma",
    "OR":"Oregon","PA":"Pennsylvania","RI":"Rhode Island","SC":"South Carolina",
    "SD":"South Dakota","TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont",
    "VA":"Virginia","WA":"Washington","WV":"West Virginia","WI":"Wisconsin",
    "WY":"Wyoming","GU":"Guam","PR":"Puerto Rico","VI":"U.S. Virgin Islands",
}

MATERIAL_CODES = {
    "1":"Concrete","2":"Concrete Continuous","3":"Steel","4":"Steel Continuous",
    "5":"Prestressed Concrete","6":"Prestressed Concrete Continuous",
    "7":"Wood or Timber","8":"Masonry","9":"Aluminum/Wrought Iron/Cast Iron","0":"Other",
}

# Simplified material groups for charts
MATERIAL_GROUPS = {
    "1":"Concrete","2":"Concrete","3":"Steel","4":"Steel",
    "5":"Prestressed Concrete","6":"Prestressed Concrete",
    "7":"Wood/Timber","8":"Masonry","9":"Metal (Other)","0":"Other",
}

DESIGN_CODES = {
    "01":"Slab","02":"Stringer/Multi-beam or Girder","03":"Girder and Floorbeam",
    "04":"Tee Beam","05":"Box Beam - Multiple","06":"Box Beam - Single/Spread",
    "07":"Frame","08":"Orthotropic","09":"Truss - Deck","10":"Truss - Thru",
    "11":"Arch - Deck","12":"Arch - Thru","13":"Suspension","14":"Cable-Stayed",
    "15":"Movable - Lift","16":"Movable - Bascule","17":"Movable - Swing",
    "18":"Tunnel","19":"Culvert","20":"Mixed Types","21":"Segmental Box Girder",
    "22":"Channel Beam","00":"Other",
}

OWNER_CODES = {
    "01":"State Highway Agency","02":"County Highway Agency",
    "03":"Town/Township","04":"City/Municipal","11":"State Park/Forest",
    "12":"Local Park/Forest","21":"Other State","25":"Other Local",
    "26":"Private","27":"Railroad","31":"State Toll Authority",
    "32":"Local Toll Authority","60":"Other Federal","61":"Tribal",
    "62":"Bureau of Indian Affairs","63":"Fish and Wildlife",
    "64":"U.S. Forest Service","66":"National Park Service",
    "67":"TVA","68":"Bureau of Land Management","69":"Bureau of Reclamation",
    "70":"Corps of Engineers","80":"Unknown",
}

CONDITION_LABELS = {
    "9":"Excellent","8":"Very Good","7":"Good","6":"Satisfactory",
    "5":"Fair","4":"Poor","3":"Serious","2":"Critical",
    "1":"Imminent Failure","0":"Failed","N":"Not Applicable",
}

HISTORICAL_CODES = {
    "1":"On National Register of Historic Places","2":"Eligible for NRHP",
    "3":"Possibly eligible","4":"Not determined","5":"Not eligible",
}

ROUTE_PREFIX = {
    "1":"Interstate","2":"US Highway","3":"State Highway","4":"County Road",
    "5":"City Street","6":"Federal Lands","7":"State Lands","8":"Other",
}


# ─────────────────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────────────────

def safe_int(val, default=0):
    """Parse int from string, return default on failure."""
    try:
        return int(str(val).strip())
    except (ValueError, TypeError):
        return default

def safe_float(val, default=0.0):
    """Parse float from string, return default on failure."""
    try:
        return float(str(val).strip())
    except (ValueError, TypeError):
        return default

def parse_lat(raw):
    """Parse NBI latitude: DDMMSS.SS → decimal degrees."""
    try:
        raw = str(raw).strip()
        if len(raw) < 6:
            return None
        dd = int(raw[:2])
        mm = int(raw[2:4])
        ss = float(raw[4:])
        dec = dd + mm/60 + ss/3600
        return round(dec, 6) if dec > 0 else None
    except:
        return None

def parse_lon(raw):
    """Parse NBI longitude: DDDMMSS.SS → decimal degrees (negative for western hemisphere)."""
    try:
        raw = str(raw).strip()
        if len(raw) < 7:
            return None
        ddd = int(raw[:3])
        mm = int(raw[3:5])
        ss = float(raw[5:])
        dec = -(ddd + mm/60 + ss/3600)  # Western hemisphere = negative
        return round(dec, 6) if dec != 0 else None
    except:
        return None

def condition_category(rating):
    """Classify condition rating into Good/Fair/Poor."""
    try:
        r = int(str(rating).strip())
        if r >= 7:
            return "good"
        elif r >= 5:
            return "fair"
        else:
            return "poor"
    except:
        return None

def is_structurally_deficient(deck, superstructure, substructure, culvert):
    """
    Bridge is structurally deficient if ANY of deck/super/sub/culvert ≤ 4.
    Per FHWA 2018 revised definition.
    """
    for rating in [deck, superstructure, substructure, culvert]:
        try:
            r = int(str(rating).strip())
            if r <= 4:
                return True
        except:
            continue
    return False

def overall_condition(deck, superstructure, substructure, culvert):
    """
    Overall bridge condition = lowest of deck/super/sub (or culvert if applicable).
    Returns the lowest numeric rating found.
    """
    ratings = []
    for r in [deck, superstructure, substructure, culvert]:
        try:
            ratings.append(int(str(r).strip()))
        except:
            continue
    return min(ratings) if ratings else None

def slug(text):
    """Create URL-safe slug from text."""
    import re
    s = str(text).lower().strip()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'[\s]+', '-', s)
    s = re.sub(r'-+', '-', s)
    return s.strip('-')

def age_bracket(year_built, current_year=2024):
    """Categorize bridge by age."""
    if not year_built or year_built < 1800:
        return "Unknown"
    age = current_year - year_built
    if age <= 20:
        return "0-20 years"
    elif age <= 40:
        return "21-40 years"
    elif age <= 60:
        return "41-60 years"
    elif age <= 80:
        return "61-80 years"
    else:
        return "80+ years"

def makedirs(path):
    """Create directory if it doesn't exist."""
    os.makedirs(path, exist_ok=True)

def write_json(filepath, data):
    """Write JSON file with compact formatting."""
    with open(filepath, 'w') as f:
        json.dump(data, f, separators=(',', ':'))


# ─────────────────────────────────────────────────────────
# MAIN PIPELINE
# ─────────────────────────────────────────────────────────

def detect_columns(header_row):
    """
    Auto-detect column indices from the CSV header.
    NBI delimited files have headers like: STATE_CODE_001, STRUCTURE_NUMBER_008, etc.
    Returns a dict mapping our field names → column index.
    """
    col_map = {}
    for idx, col_name in enumerate(header_row):
        col_name = col_name.strip().strip("'").strip('"').upper()
        col_map[col_name] = idx
    return col_map


def parse_bridge(row, col_map):
    """Parse a single bridge record from CSV row using detected column map."""
    
    def get(field_name, default=""):
        """Get field value by NBI column name."""
        # Try exact match first
        if field_name in col_map:
            idx = col_map[field_name]
            if idx < len(row):
                return row[idx].strip().strip("'")
        # Try partial match
        for key, idx in col_map.items():
            if field_name in key:
                if idx < len(row):
                    return row[idx].strip().strip("'")
        return default
    
    # Core identification
    state_fips = get("STATE_CODE_001", get("STATE_CODE", "")).zfill(2)
    state_abbr = FIPS_TO_STATE.get(state_fips, "")
    if not state_abbr:
        return None
    
    structure_num = get("STRUCTURE_NUMBER_008", get("STRUCTURE_NUMBER", ""))
    if not structure_num:
        return None
    
    # Location
    county_fips = get("COUNTY_CODE_003", get("COUNTY_CODE", "")).zfill(3)
    place_fips = get("PLACE_CODE_004", get("PLACE_CODE", "")).zfill(5)
    location = get("LOCATION_009", get("LOCATION", ""))
    features = get("FEATURES_DESC_006A", get("FEATURES_DESC", ""))
    facility = get("FACILITY_CARRIED_007", get("FACILITY_CARRIED", ""))
    
    lat = parse_lat(get("LAT_016", get("LAT", "")))
    lon = parse_lon(get("LONG_017", get("LONG", "")))
    
    # Classification
    route_prefix = get("ROUTE_PREFIX_005B", get("ROUTE_PREFIX", ""))
    route_number = get("ROUTE_NUMBER_005D", get("ROUTE_NUMBER", "")).strip("0") or "0"
    owner = get("OWNER_022", get("OWNER", "")).zfill(2)
    func_class = get("FUNCTIONAL_CLASS_026", get("FUNCTIONAL_CLASS", ""))
    
    # Structure info
    year_built = safe_int(get("YEAR_BUILT_027", get("YEAR_BUILT", "")))
    year_reconstructed = safe_int(get("YEAR_RECONSTRUCTED_106", get("YEAR_RECONSTRUCTED", "")))
    material = get("STRUCTURE_KIND_043A", get("STRUCTURE_KIND", ""))
    design_type = get("STRUCTURE_TYPE_043B", get("STRUCTURE_TYPE", "")).zfill(2)
    lanes_on = safe_int(get("TRAFFIC_LANES_ON_028A", get("TRAFFIC_LANES_ON", "")))
    lanes_under = safe_int(get("TRAFFIC_LANES_UND_028B", get("TRAFFIC_LANES_UND", "")))
    
    # Dimensions (stored in tenths of meters in NBI)
    max_span = safe_float(get("MAX_SPAN_LEN_MT_048", get("MAX_SPAN_LEN", ""))) / 10.0
    structure_len = safe_float(get("STRUCTURE_LEN_MT_049", get("STRUCTURE_LEN", ""))) / 10.0
    deck_width = safe_float(get("DECK_WIDTH_MT_052", get("DECK_WIDTH", ""))) / 10.0
    roadway_width = safe_float(get("ROADWAY_WIDTH_MT_051", get("ROADWAY_WIDTH", ""))) / 10.0
    
    # Traffic
    adt = safe_int(get("ADT_029", get("ADT", "")))
    adt_year = safe_int(get("YEAR_ADT_030", get("YEAR_ADT", "")))
    truck_pct = safe_int(get("PERCENT_ADT_TRUCK_109", get("PERCENT_ADT_TRUCK", "")))
    future_adt = safe_int(get("FUTURE_ADT_114", get("FUTURE_ADT", "")))
    
    # Condition ratings (0-9 scale, or N for not applicable)
    deck_cond = get("DECK_COND_058", get("DECK_COND", ""))
    super_cond = get("SUPERSTRUCTURE_COND_059", get("SUPERSTRUCTURE_COND", ""))
    sub_cond = get("SUBSTRUCTURE_COND_060", get("SUBSTRUCTURE_COND", ""))
    culvert_cond = get("CULVERT_COND_062", get("CULVERT_COND", ""))
    channel_cond = get("CHANNEL_COND_061", get("CHANNEL_COND", ""))
    
    # Derived condition
    lowest = overall_condition(deck_cond, super_cond, sub_cond, culvert_cond)
    sd = is_structurally_deficient(deck_cond, super_cond, sub_cond, culvert_cond)
    cond_cat = condition_category(lowest) if lowest is not None else None
    
    # Operating/Inventory ratings
    op_rating = safe_float(get("OPERATING_RATING_064", get("OPERATING_RATING", ""))) / 10.0
    inv_rating = safe_float(get("INVENTORY_RATING_066", get("INVENTORY_RATING", ""))) / 10.0
    
    # Other
    toll = get("TOLL_020", get("TOLL", ""))
    historical = get("HISTORY_037", get("HISTORY", ""))
    scour = get("SCOUR_CRITICAL_113", get("SCOUR_CRITICAL", ""))
    deck_area = safe_float(get("DECK_AREA", get("CAT29", "")))
    
    # Inspection
    insp_date_raw = get("DATE_OF_INSPECT_090", get("INSPECT_DATE", get("INSPECTION_DATE", "")))
    detour_km = safe_int(get("DETOUR_KILOS_019", get("DETOUR_KILOS", "")))
    
    # Open/closed status
    status = get("OPEN_CLOSED_POSTED_041", get("OPEN_CLOSED_POSTED", ""))
    
    # Build the bridge object
    bridge = {
        "id": f"{state_abbr}-{structure_num}",
        "structureNumber": structure_num,
        "state": state_abbr,
        "stateFips": state_fips,
        "stateName": STATE_NAMES.get(state_abbr, ""),
        "countyFips": county_fips,
        "placeFips": place_fips,
        "location": location,
        "featuresIntersected": features,
        "facilityCarried": facility,
        "lat": lat,
        "lon": lon,
        "routePrefix": route_prefix,
        "routePrefixName": ROUTE_PREFIX.get(route_prefix, "Other"),
        "routeNumber": route_number,
        "owner": owner,
        "ownerName": OWNER_CODES.get(owner, "Unknown"),
        "functionalClass": func_class,
        "yearBuilt": year_built if year_built > 1800 else None,
        "yearReconstructed": year_reconstructed if year_reconstructed > 1800 else None,
        "material": material,
        "materialName": MATERIAL_CODES.get(material, "Unknown"),
        "materialGroup": MATERIAL_GROUPS.get(material, "Other"),
        "designType": design_type,
        "designTypeName": DESIGN_CODES.get(design_type, "Unknown"),
        "lanesOn": lanes_on,
        "lanesUnder": lanes_under,
        "maxSpanM": round(max_span, 1) if max_span > 0 else None,
        "maxSpanFt": round(max_span * 3.28084, 1) if max_span > 0 else None,
        "lengthM": round(structure_len, 1) if structure_len > 0 else None,
        "lengthFt": round(structure_len * 3.28084, 1) if structure_len > 0 else None,
        "deckWidthM": round(deck_width, 1) if deck_width > 0 else None,
        "deckWidthFt": round(deck_width * 3.28084, 1) if deck_width > 0 else None,
        "roadwayWidthM": round(roadway_width, 1) if roadway_width > 0 else None,
        "adt": adt if adt > 0 else None,
        "adtYear": adt_year if adt_year > 1900 else None,
        "truckPct": truck_pct if truck_pct > 0 else None,
        "futureAdt": future_adt if future_adt > 0 else None,
        "deckCondition": deck_cond if deck_cond not in ("", "N") else None,
        "superstructureCondition": super_cond if super_cond not in ("", "N") else None,
        "substructureCondition": sub_cond if sub_cond not in ("", "N") else None,
        "culvertCondition": culvert_cond if culvert_cond not in ("", "N") else None,
        "channelCondition": channel_cond if channel_cond not in ("", "N") else None,
        "lowestRating": lowest,
        "conditionCategory": cond_cat,
        "structurallyDeficient": sd,
        "operatingRating": round(op_rating, 1) if op_rating > 0 else None,
        "inventoryRating": round(inv_rating, 1) if inv_rating > 0 else None,
        "toll": toll == "1" or toll == "2",
        "historical": historical,
        "historicalName": HISTORICAL_CODES.get(historical, None),
        "scourCritical": scour,
        "detourKm": detour_km if detour_km > 0 else None,
        "status": status,
        "deckArea": round(deck_area, 1) if deck_area > 0 else None,
    }
    
    return bridge


def aggregate_stats(bridges):
    """Compute aggregate statistics from a list of bridge dicts."""
    total = len(bridges)
    if total == 0:
        return {"total": 0}
    
    # Condition counts
    good = sum(1 for b in bridges if b["conditionCategory"] == "good")
    fair = sum(1 for b in bridges if b["conditionCategory"] == "fair")
    poor = sum(1 for b in bridges if b["conditionCategory"] == "poor")
    sd = sum(1 for b in bridges if b["structurallyDeficient"])
    
    # Material distribution
    materials = defaultdict(int)
    for b in bridges:
        materials[b["materialGroup"]] += 1
    
    # Design type distribution
    designs = defaultdict(int)
    for b in bridges:
        designs[b["designTypeName"]] += 1
    
    # Age distribution
    ages = defaultdict(int)
    for b in bridges:
        if b["yearBuilt"]:
            ages[age_bracket(b["yearBuilt"])] += 1
    
    # Owner distribution
    owners = defaultdict(int)
    for b in bridges:
        owners[b["ownerName"]] += 1
    
    # Average daily traffic
    adt_bridges = [b for b in bridges if b["adt"] and b["adt"] > 0]
    avg_adt = round(sum(b["adt"] for b in adt_bridges) / len(adt_bridges)) if adt_bridges else 0
    total_daily_crossings = sum(b["adt"] for b in adt_bridges)
    
    # Year built stats
    years = [b["yearBuilt"] for b in bridges if b["yearBuilt"] and b["yearBuilt"] > 1800]
    avg_year = round(sum(years) / len(years)) if years else None
    oldest_year = min(years) if years else None
    newest_year = max(years) if years else None
    
    # Avg length
    lengths = [b["lengthFt"] for b in bridges if b["lengthFt"] and b["lengthFt"] > 0]
    avg_length = round(sum(lengths) / len(lengths), 1) if lengths else None
    
    # Condition rating distribution (0-9)
    rating_dist = defaultdict(int)
    for b in bridges:
        if b["lowestRating"] is not None:
            rating_dist[str(b["lowestRating"])] += 1
    
    return {
        "total": total,
        "good": good,
        "fair": fair,
        "poor": poor,
        "structurallyDeficient": sd,
        "goodPct": round(good / total * 100, 1),
        "fairPct": round(fair / total * 100, 1),
        "poorPct": round(poor / total * 100, 1),
        "sdPct": round(sd / total * 100, 1),
        "materials": dict(sorted(materials.items(), key=lambda x: x[1], reverse=True)),
        "designTypes": dict(sorted(designs.items(), key=lambda x: x[1], reverse=True)),
        "ageDistribution": dict(ages),
        "owners": dict(sorted(owners.items(), key=lambda x: x[1], reverse=True)),
        "avgAdt": avg_adt,
        "totalDailyCrossings": total_daily_crossings,
        "avgYearBuilt": avg_year,
        "oldestYear": oldest_year,
        "newestYear": newest_year,
        "avgLengthFt": avg_length,
        "ratingDistribution": dict(sorted(rating_dist.items())),
    }


def top_bridges(bridges, key, n=500, reverse=True, filter_fn=None):
    """Get top N bridges sorted by key, returning slim records for ranking pages."""
    filtered = bridges if not filter_fn else [b for b in bridges if filter_fn(b)]
    valid = [b for b in filtered if b.get(key) is not None]
    sorted_list = sorted(valid, key=lambda b: b[key], reverse=reverse)[:n]
    
    return [{
        "id": b["id"],
        "state": b["state"],
        "stateName": b["stateName"],
        "countyFips": b["countyFips"],
        "facilityCarried": b["facilityCarried"],
        "featuresIntersected": b["featuresIntersected"],
        "location": b["location"],
        "lat": b["lat"],
        "lon": b["lon"],
        key: b[key],
        "yearBuilt": b["yearBuilt"],
        "adt": b["adt"],
        "lowestRating": b["lowestRating"],
        "conditionCategory": b["conditionCategory"],
        "structurallyDeficient": b["structurallyDeficient"],
        "materialName": b["materialName"],
        "designTypeName": b["designTypeName"],
        "lengthFt": b["lengthFt"],
    } for b in sorted_list]


def main():
    start_time = time.time()
    
    # ─── Check input file ───
    if not os.path.exists(INPUT_FILE):
        print(f"ERROR: {INPUT_FILE} not found!")
        print(f"Download from: https://www.fhwa.dot.gov/bridge/nbi/ascii2024.cfm")
        print(f"Get 'Highway Bridges for all States (single file)' → Delimited → zip")
        print(f"Extract and rename to {INPUT_FILE}")
        sys.exit(1)
    
    file_size = os.path.getsize(INPUT_FILE) / (1024 * 1024)
    print(f"📁 Input: {INPUT_FILE} ({file_size:.1f} MB)")
    print(f"📂 Output: {OUTPUT_DIR}/")
    print()
    
    # ─── Create output directories ───
    makedirs(f"{OUTPUT_DIR}/states")
    makedirs(f"{OUTPUT_DIR}/rankings")
    makedirs(f"{OUTPUT_DIR}/meta")
    
    # ─── PASS 1: Parse all bridges ───
    print("━━━ PASS 1: Parsing all bridge records ━━━")
    
    all_bridges = []
    by_state = defaultdict(list)
    by_county = defaultdict(lambda: defaultdict(list))
    by_city = defaultdict(lambda: defaultdict(list))
    
    errors = 0
    
    with open(INPUT_FILE, 'r', encoding='utf-8', errors='replace') as f:
        # Detect delimiter — try comma first
        first_line = f.readline()
        f.seek(0)
        
        # NBI delimited files use comma separator, single-quote text qualifier
        delimiter = ','
        quotechar = "'"
        
        reader = csv.reader(f, delimiter=delimiter, quotechar=quotechar)
        
        # Read header
        header = next(reader)
        col_map = detect_columns(header)
        
        print(f"  Detected {len(col_map)} columns")
        print(f"  Sample columns: {list(col_map.keys())[:5]}...")
        print()
        
        for row_num, row in enumerate(reader, 2):
            if row_num % 100000 == 0:
                print(f"  Processed {row_num:,} rows...")
            
            try:
                bridge = parse_bridge(row, col_map)
                if bridge is None:
                    errors += 1
                    continue
                
                all_bridges.append(bridge)
                st = bridge["state"]
                by_state[st].append(bridge)
                by_county[st][bridge["countyFips"]].append(bridge)
                if bridge["placeFips"] and bridge["placeFips"] != "00000":
                    by_city[st][bridge["placeFips"]].append(bridge)
            except Exception as e:
                errors += 1
                if errors <= 10:
                    print(f"  ⚠ Row {row_num} error: {e}")
    
    print(f"\n  ✅ Parsed {len(all_bridges):,} bridges ({errors:,} errors)")
    print(f"  States: {len(by_state)}")
    
    total_counties = sum(len(counties) for counties in by_county.values())
    total_cities = sum(len(cities) for cities in by_city.values())
    print(f"  Counties: {total_counties:,}")
    print(f"  Cities/Places: {total_cities:,}")
    print()
    
    # ─── PASS 2: Generate national summary ───
    print("━━━ PASS 2: National summary ━━━")
    
    national_stats = aggregate_stats(all_bridges)
    national_stats["generatedAt"] = datetime.now().isoformat()
    national_stats["source"] = "FHWA National Bridge Inventory 2024"
    national_stats["sourceUrl"] = "https://www.fhwa.dot.gov/bridge/nbi/ascii2024.cfm"
    
    write_json(f"{OUTPUT_DIR}/national.json", national_stats)
    print(f"  ✅ national.json — {national_stats['total']:,} bridges")
    print(f"     Good: {national_stats['good']:,} ({national_stats['goodPct']}%)")
    print(f"     Fair: {national_stats['fair']:,} ({national_stats['fairPct']}%)")
    print(f"     Poor: {national_stats['poor']:,} ({national_stats['poorPct']}%)")
    print()
    
    # ─── PASS 3: State summaries ───
    print("━━━ PASS 3: State summaries ━━━")
    
    state_rankings = []
    
    for st_abbr in sorted(by_state.keys()):
        bridges = by_state[st_abbr]
        stats = aggregate_stats(bridges)
        
        # Add state metadata
        stats["state"] = st_abbr
        stats["stateName"] = STATE_NAMES.get(st_abbr, "")
        stats["countyCount"] = len(by_county.get(st_abbr, {}))
        stats["cityCount"] = len(by_city.get(st_abbr, {}))
        
        # Top 10 counties by bridge count
        county_list = []
        for cfips, cbs in sorted(by_county[st_abbr].items(), key=lambda x: len(x[1]), reverse=True)[:20]:
            cs = aggregate_stats(cbs)
            county_list.append({
                "fips": cfips,
                "total": cs["total"],
                "poor": cs["poor"],
                "poorPct": cs["poorPct"],
                "avgAdt": cs["avgAdt"],
            })
        stats["topCounties"] = county_list
        
        # Top 10 worst bridges in state
        worst = top_bridges(bridges, "lowestRating", n=10, reverse=False,
                           filter_fn=lambda b: b["lowestRating"] is not None and b["lowestRating"] <= 4)
        stats["worstBridges"] = worst
        
        # Top 10 most trafficked
        most_traffic = top_bridges(bridges, "adt", n=10, reverse=True)
        stats["mostTrafficked"] = most_traffic
        
        write_json(f"{OUTPUT_DIR}/states/{st_abbr}.json", stats)
        
        state_rankings.append({
            "state": st_abbr,
            "stateName": STATE_NAMES.get(st_abbr, ""),
            "total": stats["total"],
            "good": stats["good"],
            "fair": stats["fair"],
            "poor": stats["poor"],
            "goodPct": stats["goodPct"],
            "fairPct": stats["fairPct"],
            "poorPct": stats["poorPct"],
            "sdPct": stats["sdPct"],
            "avgAdt": stats["avgAdt"],
            "avgYearBuilt": stats["avgYearBuilt"],
        })
    
    print(f"  ✅ {len(by_state)} state files")
    print()
    
    # ─── PASS 4: County summaries ───
    print("━━━ PASS 4: County summaries ━━━")
    
    county_count = 0
    county_sitemap = []
    
    for st_abbr in sorted(by_county.keys()):
        makedirs(f"{OUTPUT_DIR}/counties/{st_abbr}")
        
        for cfips in sorted(by_county[st_abbr].keys()):
            bridges = by_county[st_abbr][cfips]
            stats = aggregate_stats(bridges)
            stats["state"] = st_abbr
            stats["stateName"] = STATE_NAMES.get(st_abbr, "")
            stats["countyFips"] = cfips
            stats["fullFips"] = f"{FIPS_TO_STATE.get(st_abbr, '')}{cfips}" if st_abbr else ""
            
            # List all bridges in county (slim version for table)
            stats["bridges"] = [{
                "id": b["id"],
                "structureNumber": b["structureNumber"],
                "facilityCarried": b["facilityCarried"],
                "featuresIntersected": b["featuresIntersected"],
                "location": b["location"],
                "yearBuilt": b["yearBuilt"],
                "materialName": b["materialName"],
                "lowestRating": b["lowestRating"],
                "conditionCategory": b["conditionCategory"],
                "structurallyDeficient": b["structurallyDeficient"],
                "adt": b["adt"],
                "lengthFt": b["lengthFt"],
                "lat": b["lat"],
                "lon": b["lon"],
            } for b in sorted(bridges, key=lambda x: x.get("lowestRating") or 99)]
            
            write_json(f"{OUTPUT_DIR}/counties/{st_abbr}/{cfips}.json", stats)
            county_count += 1
            
            county_sitemap.append({
                "state": st_abbr,
                "fips": cfips,
                "total": stats["total"],
                "poor": stats["poor"],
            })
    
    print(f"  ✅ {county_count:,} county files")
    print()
    
    # ─── PASS 5: City summaries ───
    print("━━━ PASS 5: City/place summaries ━━━")
    
    city_count = 0
    
    for st_abbr in sorted(by_city.keys()):
        makedirs(f"{OUTPUT_DIR}/cities/{st_abbr}")
        
        for pfips in sorted(by_city[st_abbr].keys()):
            bridges = by_city[st_abbr][pfips]
            if len(bridges) < 2:  # Skip places with only 1 bridge
                continue
            
            stats = aggregate_stats(bridges)
            stats["state"] = st_abbr
            stats["stateName"] = STATE_NAMES.get(st_abbr, "")
            stats["placeFips"] = pfips
            
            # Bridge list for city page
            stats["bridges"] = [{
                "id": b["id"],
                "structureNumber": b["structureNumber"],
                "facilityCarried": b["facilityCarried"],
                "featuresIntersected": b["featuresIntersected"],
                "location": b["location"],
                "yearBuilt": b["yearBuilt"],
                "lowestRating": b["lowestRating"],
                "conditionCategory": b["conditionCategory"],
                "adt": b["adt"],
                "lengthFt": b["lengthFt"],
            } for b in sorted(bridges, key=lambda x: x.get("lowestRating") or 99)]
            
            write_json(f"{OUTPUT_DIR}/cities/{st_abbr}/{pfips}.json", stats)
            city_count += 1
    
    print(f"  ✅ {city_count:,} city/place files")
    print()
    
    # ─── PASS 6: Individual bridge files ───
    print("━━━ PASS 6: Individual bridge files ━━━")
    
    bridge_count = 0
    for st_abbr in sorted(by_state.keys()):
        makedirs(f"{OUTPUT_DIR}/bridges/{st_abbr}")
        
        for bridge in by_state[st_abbr]:
            # Sanitize structure number for filename
            safe_id = bridge["structureNumber"].replace("/", "_").replace("\\", "_").replace(" ", "_")
            write_json(f"{OUTPUT_DIR}/bridges/{st_abbr}/{safe_id}.json", bridge)
            bridge_count += 1
        
        if bridge_count % 50000 == 0:
            print(f"  Written {bridge_count:,} bridge files...")
    
    print(f"  ✅ {bridge_count:,} bridge files")
    print()
    
    # ─── PASS 7: Rankings ───
    print("━━━ PASS 7: Rankings ━━━")
    
    # State rankings
    worst_states = sorted(state_rankings, key=lambda x: x["poorPct"], reverse=True)
    write_json(f"{OUTPUT_DIR}/rankings/worst_states.json", worst_states)
    
    best_states = sorted(state_rankings, key=lambda x: x["goodPct"], reverse=True)
    write_json(f"{OUTPUT_DIR}/rankings/best_states.json", best_states)
    
    # Bridge rankings
    write_json(f"{OUTPUT_DIR}/rankings/longest_bridges.json",
               top_bridges(all_bridges, "lengthFt", n=500))
    
    write_json(f"{OUTPUT_DIR}/rankings/oldest_bridges.json",
               top_bridges(all_bridges, "yearBuilt", n=500, reverse=False,
                          filter_fn=lambda b: b["yearBuilt"] and b["yearBuilt"] > 1800))
    
    write_json(f"{OUTPUT_DIR}/rankings/most_trafficked.json",
               top_bridges(all_bridges, "adt", n=500))
    
    # Include all bridges rated 0-3 (failed, imminent failure, critical, serious)
    write_json(f"{OUTPUT_DIR}/rankings/worst_condition.json",
               top_bridges(all_bridges, "lowestRating", n=10000, reverse=False,
                          filter_fn=lambda b: b["lowestRating"] is not None and b["lowestRating"] <= 3))
    
    write_json(f"{OUTPUT_DIR}/rankings/longest_span.json",
               top_bridges(all_bridges, "maxSpanFt", n=500))
    
    # Historic bridges
    historic = [b for b in all_bridges if b.get("historical") in ("1", "2")]
    write_json(f"{OUTPUT_DIR}/rankings/historic_bridges.json",
               top_bridges(historic, "yearBuilt", n=500, reverse=False,
                          filter_fn=lambda b: b["yearBuilt"] and b["yearBuilt"] > 1700))
    
    print(f"  ✅ 7 ranking files")
    print()
    
    # ─── PASS 8: Meta/sitemap files ───
    print("━━━ PASS 8: Meta & sitemap data ━━━")
    
    write_json(f"{OUTPUT_DIR}/meta/sitemap_states.json", state_rankings)
    write_json(f"{OUTPUT_DIR}/meta/sitemap_counties.json", county_sitemap)
    write_json(f"{OUTPUT_DIR}/meta/all_codes.json", {
        "materials": MATERIAL_CODES,
        "materialGroups": MATERIAL_GROUPS,
        "designs": DESIGN_CODES,
        "owners": OWNER_CODES,
        "conditions": CONDITION_LABELS,
        "historical": HISTORICAL_CODES,
        "routePrefix": ROUTE_PREFIX,
        "fipsStates": FIPS_TO_STATE,
        "stateNames": STATE_NAMES,
    })
    
    print(f"  ✅ Meta files written")
    print()
    
    # ─── Summary ───
    elapsed = time.time() - start_time
    total_files = len(by_state) + county_count + city_count + bridge_count + 7 + 3 + 1
    
    print("━" * 60)
    print(f"✅ COMPLETE in {elapsed:.0f}s")
    print(f"━" * 60)
    print(f"  Total bridges:   {len(all_bridges):>10,}")
    print(f"  State files:     {len(by_state):>10,}")
    print(f"  County files:    {county_count:>10,}")
    print(f"  City files:      {city_count:>10,}")
    print(f"  Bridge files:    {bridge_count:>10,}")
    print(f"  Ranking files:   {7:>10,}")
    print(f"  Meta files:      {3:>10,}")
    print(f"  ─────────────────────────")
    print(f"  TOTAL FILES:     {total_files:>10,}")
    print()
    print(f"  Output directory: {os.path.abspath(OUTPUT_DIR)}")
    print(f"  Next step: Copy data/ to your Next.js project")
    print()


if __name__ == "__main__":
    main()
