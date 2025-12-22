import xml.etree.ElementTree as ET
import math
import random

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hex(rgb):
    return '#{:02x}{:02x}{:02x}'.format(int(rgb[0]), int(rgb[1]), int(rgb[2]))

def color_distance(c1, c2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

def k_means(colors, k=2, max_iterations=100):
    if not colors:
        return [], []
    
    # Initialize centroids randomly from the existing colors
    centroids = random.sample(colors, k) if len(colors) >= k else colors + [colors[0]] * (k - len(colors))
    
    for _ in range(max_iterations):
        clusters = [[] for _ in range(k)]
        for color in colors:
            distances = [color_distance(color, centroid) for centroid in centroids]
            closest_index = distances.index(min(distances))
            clusters[closest_index].append(color)
        
        new_centroids = []
        for cluster in clusters:
            if cluster:
                avg_color = tuple(sum(c[i] for c in cluster) / len(cluster) for i in range(3))
                new_centroids.append(avg_color)
            else:
                new_centroids.append(centroids[clusters.index(cluster)]) # Keep old centroid if cluster is empty
        
        if new_centroids == centroids:
            break
        centroids = new_centroids
        
    return clusters, centroids

def simplify_svg(input_path, output_path):
    ET.register_namespace('', "http://www.w3.org/2000/svg")
    try:
        tree = ET.parse(input_path)
        root = tree.getroot()
    except ET.ParseError:
        print(f"Error parsing {input_path}")
        return

    paths = [] # List of (rgb_color, d_string)
    
    # Namespace handling
    ns = {'svg': 'http://www.w3.org/2000/svg'}
    
    for path in root.findall('.//svg:path', ns):
        fill = path.get('fill')
        d = path.get('d')
        if fill and d:
            try:
                rgb = hex_to_rgb(fill)
                paths.append({'rgb': rgb, 'd': d})
            except ValueError:
                print(f"Skipping invalid color: {fill}")
                continue
    
    if not paths:
        print("No paths found with fill colors.")
        return

    all_colors = [p['rgb'] for p in paths]
    unique_colors = list(set(all_colors))
    
    print(f"Found {len(unique_colors)} unique colors.")
    
    # Cluster colors
    clusters, centroids = k_means(all_colors, k=2)
    
    # Determine which cluster is "dark" and which is "light" by luminance
    # Luminance = 0.2126*R + 0.7152*G + 0.0722*B
    def get_luminance(rgb):
        return 0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2]
        
    centroid_luminances = [get_luminance(c) for c in centroids]
    
    # Sort centroids and clusters by luminance (Darker first, then Lighter)
    sorted_pairs = sorted(zip(centroids, clusters), key=lambda x: get_luminance(x[0]))
    centroids = [p[0] for p in sorted_pairs]
    # We can't simply sort clusters list because we need to re-assign paths based on the centroids
    
    final_colors = [rgb_to_hex(c) for c in centroids]
    print(f"Calculated Average Colors: Dark={final_colors[0]}, Light={final_colors[1]}")
    
    # Group paths
    new_paths = {final_colors[0]: [], final_colors[1]: []}
    
    for p in paths:
        # Find closest centroid
        distances = [color_distance(p['rgb'], c) for c in centroids]
        closest_idx = distances.index(min(distances))
        target_hex = final_colors[closest_idx]
        new_paths[target_hex].append(p['d'])
        
    # Create new SVG
    new_root = ET.Element('svg', xmlns="http://www.w3.org/2000/svg", viewBox=root.get('viewBox', '0 0 996 966'))
    if root.get('width'): new_root.set('width', root.get('width'))
    if root.get('height'): new_root.set('height', root.get('height'))
    
    for hex_color, d_list in new_paths.items():
        if d_list:
            # Join all d strings
            full_d = " ".join(d_list)
            new_path_elem = ET.SubElement(new_root, 'path')
            new_path_elem.set('fill', hex_color)
            new_path_elem.set('d', full_d)
            
    tree = ET.ElementTree(new_root)
    tree.write(output_path, encoding='utf-8', xml_declaration=True)
    print(f"Simplified SVG written to {output_path}")

if __name__ == "__main__":
    simplify_svg('/home/michael/Code/Projects/open-e-commerce/public/logo-icon.svg', '/home/michael/Code/Projects/open-e-commerce/public/logo-icon-simplified.svg')
