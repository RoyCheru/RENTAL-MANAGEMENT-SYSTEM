from decimal import Decimal
from flask import jsonify
from flask_jwt_extended import jwt_required
from app.models.rent_charge import RentCharge

@rent_charges_bp.get("/<int:charge_id>/summary")
@jwt_required()
def rent_charge_summary_route(charge_id: int):
    charge = RentCharge.query.get_or_404(charge_id)

    amount_due = Decimal(str(charge.amount_due or 0))
    late_fee = Decimal(str(charge.late_fee or 0))
    total_due = amount_due + late_fee

    total_paid = Decimal("0.00")
    for p in charge.payments:
        total_paid += Decimal(str(p.amount or 0))

    balance = total_due - total_paid
    if balance < 0:
        balance = Decimal("0.00")  # optional: clamp negative (overpayment) for MVP

    return jsonify({
        "rent_charge_id": charge.id,
        "lease_id": charge.lease_id,
        "period_year": charge.period_year,
        "period_month": charge.period_month,
        "due_date": charge.due_date.isoformat() if charge.due_date else None,
        "status": charge.status,
        "amount_due": float(amount_due),
        "late_fee": float(late_fee),
        "total_due": float(total_due),
        "total_paid": float(total_paid),
        "balance": float(balance),
    }), 200