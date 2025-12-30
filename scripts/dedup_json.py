import json
import re

file_path = 'src/assets/oed_abbreviations.json'

def clean_json():
    with open(file_path, 'r') as f:
        lines = f.readlines()

    # We will manually parse to handle duplicates by keeping the one we want
    # Strategies:
    # 1. Store all entries.
    # 2. If duplicate key, prefer value that is all uppercase and no dots (Standard) over mixed/dots (OED).
    
    data = {}
    
    # Regex to capture key and value from line: "key": "value"
    # Handling potential trailing commas
    pattern = re.compile(r'^\s*"([^"]+)"\s*:\s*"([^"]+)"')
    
    for line in lines:
        match = pattern.match(line)
        if match:
            key = match.group(1)
            val = match.group(2)
            
            if key in data:
                existing_val = data[key]
                # If new val is "better", replace.
                # Definition of better: All caps (standard) is better than mixed/dot.
                # Examples: BLK > blk.
                
                if val.isupper() and "." not in val:
                    data[key] = val
                    print(f"Replacing {key}: {existing_val} -> {val}")
                else:
                    print(f"Keeping {key}: {existing_val} (Ignoring {val})")
            else:
                data[key] = val
                
    # Rewrite file
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2, sort_keys=True)
        
    print(f"Cleaned {file_path}")

if __name__ == '__main__':
    clean_json()
