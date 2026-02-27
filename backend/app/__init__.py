from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.extensions import db, jwt, migrate
# from app.blueprints import register_blueprints

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Enable CORS (configure origins as needed)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # register_blueprints(app)
    @app.get("/health")
    def health():
        return {"status": "ok"}, 200


    return app