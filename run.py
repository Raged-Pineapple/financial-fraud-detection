from app import app  # Import the app instance from __init__.py

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, port=8080)
