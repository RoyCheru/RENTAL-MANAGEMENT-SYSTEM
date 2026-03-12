from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.unit import Unit
from app.models.lease import Lease
from app.services.payment_service import record_payment, apply_credits_to_lease_charges
from typing import Optional

payments_bp = Blueprint("payments", __name__, url_prefix="/api/payments")


def _get_active_lease_by_unit_code(unit_code: str) -> Optional[Lease]:
    """
    Finds an active lease for a given unit_code.
    Assumes unit_code is unique per property (we already enforce that).
    """
    unit = Unit.query.filter_by(unit_code=unit_code).first()
    if not unit:
        return None

    lease = Lease.query.filter_by(unit_id=unit.id, status="active").first()
    return lease


@payments_bp.post("")
@jwt_required()
def record_payment_route():
    """
    Tenant-friendly payment endpoint.

    Body supports:
      A) Pay by lease_id:
        { "lease_id": 10, "amount": 10000, "method": "mpesa", "reference": "XYZ" }

      B) Pay by unit_code:
        { "unit_code": "A1", "amount": 10000, "method": "mpesa", "reference": "XYZ" }

    Optional (landlord/internal):
      - rent_charge_id: apply specifically to that month
    If rent_charge_id is not provided -> auto-allocate FIFO to oldest unpaid/overdue charges.
    """
    data = request.get_json() or {}

    try:
        amount = float(data["amount"])
        if amount <= 0:
            return jsonify({"error": "amount must be greater than 0"}), 400

        method = data.get("method", "cash")
        reference = data.get("reference")
        notes = data.get("notes")
        rent_charge_id = data.get("rent_charge_id")

        # Resolve lease_id
        lease_id = data.get("lease_id")
        unit_code = data.get("unit_code")

        if lease_id is None and not unit_code:
            return jsonify({"error": "Provide either lease_id or unit_code"}), 400

        if lease_id is None and unit_code:
            lease = _get_active_lease_by_unit_code(str(unit_code).strip())
            if not lease:
                return jsonify({"error": "No active lease found for this unit_code"}), 404
            lease_id = lease.id
        else:
            lease_id = int(lease_id)

        created_by_user_id = get_jwt_identity()

        # Record payment (if rent_charge_id provided -> applies to that charge; otherwise becomes credit)
        payment = record_payment(
            lease_id=lease_id,
            amount=amount,
            method=method,
            rent_charge_id=int(rent_charge_id) if rent_charge_id is not None else None,
            reference=reference,
            notes=notes,
            created_by_user_id=created_by_user_id,
        )

        # If no specific month provided, auto-allocate FIFO across oldest unpaid/overdue charges
        allocations_created = 0
        if rent_charge_id is None:
            allocations_created = apply_credits_to_lease_charges(lease_id)

        return jsonify({
            "payment": payment.to_dict(),
            "allocations_created": allocations_created
        }), 201

    except KeyError as e:
        return jsonify({"error": f"Missing field: {str(e)}"}), 400
    except ValueError as e:
        return jsonify({"error": str(e)}), 400