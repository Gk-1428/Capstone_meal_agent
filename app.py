import os
from flask import Flask, request, jsonify, send_from_directory
from google import genai
from google.genai.errors import APIError
from flask_cors import CORS # Needed for cross-origin requests, though Replit usually handles this

# --- Flask App Initialization ---
app = Flask(_name_, static_folder='.')
CORS(app) # Enable CORS for all routes

# --- API Client Initialization ---
# Reads the key from Replit Secrets (Environment Variables)
try:
    API_KEY = os.getenv("GEMINI_API_KEY")
    if not API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable not set in Replit Secrets.")
    client = genai.Client(api_key=API_KEY)
    print("Agent Initialized.")
except Exception as e:
    print(f"Error initializing Gemini client: {e}")
    client = None

# --- Core Agent Logic ---
def get_meal_suggestion(ingredient: str, restriction: str):
    """
    Runs the prompt engineering logic against the Gemini model.
    """
    if client is None:
        return "Service Error: AI Client not available. Check server configuration.", 500

    # Input Validation
    if not ingredient or not restriction:
        return "Validation Error: Both ingredient and restriction are required.", 400

    # The Prompt (The Agent's Brain)
    agent_instruction = (
        "You are a helpful and creative Mobile Meal Planner Agent. "
        "Your task is to generate a simple, easy-to-follow recipe for a beginner. "
        "Do not use complex or rare ingredients. The total time to prepare should be under 30 minutes. "
        "The response MUST be a single, structured Markdown string using the following format:\n\n"
        "## 🍽️ [Recipe Name]\n\n"
        "*Time:* [Total Time]\n\n"
        "*Ingredients:\n [Ingredient 1]\n* [Ingredient 2]\n* ...\n\n"
        "*Instructions:*\n1. [Step 1]\n2. [Step 2]\n3. ..."
    )

    user_request = (
        f"Generate a recipe using the main ingredient: *{ingredient}*. "
        f"The recipe must strictly follow the dietary requirement: *{restriction}*."
    )

    full_prompt = agent_instruction + "\n\n" + user_request

    try:
        # Gemini API Call with stability control (temperature=0.4)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=full_prompt,
            config={"temperature": 0.4}
        )
        return response.text, 200

    except APIError as e:
        return f"API Error: Failed to generate content. Detail: {e}", 500
    except Exception as e:
        return f"Unexpected Server Error: {e}", 500

# --- Flask Endpoint Definitions ---

@app.route('/api/suggest_meal', methods=['POST'])
def suggest_meal():
    """Endpoint called by the JavaScript client to get a recipe."""
    try:
        data = request.get_json()
        ingredient = data.get('ingredient', '').strip()
        restriction = data.get('restriction', '').strip()

        recipe_text, status_code = get_meal_suggestion(ingredient, restriction)

        if status_code != 200:
            return jsonify({"error": recipe_text}), status_code
        else:
            return jsonify({"recipe": recipe_text}), 200
    except Exception as e:
        return jsonify({"error": f"Invalid request body format: {e}"}), 400

@app.route('/')
def serve_index():
    """Serves the main HTML page when the user visits the root URL."""
    return send_from_directory('.', 'index.html')

# --- Replit Run Command ---
if _name_ == '_main_':
    # Replit uses the 'gunicorn' server for deployment, but this is the local dev setup
    app.run(host='0.0.0.0', port=os.environ.get('PORT', 8080))
