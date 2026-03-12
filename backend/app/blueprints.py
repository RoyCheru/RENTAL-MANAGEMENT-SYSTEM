from app.routes.auth import auth_bp
from app.routes.properties import properties_bp
# from app.routes.units import units_bp
from app.routes.tenants import tenants_bp
from app.routes.leases import leases_bp
from app.routes.payments import payments_bp
# from app.routes.reports import reports_bp
from app.routes.dashboard import dashboard_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(properties_bp)
    # app.register_blueprint(units_bp)
    app.register_blueprint(tenants_bp)
    app.register_blueprint(leases_bp)
    app.register_blueprint(payments_bp)
    # app.register_blueprint(reports_bp)
    app.register_blueprint(dashboard_bp)