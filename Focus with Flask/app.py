from flask import Flask, render_template, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for Chrome extension

# Canvas API configuration
CANVAS_API_URL = os.environ.get("CANVAS_API_URL")
CANVAS_API_KEY = os.environ.get("CANVAS_API_KEY")

@app.route('/')
def home():
    return render_template('focus.html')

@app.route('/api/courses', methods=['GET'])
def get_courses():
    """Fetch current courses from Canvas API"""
    if not CANVAS_API_KEY:
        return jsonify({"error": "Canvas API key not configured"}), 500
    
    headers = {
        "Authorization": f"Bearer {CANVAS_API_KEY}"
    }
    
    try:
        # Get current enrollment courses
        response = requests.get(
            f"{CANVAS_API_URL}/api/v1/courses",
            headers=headers,
            params={
                "enrollment_state": "active",
                "include[]": "total_students"
            }
        )
        
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
        
        return jsonify(formatted_courses)
        
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to fetch courses: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)