# scoring.py - EarthMind AI Incident Scoring & Recommendation Rules

import math

def calculate_severity_score(severity: str) -> float:
    """Returns numerical score corresponding to severity."""
    severity = severity.lower()
    mapping = {
        "low": 15.0,
        "medium": 40.0,
        "high": 75.0,
        "critical": 100.0
    }
    return mapping.get(severity, 15.0)

def calculate_earth_score_impact(severity: str, category: str, hours_elapsed: float = 0.0, distance_km: float = 0.0) -> float:
    """
    Computes penalty to be subtracted from regional Earth Score using Exponential Dynamic Decay
    and Spatial Spillover Penalty.
    """
    base_delta = calculate_severity_score(severity) * 0.1
    
    category = category.lower()
    multipliers = {
        "leakage": 1.5,      # Water loss is critical in drought-prone areas
        "garbage": 1.2,      # Sanitary hazard
        "dumping": 1.6,      # High chemical or physical land impact
        "smoke": 1.4,        # Instant air quality degradation
        "pothole": 1.0,
        "crack": 0.8
    }
    multiplier = multipliers.get(category, 1.0)
    
    # Cap maximum base delta impact to -25 points per incident
    S_0 = min(base_delta * multiplier, 25.0)
    
    # 1. Exponential Time Decay (S_t = S_0 * e^(-lambda * t))
    # Lambda = 0.0144 implies a half-life of ~48 hours
    decay_lambda = 0.0144
    S_t = S_0 * math.exp(-decay_lambda * hours_elapsed)
    
    # 2. Spatial Spillover Penalty (Gaussian distance penalty)
    # K(d) = e^(-d^2 / 2*sigma^2)
    sigma = 2.0  # 2km standard deviation for spillover
    if distance_km > 0:
        K_d = math.exp(-(distance_km**2) / (2 * sigma**2))
        S_t = S_t * K_d
        
    return round(S_t, 2)

def calculate_risk_score(severity: str, confidence: float, co_located_probabilities: list = None) -> float:
    """Computes composite risk score taking vision model confidence and compound risks into account."""
    severity_val = calculate_severity_score(severity)
    
    # Multi-Hazard Compound Risk Matrix: R_compound = 1 - Product(1 - P_k)
    if co_located_probabilities and len(co_located_probabilities) > 0:
        not_occurring_prob = (1.0 - confidence)
        for p in co_located_probabilities:
            not_occurring_prob *= (1.0 - p)
        compound_prob = 1.0 - not_occurring_prob
        composite_risk = (severity_val * 0.7) + (compound_prob * 30.0)
    else:
        # Standard isolated event computation
        composite_risk = (severity_val * 0.7) + (confidence * 30.0)
        
    return round(composite_risk, 1)

def generate_recommendations(domain: str, category: str, severity: str) -> dict:
    """Generates structured advice and action steps based on domain-rules."""
    severity = severity.lower()
    category = category.lower()
    
    actions = []
    urgency = "Standard"
    
    if severity == "critical":
        urgency = "Immediate"
        actions.append("Dispatch field emergency inspection team.")
        actions.append("Post hazard warnings and restrict public access.")
    elif severity == "high":
        urgency = "Urgent"
        actions.append("Schedule professional inspection within 24-48 hours.")
    else:
        urgency = "Routine"
        actions.append("Add to scheduled community inspection workflow.")

    # Domain specific additions
    if domain == "infrastructure":
        if category == "pothole":
            actions.append("Apply temporary cold patch or schedule road crew repair.")
        elif " streetlight" in category or "pole" in category:
            actions.append("Alert local electrical utility operator.")
    elif domain == "environment":
        if "dumping" in category or "garbage" in category:
            actions.append("Initiate local community cleanup event and verify waste sorting.")
        elif "smoke" in category:
            actions.append("Notify municipal environmental inspection office for air quality checks.")
    elif domain == "water":
        if "leak" in category:
            actions.append("Trigger pipe pressure review and dispatch utility valve operator.")

    return {
        "urgency": urgency,
        "action_steps": actions,
        "rationale": f"Calculated as {severity} priority incident under {domain}/{category} category."
    }


def calculate_ai_enhanced_risk_score(
    vision_confidence: float,
    vision_risk_score: float,
    severity: str,
    damage_type: str = "",
    failure_probability: float = 0.0,
    is_near_school: bool = False,
    is_near_hospital: bool = False,
    weather_rain_mm: float = 0.0,
    co_located_probabilities: list = None
) -> dict:
    """
    Computes a composite AI-enhanced risk score by fusing:
    1. Real vision model confidence + risk signal
    2. Structured severity score
    3. XGBoost failure probability
    4. Proximity escalation (school/hospital)
    5. Weather amplification (rain forecast)
    6. Multi-hazard compound risk matrix

    Returns a dict with final_score, contributing factors, and grade.
    """
    # 1. Base severity score (0-100)
    severity_val = calculate_severity_score(severity)

    # 2. Vision signal weight (vision model risk score, 0-100)
    #    Trust vision score more when confidence is high
    vision_weight = vision_confidence / 100.0  # 0.0 - 1.0
    vision_contribution = vision_risk_score * vision_weight  # 0 - 100

    # 3. Composite base = weighted blend of severity + vision
    base_score = (severity_val * 0.5) + (vision_contribution * 0.35) + (vision_confidence * 0.15)

    # 4. XGBoost failure probability amplifier (adds 0-20 pts)
    failure_boost = failure_probability * 20.0

    # 5. Proximity escalation (+12 pts near school or hospital)
    proximity_boost = 0.0
    if is_near_school:
        proximity_boost += 8.0
    if is_near_hospital:
        proximity_boost += 4.0

    # 6. Weather amplification: rain accelerates most hazards
    weather_boost = 0.0
    if weather_rain_mm > 0:
        # Logarithmic scale: 10mm → +3pts, 50mm → +8pts, 100mm → +12pts
        weather_boost = min(math.log1p(weather_rain_mm) * 2.4, 12.0)

    # 7. Multi-hazard compound risk matrix
    compound_boost = 0.0
    if co_located_probabilities and len(co_located_probabilities) > 0:
        not_occurring = (1.0 - vision_confidence / 100.0)
        for p in co_located_probabilities:
            not_occurring *= (1.0 - p)
        compound_prob = 1.0 - not_occurring
        compound_boost = compound_prob * 10.0

    # Final composite score
    raw_score = base_score + failure_boost + proximity_boost + weather_boost + compound_boost
    final_score = round(min(raw_score, 100.0), 1)

    # Risk grade
    if final_score >= 85:
        grade = "CRITICAL"
    elif final_score >= 65:
        grade = "HIGH"
    elif final_score >= 40:
        grade = "MEDIUM"
    else:
        grade = "LOW"

    return {
        "final_score": final_score,
        "grade": grade,
        "contributing_factors": {
            "severity_contribution": round(severity_val * 0.5, 1),
            "vision_contribution": round(vision_contribution * 0.35, 1),
            "confidence_contribution": round(vision_confidence * 0.15, 1),
            "failure_probability_boost": round(failure_boost, 1),
            "proximity_boost": round(proximity_boost, 1),
            "weather_boost": round(weather_boost, 1),
            "compound_risk_boost": round(compound_boost, 1),
        },
        "failure_probability": round(failure_probability, 4),
        "vision_confidence": vision_confidence,
        "vision_risk_score": vision_risk_score,
    }

