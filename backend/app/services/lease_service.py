from datetime import date
from app.extensions import db
from app.models.unit import Unit
from app.models.lease import Lease
from app.models.rent_charge import RentCharge
from app.services.rent_generation_service import _safe_due_date
from app.services.payment_service import apply_credits_to_lease_charges

def _next_month(year: int, month: int) -> tuple[int, int]:
    return (year + 1, 1) if month == 12 else (year, month + 1)

def create_lease(unit_id: int, tenant_id: int, rent_amount: float, due_day: int = 10, start_date: date | None = None) -> Lease:
    unit = Unit.query.get_or_404(unit_id)
    start_date = start_date or date.today()

    existing_active = Lease.query.filter_by(unit_id=unit_id, status="active").first()
    if existing_active:
        raise ValueError("This unit already has an active lease.")

    lease = Lease(
        unit_id=unit_id,
        tenant_id=tenant_id,
        start_date=start_date,
        rent_amount_at_start=rent_amount,
        due_day=due_day,
        status="active",
    )

    unit.status = "occupied"
    db.session.add(lease)
    db.session.commit()

    # ✅ Policy 2: decide first billing month
    y, m = start_date.year, start_date.month
    this_month_due = _safe_due_date(y, m, due_day)

    if start_date > this_month_due:
        y, m = _next_month(y, m)

    # Create first month's charge (if missing)
    existing_charge = RentCharge.query.filter_by(lease_id=lease.id, period_year=y, period_month=m).first()
    if not existing_charge:
        first_charge = RentCharge(
            lease_id=lease.id,
            period_year=y,
            period_month=m,
            amount_due=rent_amount,
            late_fee=0,
            due_date=_safe_due_date(y, m, due_day),
            status="unpaid",
        )
        db.session.add(first_charge)
        db.session.commit()

    # ✅ If tenant had paid in advance, apply it immediately to this first charge
    apply_credits_to_lease_charges(lease.id)

    return lease