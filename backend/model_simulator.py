import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# --- MOCK CHRONOTYPES AND BASELINES ---
# NOTE: In a real deployment, these weights would be extracted from your trained .pkl file.
MOCK_FEATURE_WEIGHTS = {
    # Weights reflecting feature importance from your model
    'sleep_duration_hours': 0.45,
    'previous_day_smart_sleep': 0.25,
    'screen_time_before_bed_min': -0.015,
    'avg_stress_level_3d': -0.08,
    'bedtime_regularity_std_7d': -0.05,
    'avg_sleep_quality_7d': 0.1,
    'is_weekend': 0.3,
    'chronotype_late': -0.2, # Late chronotype generally hurts the score
    'intercept': 3.0,
}

# --- MOCK DATA FOR FEATURE GENERATION (SIMULATES DATABASE LOOKUP) ---
# This dictionary simulates retrieving a user's *past 7 days* of data from a database.
# This history is essential for calculating Lag and Rolling Averages.
MOCK_USER_HISTORY = {
    # Example data for a user ('user_1')
    'user_1': {
        # Required for Lag-1 feature
        'smart_sleep_meter_lag_1': 7.2,
        
        # Required for Rolling 7-Day calculations (7 entries)
        'stress_level_7d': [5.0, 4.5, 6.0, 5.5, 7.0, 6.5, 5.8],
        'sleep_duration_7d': [7.0, 7.5, 6.5, 7.2, 7.1, 7.8, 6.9],
        'sleep_quality_7d': [7.5, 7.8, 6.5, 7.0, 8.1, 7.5, 7.2],
        'alarm_time_minutes_7d': [420, 425, 430, 420, 435, 420, 425] # Minutes past midnight
    }
}

class SmartAlarmModelSimulator:
    """
    Simulates the prediction and feature engineering pipeline of the champion Stacked Ensemble model.
    """
    def __init__(self, user_id):
        self.user_id = str(user_id)
        self.weights = MOCK_FEATURE_WEIGHTS
        # Use mock history. In a real app, this would query a database.
        self.history = MOCK_USER_HISTORY.get(self.user_id, MOCK_USER_HISTORY['user_1'])
        self.full_feature_list = list(MOCK_FEATURE_WEIGHTS.keys())

    def _calculate_rolling_features(self, new_input: dict) -> dict:
        """Calculates 3-day and 7-day rolling averages and consistency metrics."""
        features = {}

        # 1. Rolling 7-Day Regularity (Standard Deviation of Alarm Time)
        all_alarm_times = self.history['alarm_time_minutes_7d'] + [new_input['current_alarm_time_min']]
        # Use the last 7 times (or fewer if min_periods are met)
        features['bedtime_regularity_std_7d'] = np.std(all_alarm_times[-7:])

        # 2. Rolling Average Features (3D and 7D)
        
        rolling_base_features = ['stress_level', 'sleep_quality', 'sleep_duration']
        
        for feature in rolling_base_features:
            history_data = self.history[f'{feature}_7d']
            
            # 3-Day Average (using T-1, T-2, T-3 data)
            features[f'avg_{feature}_3d'] = np.mean(history_data[-3:])
            
            # 7-Day Average (using T-1 to T-7 data)
            features[f'avg_{feature}_7d'] = np.mean(history_data)

        # We specifically need one of the 3D or 7D features for the mock weights
        features['avg_stress_level_3d'] = features['avg_stress_level_3d']
        features['avg_sleep_quality_7d'] = features['avg_sleep_quality_7d']
        
        return features

    def _generate_features(self, input_data: dict) -> dict:
        """Generates all engineered features required by the model from input and history."""
        
        # Calculate current alarm time in minutes (needed for regularity calculation)
        current_alarm_time = datetime.strptime(input_data['alarm_time'], '%H:%M')
        input_data['current_alarm_time_min'] = current_alarm_time.hour * 60 + current_alarm_time.minute
        
        # 1. Rolling & Lag features based on history
        rolling_features = self._calculate_rolling_features(input_data)

        # 2. Direct Input Features
        features = {
            'screen_time_before_bed_min': input_data['screen_time_before_bed_min'],
            'sleep_duration_hours': input_data['sleep_duration_hours'],
            'is_weekend': input_data['is_weekend'],
        }
        
        # 3. Lag Features (Previous Day's Smart Sleep Meter)
        features['previous_day_smart_sleep'] = self.history['smart_sleep_meter_lag_1']

        # 4. Categorical/Chronotype Features (Mocked)
        features['chronotype_late'] = 1 if input_data['chronotype'].lower() == 'late' else 0
        
        # Combine all features
        full_features = {**features, **rolling_features}
        
        # Select only the features the model was trained on (MOCK_FEATURE_WEIGHTS keys)
        final_features = {k: full_features.get(k, 0) for k in self.full_feature_list if k != 'intercept'}
        
        return final_features

    def predict_smart_sleep(self, input_data: dict) -> float:
        """
        Calculates the Smart Sleep Meter score based on the input data and mock weights.
        """
        features = self._generate_features(input_data)
        
        score = self.weights['intercept']
        
        # Linear approximation of the Stacked Model's impact
        for feature, weight in self.weights.items():
            if feature in features:
                score += features[feature] * weight
        
        # Apply final model constraints (Score must be between 1 and 10)
        final_score = np.clip(score + np.random.uniform(-0.5, 0.5), 1.0, 10.0)
        
        return round(float(final_score), 1)

    def map_to_alarm_plan(self, predicted_score: float) -> dict:
        """
        Maps the predicted Smart Sleep Meter score to an actionable alarm strategy.
        This logic mirrors the suggestions derived from your simulation.
        """
        # --- Alarm Strategy Mapping ---
        if predicted_score >= 8.5:
            strategy = "Optimal"
            mode = "Energetic & Bright"
            music = "Upbeat Pop/Rock"
            snooze = "Strict (1 max)"
        elif predicted_score >= 7.0:
            strategy = "Good"
            mode = "Gentle-Rise"
            music = "Ambient/Lo-Fi"
            snooze = "Lenient (3 max)"
        elif predicted_score >= 5.0:
            strategy = "Fair"
            mode = "Standard"
            music = "Soft Rock/Instrumental"
            snooze = "Not Recommended"
        else: # Score < 5.0 (Recovery)
            strategy = "Recovery"
            mode = "Gentle & Gradual"
            music = "Classical/Nature Sounds"
            snooze = "Strictly Avoid"

        return {
            "prediction_score": predicted_score,
            "strategy": strategy,
            "wake_up_mode": mode,
            "music_type": music,
            "snooze_allowance": snooze,
            "message": f"Your next-day readiness score is {predicted_score}. Recommended strategy: {strategy}."
        }

    # CRITICAL FIX: This new method orchestrates the full prediction and is called by app.py
    def get_alarm_plan(self, input_data: dict) -> dict:
        """
        The main method called by the API route to perform prediction and return the final plan.
        """
        # 1. Predict the score
        predicted_score = self.predict_smart_sleep(input_data)
        
        # 2. Map the score to an actionable plan
        return self.map_to_alarm_plan(predicted_score)
