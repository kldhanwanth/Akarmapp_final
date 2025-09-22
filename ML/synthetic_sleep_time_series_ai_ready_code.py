import pandas as pd
import numpy as np

# ---------- Load the enhanced dataset ----------
df = pd.read_csv("synthetic_sleep_time_series_enhanced.csv")

# ---------- Function to simulate AI labels ----------
def add_ai_labels(df):
    df = df.sort_values(['user_id', 'day']).reset_index(drop=True)

    # Predict next day's smart_sleep_meter
    df['next_day_smart_sleep'] = df.groupby('user_id')['smart_sleep_meter'].shift(-1)
    
    # Predict next day's mood and stress
    df['next_day_mood'] = df.groupby('user_id')['mood'].shift(-1)
    df['next_day_stress'] = df.groupby('user_id')['stress_level'].shift(-1)

    # Optimal alarm time label: simulate as the alarm that gave highest smart_sleep_meter
    # For simplicity, we'll assign today's alarm if it gave > mean smart_sleep_meter, else adjust by +/- 1 hour
    def optimal_alarm(row, user_mean):
        if row['smart_sleep_meter'] >= user_mean:
            return row['alarm_hour'], row['alarm_minute']
        else:
            # Small adjustment
            hour = (row['alarm_hour'] + np.random.choice([-1,1])) % 24
            minute = row['alarm_minute']
            return hour, minute

    optimal_alarms = []
    for user_id, group in df.groupby('user_id'):
        user_mean = group['smart_sleep_meter'].mean()
        for _, row in group.iterrows():
            optimal_alarms.append(optimal_alarm(row, user_mean))
    optimal_alarms = pd.DataFrame(optimal_alarms, columns=['optimal_alarm_hour', 'optimal_alarm_minute'])
    
    df = pd.concat([df, optimal_alarms], axis=1)
    
    # Drop last row per user where next_day_* is NaN
    df = df.groupby('user_id').apply(lambda g: g.iloc[:-1]).reset_index(drop=True)
    
    return df

# ---------- Add AI labels ----------
df_labeled = add_ai_labels(df)

# ---------- Save AI-ready dataset ----------
df_labeled.to_csv("synthetic_sleep_time_series_ai_ready.csv", index=False)
print("AI/ML-ready synthetic dataset saved as 'synthetic_sleep_time_series_ai_ready.csv'.")
