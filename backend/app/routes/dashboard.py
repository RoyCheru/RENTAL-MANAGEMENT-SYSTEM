from decimal import Decimal
from datetime import date
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.landlord import Landlord
from app.models.property import Property
from app.models.unit import Unit
from app.models.lease import Lease
from app.models.rent_charge import RentCharge

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.get("/summary")
@jwt_required()
def dashboard_summary_route():
    user_id = int(get_jwt_identity())
    print("JWT identity:", user_id, type(user_id))
    user = User.query.get_or_404(user_id)
    print("User:", user.id, user.full_name, user.role)

    if user.role != "landlord":
        return jsonify({"error": "Forbidden"}), 403

    landlord = Landlord.query.filter_by(user_id=user.id).first()
    if not landlord:
        return jsonify({"error": "Landlord profile not found"}), 404

    today = date.today()
    y, m = today.year, today.month

    # --- Properties ---
    properties = Property.query.filter_by(landlord_id=landlord.id).all()
    property_ids = [p.id for p in properties]

    # --- Units ---
    units = Unit.query.filter(Unit.property_id.in_(property_ids)).all() if property_ids else []
    total_units = len(units)
    occupied_units = sum(1 for u in units if u.status == "occupied")
    vacant_units = sum(1 for u in units if u.status == "vacant")

    # --- Leases (via unit_ids) ---
    unit_ids = [u.id for u in units]
    leases = Lease.query.filter(Lease.unit_id.in_(unit_ids)).all() if unit_ids else []
    lease_ids = [l.id for l in leases]

    # --- Current month charges ---
    expected = Decimal("0.00")
    collected = Decimal("0.00")

    current_charges = []
    if lease_ids:
        current_charges = (RentCharge.query
                           .filter(RentCharge.lease_id.in_(lease_ids),
                                   RentCharge.period_year == y,
                                   RentCharge.period_month == m)
                           .all())

    for ch in current_charges:
        expected += Decimal(str(ch.amount_due or 0)) + Decimal(str(ch.late_fee or 0))
        for p in ch.payments:
            collected += Decimal(str(p.amount or 0))

    outstanding = expected - collected
    if outstanding < 0:
        outstanding = Decimal("0.00")

    # --- Arrears total (past due balances) + top overdue list ---
    arrears_total = Decimal("0.00")
    overdue_items = []

    all_charges = []
    if lease_ids:
        all_charges = RentCharge.query.filter(RentCharge.lease_id.in_(lease_ids)).all()

    for ch in all_charges:
        if ch.due_date and ch.due_date < today and ch.status in ("unpaid", "partial", "overdue"):
            total_due = Decimal(str(ch.amount_due or 0)) + Decimal(str(ch.late_fee or 0))
            total_paid = Decimal("0.00")
            for p in ch.payments:
                total_paid += Decimal(str(p.amount or 0))
            balance = total_due - total_paid
            if balance > 0:
                arrears_total += balance
                overdue_items.append({
                    "rent_charge_id": ch.id,
                    "lease_id": ch.lease_id,
                    "period_year": ch.period_year,
                    "period_month": ch.period_month,
                    "due_date": ch.due_date.isoformat() if ch.due_date else None,
                    "status": ch.status,
                    "balance": float(balance),
                })

    # Sort overdue items by highest balance first, show top 10
    overdue_items.sort(key=lambda x: x["balance"], reverse=True)
    top_overdue = overdue_items[:10]

    return jsonify({
        "totals": {
            "properties": len(properties),
            "units": total_units,
            "occupied_units": occupied_units,
            "vacant_units": vacant_units,
            "occupancy_rate": (occupied_units / total_units) if total_units else 0,
        },
        "current_month": {
            "year": y,
            "month": m,
            "expected_rent": float(expected),
            "collected_rent": float(collected),
            "outstanding": float(outstanding),
        },
        "arrears_total": float(arrears_total),
        "top_overdue": top_overdue,
    }), 200