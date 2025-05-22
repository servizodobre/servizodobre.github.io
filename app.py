from app import create_app
from app.database import init_db

# Initialize the database
init_db()

# Create the Flask app
app = create_app()

if __name__ == '__main__':
    app.run(debug=True)

