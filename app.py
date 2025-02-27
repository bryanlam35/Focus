from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

# Load environment variables (these will be fallbacks only)
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["chrome-extension://*", "http://127.0.0.1:*"])

# Default Canvas API configuration
DEFAULT_CANVAS_API_URL = os.environ.get("CANVAS_API_URL", "https://canvas.instructure.com")
DEFAULT_CANVAS_API_KEY = os.environ.get("CANVAS_API_KEY")

@app.route('/')
def home():
    return render_template('focus.html')

@app.route('/api/courses', methods=['GET', 'POST'])
def get_courses():
    """Fetch current courses from Canvas API"""
    
    # Default values from .env (fallback only)
    api_key = DEFAULT_CANVAS_API_KEY
    api_url = DEFAULT_CANVAS_API_URL
    
    # If POST request, get API key and URL from request body
    if request.method == 'POST' and request.is_json:
        try:
            data = request.get_json()
            # Use the key from the request if available
            if data.get('api_key'):
                api_key = data.get('api_key')
                api_url = data.get('api_url', DEFAULT_CANVAS_API_URL)
                print(f"Using API key from request: {api_key[:8]}...")
            else:
                print("No API key in request, using default")
        except Exception as e:
            print(f"Error processing request JSON: {e}")
            return jsonify({"error": f"Invalid request: {str(e)}"}), 400
    
    if not api_key:
        return jsonify({"error": "Canvas API key not provided"}), 400
    
    print(f"Fetching courses from: {api_url}")
    
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    try:
        # Get current enrollment courses
        response = requests.get(
            f"{api_url}/api/v1/courses",
            headers=headers,
            params={
                "enrollment_state": "active",
                "include[]": "total_students"
            }
        )
        
        # Check for unauthorized or other error
        if response.status_code == 401:
            print("API returned 401 unauthorized")
            return jsonify({"error": "Canvas API access unauthorized. Please check your API key."}), 401
        
        response.raise_for_status()
        courses = response.json()
        
        # Format courses for the extension
        formatted_courses = []
        for course in courses:
            if 'name' not in course or course.get('access_restricted_by_date', False):
                continue
                
            formatted_courses.append({
                "id": str(course["id"]),
                "name": course["name"],
                "code": course.get("course_code", ""),
                "description": course.get("course_code", "No description available"),
                "students": course.get("total_students", 0)
            })
        
        print(f"Successfully fetched {len(formatted_courses)} courses")
        return jsonify(formatted_courses)
        
    except requests.exceptions.RequestException as e:
        error_message = str(e)
        print(f"API Error: {error_message}")
        # Check if it's an authentication error
        if "401" in error_message:
            return jsonify({"error": "Canvas API access unauthorized. Please check your API key."}), 401
        return jsonify({"error": f"Failed to fetch courses: {error_message}"}), 500

if __name__ == '__main__':
    app.run(debug=True)