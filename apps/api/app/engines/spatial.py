# spatial.py - EarthMind AI Spatial Intelligence Engine
import numpy as np
from sklearn.cluster import DBSCAN
try:
    import h3
except ImportError:
    h3 = None

def get_h3_index(lat: float, lng: float, resolution: int = 9) -> str:
    """Converts a latitude/longitude pair into an H3 hexagonal string index."""
    if not h3:
        return "h3_missing"
    try:
        return str(h3.latlng_to_cell(lat, lng, resolution))
    except AttributeError:
        # Fallback for older h3-py versions if encountered
        return str(h3.geo_to_h3(lat, lng, resolution))

def calculate_iou(boxA: list, boxB: list) -> float:
    """
    Calculates the Intersection over Union (IoU) of two bounding boxes.
    Boxes are expected in [x_min, y_min, x_max, y_max] format.
    """
    if not boxA or not boxB or len(boxA) != 4 or len(boxB) != 4:
        return 0.0

    # Determine coordinates of the intersection rectangle
    x_left = max(boxA[0], boxB[0])
    y_top = max(boxA[1], boxB[1])
    x_right = min(boxA[2], boxB[2])
    y_bottom = min(boxA[3], boxB[3])

    if x_right < x_left or y_bottom < y_top:
        return 0.0

    intersection_area = (x_right - x_left) * (y_bottom - y_top)

    boxA_area = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    boxB_area = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])

    union_area = float(boxA_area + boxB_area - intersection_area)
    if union_area == 0:
        return 0.0

    return intersection_area / union_area

def deduplicate_detections(detections: list, iou_threshold: float = 0.6) -> list:
    """
    Fuses overlapping bounding boxes of the same class using Non-Maximum Suppression (NMS).
    Retains the detection with the highest confidence.
    """
    if not detections:
        return []
        
    # Group by label
    grouped = {}
    for d in detections:
        label = d.get('label', 'unknown')
        if label not in grouped:
            grouped[label] = []
        grouped[label].append(d)
        
    final_detections = []
    
    for label, items in grouped.items():
        # Sort by confidence descending
        items = sorted(items, key=lambda x: x.get('confidence', 0.0), reverse=True)
        keep = []
        
        for item in items:
            box = item.get('box')
            if not box:
                # If no bounding box, just keep it (e.g. image-level classification)
                keep.append(item)
                continue
                
            overlap = False
            for k in keep:
                if 'box' in k and calculate_iou(box, k['box']) > iou_threshold:
                    overlap = True
                    break
            
            if not overlap:
                keep.append(item)
                
        final_detections.extend(keep)
        
    return final_detections

def cluster_incidents_dbscan(incidents: list, eps_km: float = 0.5, min_samples: int = 5) -> dict:
    """
    Uses DBSCAN to cluster raw citizen incident coordinates.
    Returns the cluster IDs for each incident and identifies noise vs. verified hotspots.
    """
    if not incidents or len(incidents) < min_samples:
        return {"clusters": {}, "noise": incidents, "hotspots": []}
        
    coords = np.array([[inc.get('latitude', 0.0), inc.get('longitude', 0.0)] for inc in incidents])
    
    # DBSCAN requires distance metric. We can use haversine with radians.
    # eps in radians = eps_km / earth_radius_km
    eps_rad = eps_km / 6371.0
    
    db = DBSCAN(eps=eps_rad, min_samples=min_samples, algorithm='ball_tree', metric='haversine')
    
    # Convert coords to radians for sklearn haversine metric
    coords_rad = np.radians(coords)
    labels = db.fit_predict(coords_rad)
    
    clusters = {}
    noise = []
    hotspots = []
    
    for idx, label in enumerate(labels):
        inc = incidents[idx]
        if label == -1:
            noise.append(inc)
        else:
            if label not in clusters:
                clusters[label] = []
            clusters[label].append(inc)
            
    # Compute center for each hotspot
    for label, cluster_items in clusters.items():
        lats = [c['latitude'] for c in cluster_items]
        lngs = [c['longitude'] for c in cluster_items]
        hotspots.append({
            "cluster_id": int(label),
            "size": len(cluster_items),
            "center_lat": sum(lats)/len(lats),
            "center_lng": sum(lngs)/len(lngs)
        })
        
    return {
        "clusters": clusters,
        "noise": noise,
        "hotspots": hotspots
    }
