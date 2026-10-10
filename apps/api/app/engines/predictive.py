# predictive.py - EarthMind AI Predictive Intelligence Engine
# XGBoost-based failure probability predictor with pure-Python math fallback.
# Works with or without xgboost/numpy/pandas installed.

import math

try:
    import numpy as np
    import pandas as pd
    from xgboost import XGBRegressor
    _XGBOOST_AVAILABLE = True
except ImportError:
    _XGBOOST_AVAILABLE = False


class MockFailurePredictor:
    """
    Predicts infrastructure failure probability (0.0 – 1.0) from environmental signals.
    Uses XGBoost when available, otherwise falls back to a calibrated logistic formula.

    Features:
        rainfall_mm              — Current / forecasted rainfall (0-100mm)
        soil_saturation_percent  — Soil saturation level (0-100%)
        infrastructure_age_years — Asset age in years (1-50)
        historical_failure_freq  — Historical failure events per year (0-10)
    """

    def __init__(self):
        self.is_trained = False
        self._model = None

    # ──────────────────────────────────────────
    # XGBoost path
    # ──────────────────────────────────────────
    def _generate_training_data(self):
        np.random.seed(42)
        n = 1000
        rainfall = np.random.uniform(0, 100, n)
        soil_sat = np.random.uniform(0, 100, n)
        age = np.random.uniform(1, 50, n)
        hist_freq = np.random.uniform(0, 10, n)

        # Heuristic probability (linear base + noise)
        base_prob = (rainfall / 100 * 0.4) + (soil_sat / 100 * 0.3) + (age / 50 * 0.2) + (hist_freq / 10 * 0.1)
        prob = np.clip(base_prob + np.random.normal(0, 0.05, n), 0, 1)

        X = pd.DataFrame({
            'rainfall_mm': rainfall,
            'soil_saturation_percent': soil_sat,
            'infrastructure_age_years': age,
            'historical_failure_freq': hist_freq
        })
        return X, prob

    def train(self):
        if not _XGBOOST_AVAILABLE:
            return
        print("[XGBoost Engine] Training Mock Failure Predictor...")
        X, y = self._generate_training_data()
        self._model = XGBRegressor(n_estimators=50, max_depth=3, learning_rate=0.1)
        self._model.fit(X, y)
        self.is_trained = True
        print("[XGBoost Engine] Training Complete.")

    def _predict_xgboost(self, rainfall_mm, soil_saturation, age, hist_freq):
        if not self.is_trained:
            self.train()
        X_test = pd.DataFrame({
            'rainfall_mm': [rainfall_mm],
            'soil_saturation_percent': [soil_saturation],
            'infrastructure_age_years': [age],
            'historical_failure_freq': [hist_freq]
        })
        prob = float(self._model.predict(X_test)[0])
        return max(0.0, min(1.0, prob))

    # ──────────────────────────────────────────
    # Pure-Python logistic fallback
    # ──────────────────────────────────────────
    def _predict_logistic(self, rainfall_mm, soil_saturation, age, hist_freq):
        """
        Calibrated logistic regression approximation (no external dependencies).
        Coefficients derived from the same weighted heuristic as XGBoost training data.
        """
        # Normalize features to [0, 1]
        r = max(0, min(rainfall_mm, 100)) / 100.0
        s = max(0, min(soil_saturation, 100)) / 100.0
        a = max(0, min(age, 50)) / 50.0
        h = max(0, min(hist_freq, 10)) / 10.0

        # Weighted linear combination
        z = (r * 0.40) + (s * 0.30) + (a * 0.20) + (h * 0.10)

        # Apply sigmoid for probability calibration
        prob = 1.0 / (1.0 + math.exp(-10.0 * (z - 0.5)))
        return round(max(0.0, min(1.0, prob)), 4)

    # ──────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────
    def predict_failure_prob(self, rainfall_mm: float, soil_saturation: float,
                             age: float, hist_freq: float) -> float:
        """
        Returns failure probability in [0.0, 1.0].
        Uses XGBoost if available, otherwise logistic formula fallback.
        """
        if _XGBOOST_AVAILABLE:
            try:
                return self._predict_xgboost(rainfall_mm, soil_saturation, age, hist_freq)
            except Exception as e:
                print(f"[XGBoost Engine] Inference error: {e}. Using logistic fallback.")
        return self._predict_logistic(rainfall_mm, soil_saturation, age, hist_freq)

    @property
    def engine_name(self) -> str:
        return "XGBoost-v2" if _XGBOOST_AVAILABLE else "LogisticFallback"


# Singleton instance
failure_predictor = MockFailurePredictor()

