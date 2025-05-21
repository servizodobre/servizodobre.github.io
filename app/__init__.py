from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__, template_folder='templates', static_folder='static')
    CORS(app, resources={r"/*": {"origins": "https://servizodobre.com"}})

    # Register Blueprints
    from app.routes.main import main_bp
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.stores import stores_bp
    from app.routes.items import items_bp
    from app.routes.expenses import expenses_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(users_bp, url_prefix='/users')
    app.register_blueprint(stores_bp, url_prefix='/stores')
    app.register_blueprint(items_bp, url_prefix='/items')
    app.register_blueprint(expenses_bp, url_prefix='/expenses')

    return app

