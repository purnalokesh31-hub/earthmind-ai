# dispatch.py - EarthMind AI Dispatch Engine
import heapq
import numpy as np
from scipy.optimize import linear_sum_assignment

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance between two points on the earth in km."""
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = np.sin(dlat/2.0)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2.0)**2
    c = 2 * np.arcsin(np.sqrt(a)) 
    r = 6371 # Radius of earth in kilometers
    return c * r

class IncidentPriorityQueue:
    def __init__(self):
        # Python's heapq is a min-heap. We push negative priorities to simulate a max-heap.
        self._heap = []
        
    def add_incident(self, case_id: str, severity_score: float, impact_radius_km: float, estimated_repair_time_hrs: float, travel_distance_km: float):
        """
        Priority = (Severity Score * Impact Radius) / (log2(Estimated Repair Time + 1) * Travel Distance)
        """
        if travel_distance_km <= 0:
            travel_distance_km = 0.1 # Prevent div by zero
            
        priority = (severity_score * impact_radius_km) / (np.log2(estimated_repair_time_hrs + 1) * travel_distance_km)
        
        # Max-heap via negative priority
        heapq.heappush(self._heap, (-priority, case_id))
        
    def pop_highest_priority(self):
        if self._heap:
            priority, case_id = heapq.heappop(self._heap)
            return (-priority, case_id)
        return None
        
    def is_empty(self):
        return len(self._heap) == 0

def optimize_dispatch(incidents: list, officers: list) -> dict:
    """
    Uses Hungarian Algorithm (Minimum Weight Bipartite Matching) to optimally 
    assign N active incidents to M field officers based on latency (travel distance).
    
    incidents: list of dict with 'case_id', 'latitude', 'longitude'
    officers: list of dict with 'officer_id', 'latitude', 'longitude'
    
    Returns: dict mapping officer_id -> assigned case data
    """
    if not incidents or not officers:
        return {}
        
    n_incidents = len(incidents)
    m_officers = len(officers)
    
    # Cost matrix (m_officers x n_incidents)
    cost_matrix = np.zeros((m_officers, n_incidents))
    
    for i, off in enumerate(officers):
        for j, inc in enumerate(incidents):
            dist = haversine_distance(off['latitude'], off['longitude'], inc['latitude'], inc['longitude'])
            cost_matrix[i, j] = dist
            
    # linear_sum_assignment finds the minimum cost matching
    row_ind, col_ind = linear_sum_assignment(cost_matrix)
    
    assignments = {}
    for i in range(len(row_ind)):
        officer_idx = row_ind[i]
        incident_idx = col_ind[i]
        assignments[officers[officer_idx]['officer_id']] = {
            "case_id": incidents[incident_idx]['case_id'],
            "distance_km": round(cost_matrix[officer_idx, incident_idx], 2)
        }
        
    return assignments
