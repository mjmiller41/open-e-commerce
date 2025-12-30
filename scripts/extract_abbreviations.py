import re
import json
import html

def extract_abbreviations(html_file, output_file):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Simple regex to find rows with at least two cells
    # Pattern: <tr>...<td>abbrev</td>...<td>full</td>...</tr>
    # Note: OED HTML structure might vary, but based on the JS, it's <td>Abbrev</td><td>Full</td>
    
    # Let's try to match <tr>.*?</tr> blocks first
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', content, re.DOTALL)
    
    mapping = {}
    
    for row in rows:
        cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL)
        if len(cells) >= 2:
            # Clean tags from cells
            abbrev_raw = re.sub(r'<[^>]+>', '', cells[0]).strip()
            full_raw = re.sub(r'<[^>]+>', '', cells[1]).strip()
            
            # Decode HTML entities
            abbrev = html.unescape(abbrev_raw)
            full_form = html.unescape(full_raw)
            
            if abbrev and full_form:
                # Clean full form: remove leading parenthetical context e.g., "(in dates) ante" -> "ante"
                cleaned_full = re.sub(r'^\([^)]+\)\s*', '', full_form).strip().lower()
                
                # Check for "See ..." entries or headers
                if "see " in cleaned_full or "see " in abbrev.lower():
                    continue

                mapping[cleaned_full] = abbrev

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(mapping, f, indent=2, sort_keys=True)
    
    print(f"Extracted {len(mapping)} abbreviations to {output_file}")

if __name__ == "__main__":
    extract_abbreviations('/home/michael/.gemini/oed_abbr.html', 'src/assets/oed_abbreviations.json')
