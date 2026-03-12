from decimal import Decimal
from datetime import date
from flask import jsonify, Blueprint, request
from flask_jwt_extended import jwt_required
from app.models.lease import Lease
from app.models.rent_charge import RentCharge


leases_bp = Blueprint("leases", __name__, url_prefix="/api/leases")

@leases_bp.get("/<int:lease_id>/summary")
@jwt_required()
def lease_summary_route(lease_id: int):
    lease = Lease.query.get_or_404(lease_id)

    today = date.today()
    current_year = today.year
    current_month = today.month

    # Helper: compute totals for a charge
    def charge_totals(charge: RentCharge) -> dict:
        amount_due = Decimal(str(charge.amount_due or 0))
        late_fee = Decimal(str(charge.late_fee or 0))
        total_due = amount_due + late_fee

        total_paid = Decimal("0.00")
        for p in charge.payments:
            total_paid += Decimal(str(p.amount or 0))

        balance = total_due - total_paid
        return {
            "rent_charge_id": charge.id,
            "period_year": charge.period_year,
            "period_month": charge.period_month,
            "due_date": charge.due_date.isoformat() if charge.due_date else None,
            "status": charge.status,
            "amount_due": float(amount_due),
            "late_fee": float(late_fee),
            "total_due": float(total_due),
            "total_paid": float(total_paid),
            "balance": float(balance),
        }

    # Current month charge (may not exist yet)
    current_charge = RentCharge.query.filter_by(
        lease_id=lease.id,
        period_year=current_year,
        period_month=current_month,
    ).first()

    current_month_summary = charge_totals(current_charge) if current_charge else None

    # Arrears: sum balances of charges that are past due and not fully paid
    charges = RentCharge.query.filter_by(lease_id=lease.id).all()

    arrears_total = Decimal("0.00")
    for c in charges:
        if c.due_date and c.due_date < today and c.status in ("unpaid", "partial", "overdue"):
            totals = charge_totals(c)
            bal = Decimal(str(totals["balance"]))
            if bal > 0:
                arrears_total += bal

    # Helpful info for UI
    tenant_name = lease.tenant.user.full_name if lease.tenant and lease.tenant.user else None
    unit_code = lease.unit.unit_code if lease.unit else None
    property_name = lease.unit.property.name if lease.unit and lease.unit.property else None
    property_id = lease.unit.property.id if lease.unit and lease.unit.property else None

    return jsonify({
        "lease": lease.to_dict(),
        "tenant_name": tenant_name,
        "unit_code": unit_code,
        "property_id": property_id,
        "property_name": property_name,
        "current_month": {
            "year": current_year,
            "month": current_month,
            "charge": current_month_summary
        },
        "arrears_total": float(arrears_total),
    }), 200