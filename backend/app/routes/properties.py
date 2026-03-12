from decimal import Decimal
from datetime import date
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.models.property import Property
from app.models.unit import Unit
from app.models.lease import Lease
from app.models.rent_charge import RentCharge
from app.models.user import User
from app.models.landlord import Landlord
from app.extensions import db
from flask_jwt_extended import get_jwt_identity
from flask import request
from sqlalchemy import func, case

properties_bp = Blueprint("properties", __name__, url_prefix="/api/properties")

def _get_landlord_for_current_user() -> Landlord:
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)

    if user.role != "landlord":
        # You can also return 403 here; raising keeps it consistent
        raise PermissionError("Forbidden")

    landlord = Landlord.query.filter_by(user_id=user.id).first()
    if not landlord:
        raise ValueError("Landlord profile not found")

    return landlord


@properties_bp.post("")
@jwt_required()
def create_property():
    """
    Body:
      {
        "name": "GreenView Apartments",
        "property_type": "apartment",
        "country": "Kenya",
        "city": "Nairobi",
        "area": "Juja",
        "address": "Some street",
        "notes": "Optional notes",

        "number_of_units": 10,          # optional (if provided -> auto create units)
        "default_rent": 6000,           # required if number_of_units provided
        "default_deposit": 6000,        # optional
        "unit_code_prefix": "U"         # optional (default "U")
      }
    """
    data = request.get_json() or {}

    try:
        landlord = _get_landlord_for_current_user()

        name = data["name"].strip()
        property_type = data.get("property_type", "apartment")

        prop = Property(
            landlord_id=landlord.id,
            name=name,
            property_type=property_type,
            country=data.get("country", "Kenya"),
            city=data.get("city"),
            area=data.get("area"),
            address=data.get("address"),
            notes=data.get("notes"),
        )

        db.session.add(prop)
        db.session.flush()  # ✅ get prop.id without committing yet

        # --- Auto-create units if requested ---
        number_of_units = data.get("number_of_units")
        if number_of_units is not None:
            number_of_units = int(number_of_units)
            if number_of_units <= 0:
                return jsonify({"error": "number_of_units must be greater than 0"}), 400

            default_rent = data.get("default_rent")
            if default_rent is None:
                return jsonify({"error": "default_rent is required when number_of_units is provided"}), 400
            default_rent = float(default_rent)

            default_deposit = data.get("default_deposit")
            default_deposit = float(default_deposit) if default_deposit is not None else None

            prefix = str(data.get("unit_code_prefix", "A")).strip() or "A"

            units = []
            for i in range(1, number_of_units + 1):
                unit_code = f"{prefix}{i}"

                unit = Unit(
                    property_id=prop.id,
                    unit_code=unit_code,
                    rent_amount=default_rent,
                    deposit_amount=default_deposit,
                    status="vacant",
                )
                units.append(unit)

            db.session.add_all(units)

        db.session.commit()

        # return property + unit count
        created_units = Unit.query.filter_by(property_id=prop.id).count()

        return jsonify({
        "property": prop.to_dict(units_count=created_units, occupied_units=0),
        "created_units": created_units
    }), 201

    except PermissionError:
        return jsonify({"error": "Forbidden"}), 403
    except KeyError as e:
        return jsonify({"error": f"Missing field: {str(e)}"}), 400
    except ValueError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@properties_bp.get("/<int:property_id>/summary")
@jwt_required()
def property_summary_route(property_id: int):
    prop = Property.query.get_or_404(property_id)

    today = date.today()
    y, m = today.year, today.month

    # --- Occupancy ---
    units = Unit.query.filter_by(property_id=property_id).all()
    total_units = len(units)
    occupied_units = sum(1 for u in units if u.status == "occupied")
    vacant_units = sum(1 for u in units if u.status == "vacant")

    # --- Find leases for this property (via units) ---
    unit_ids = [u.id for u in units]
    leases = Lease.query.filter(Lease.unit_id.in_(unit_ids)).all() if unit_ids else []
    lease_ids = [l.id for l in leases]

    # --- Current month expected + collected ---
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

    # --- Arrears: sum balances for charges past due and not paid ---
    arrears = Decimal("0.00")

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
                arrears += balance

    return jsonify({
        "property": prop.to_dict(),
        "occupancy": {
            "total_units": total_units,
            "occupied_units": occupied_units,
            "vacant_units": vacant_units,
            "occupancy_rate": (occupied_units / total_units) if total_units else 0
        },
        "current_month": {
            "year": y,
            "month": m,
            "expected_rent": float(expected),
            "collected_rent": float(collected),
            "outstanding_current_month": float(max(Decimal("0.00"), expected - collected)),
        },
        "arrears_total": float(arrears),
    }), 200
    
@properties_bp.get("")
@jwt_required()
def list_properties():
    landlord = _get_landlord_for_current_user()
    rows = (
        db.session.query(
            Property,
            func.count(Unit.id).label("units_count"),
            func.coalesce(
                func.sum(case((Unit.status == "occupied", 1), else_=0)),
                0
            ).label("occupied_units"),
        )
        .outerjoin(Unit, Unit.property_id == Property.id)
        .filter(Property.landlord_id == landlord.id)
        .group_by(Property.id)
        .all()
    )

    results = []
    for prop, units_count, occupied_units in rows:
        results.append(prop.to_dict(units_count=int(units_count), occupied_units=int(occupied_units)))

    return jsonify(results), 200

@properties_bp.put("/<int:property_id>")
@jwt_required()
def update_property(property_id: int):
    data = request.get_json() or {}

    try:
        landlord = _get_landlord_for_current_user()
        prop = Property.query.filter_by(id=property_id, landlord_id=landlord.id).first_or_404()

        # Update allowed fields
        for field in ["name", "property_type", "country", "city", "area", "address", "notes"]:
            if field in data:
                setattr(prop, field, data[field].strip() if isinstance(data[field], str) else data[field])

        db.session.commit()

        # return updated property + unit count
        return jsonify(prop.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@properties_bp.delete("/<int:property_id>")
@jwt_required()
def delete_property(property_id: int):
    try:
        landlord = _get_landlord_for_current_user()
        prop = Property.query.filter_by(id=property_id, landlord_id=landlord.id).first_or_404()

        db.session.delete(prop)
        db.session.commit()
        return jsonify({"message": "Property deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    