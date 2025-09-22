import pandas as pd
import numpy as np

# ---------- 1. Load combined datasets ----------
studentlife = pd.read_csv("StudentLife.csv")
sleepedf = pd.read_csv("Sleep-EDF.csv")

combined_data = pd.concat([studentlife, sleepedf], ignore_index=True)

def normalize(series):
    return ((series - series.min()) / (series.max() - series.min()) * 10).round(1)

# ---------- 2. Preprocess real datasets ----------
for df in [studentlife, sleepedf, combined_data]:
    df['mood_norm'] = normalize(df['mood'])
    df['stress_norm'] = 10 - normalize(df['stress'])
    df['sleep_quality_norm'] = normalize(df['sleep_quality'])
    df['smart_sleep_meter'] = df[['mood_norm', 'stress_norm', 'sleep_quality_norm']].mean(axis=1).round(1)

# ---------- 3. Simulate daily logs with user-specific trends ----------
num_users = 50
days_per_user = 30

def generate_daily_log(user_id):
    logs = []
    base_wake_hour = np.random.choice(range(6,9))  # user-specific base alarm hour
    base_sleep_duration = np.clip(np.random.normal(7, 0.5), 5, 9)  # user-specific avg sleep
    for day in range(1, days_per_user+1):
        weekday = (day-1) % 7
        # Slightly later wakeups on weekends
        weekend_adjust = 1 if weekday in [5,6] else 0
        
        # Sample real pattern
        sample = combined_data.sample(n=1).iloc[0]
        smart_sleep = np.clip(sample['smart_sleep_meter'] + np.random.normal(0,0.8), 0,10)
        mood = np.clip(sample['mood_norm'] + np.random.normal(0,1), 0,10)
        stress = np.clip(sample['stress_norm'] + np.random.normal(0,1), 0,10)
        sleep_quality = np.clip(sample['sleep_quality_norm'] + np.random.normal(0,1), 0,10)
        screen_time = np.random.randint(0,90)
        alarm_hour = base_wake_hour + weekend_adjust
        alarm_minute = np.random.randint(0,60)
        exercise = np.random.choice([0,1], p=[0.4,0.6])
        nap_duration = np.random.randint(0,60)
        sleep_duration = np.clip(base_sleep_duration + np.random.normal(0,1), 4,10)
        
        # Correlation: more screen time → lower smart_sleep
        smart_sleep -= 0.02 * screen_time
        
        # Simulate snooze usage (0–3 times)
        snooze_count = np.random.choice([0,1,2,3], p=[0.5,0.3,0.15,0.05])
        alarm_hour_snooze = alarm_hour
        alarm_minute_snooze = alarm_minute + snooze_count * 10
        if alarm_minute_snooze >= 60:
            alarm_hour_snooze += alarm_minute_snooze // 60
            alarm_minute_snooze = alarm_minute_snooze % 60
        alarm_hour_snooze = alarm_hour_snooze % 24
        
        logs.append({
            'user_id': user_id,
            'day': day,
            'weekday': weekday,
            'alarm_hour': alarm_hour,
            'alarm_minute': alarm_minute,
            'alarm_hour_with_snooze': alarm_hour_snooze,
            'alarm_minute_with_snooze': alarm_minute_snooze,
            'sleep_duration_hours': round(sleep_duration,1),
            'screen_time_before_bed_min': screen_time,
            'smart_sleep_meter': round(smart_sleep,1),
            'mood': round(mood,1),
            'stress_level': round(stress,1),
            'sleep_quality': round(sleep_quality,1),
            'exercise_done': exercise,
            'nap_duration_min': nap_duration,
            'snooze_count': snooze_count
        })
    return logs

# ---------- 4. Generate full dataset ----------
all_logs = []
for user_id in range(1, num_users+1):
    all_logs.extend(generate_daily_log(user_id))

synthetic_time_series = pd.DataFrame(all_logs)

# ---------- 5. Save dataset ----------
synthetic_time_series.to_csv("synthetic_sleep_time_series_enhanced.csv", index=False)
print("Enhanced synthetic time-series dataset saved as 'synthetic_sleep_time_series_enhanced.csv'.")
