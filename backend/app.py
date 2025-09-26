import json
from flask import Flask, request, jsonify
from model_simulator import SmartAlarmModelSimulator

# Initialize Flask app globally
app = Flask(__name__)
# NOTE: The model is NO LONGER initialized here, as it needs the user_id.
# The 'model' variable is removed.

@app.route('/')
def home():
    """Simple check to ensure the server is running."""
    return jsonify({"status": "API is running", "endpoint": "/predict_alarm"})

@app.route('/predict_alarm', methods=['POST'])
def predict_alarm():
    """
    Receives user input data, generates features, predicts the next-day Smart Sleep Meter,
    and returns an actionable alarm plan.
    """
    try:
        # 1. Attempt to parse JSON data
        data = request.get_json()
        
        if not data:
            print("ERROR: Received request body is empty or not valid JSON.")
            return jsonify({"message": "Invalid request: Request body must be valid JSON."}), 400

    except Exception as e:
        print(f"ERROR: Failed to parse incoming JSON: {e}")
        return jsonify({"message": f"Invalid request format: Failed to parse JSON. Error: {e}"}), 400
    
    # 2. Extract necessary input features and check for user_id first
    user_id = data.get("user_id")
    if user_id is None:
        print("ERROR: user_id is missing.")
        return jsonify({"message": "Missing data field: 'user_id' is required."}), 400

    try:
        input_data = {
            "user_id": user_id, 
            "bedtime": data['bedtime'],
            "sleep_duration_hours": data['sleep_duration_hours'],
            "screen_time_before_bed_min": data['screen_time_before_bed_min'],
            "light_activity_min": data['light_activity_min'],
            "is_weekend": data['is_weekend'],
            "chronotype": data['chronotype'],
            "alarm_time": data['alarm_time'],
        }
    except KeyError as e:
        print(f"ERROR: Missing required field: {e}")
        return jsonify({"message": f"Missing data field: {e} is required."}), 400

    print(f"INFO: Successfully received and validated data for user {input_data['user_id']}")
    print(f"DATA: {input_data}")

    # 3. Predict Alarm Plan: Initialize the model *inside* the function with the user_id
    try:
        # CRITICAL CHANGE: Initialize model here with the specific user_id
        model_instance = SmartAlarmModelSimulator(user_id=user_id) 
        alarm_plan = model_instance.get_alarm_plan(input_data)
        
        # 4. Return the successful response
        return jsonify({
            "status": "success",
            "prediction": alarm_plan
        }), 200
        
    except Exception as e:
        print(f"CRITICAL ERROR during prediction: {e}")
        return jsonify({"message": f"Internal server error during prediction. Error: {e}"}), 500

if __name__ == '__main__':
    # Use 0.0.0.0 to listen on all public interfaces for Ngrok access
    app.run(host='0.0.0.0', port=5000)
