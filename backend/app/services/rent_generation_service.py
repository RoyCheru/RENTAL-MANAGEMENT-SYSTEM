from datetime import date
from calendar import monthrange
from app.extensions import db
from app.models.lease import Lease
from app.models.rent_charge import RentCharge

def _safe_due_date(year: int, month: int, due_day: int) -> date:
    # clamp due_day to the last day of the month
    last_day = monthrange(year, month)[1]
    day = min(max(due_day, 1), min(28, last_day))  # keep it 1-28 safe
    return date(year, month, day)

def generate_monthly_charges(year: int, month: int) -> int:
    """
    Creates RentCharge rows for all active leases for the given year/month.
    Returns how many charges were created.
    """
    active_leases = Lease.query.filter_by(status="active").all()
    created = 0

    for lease in active_leases:
        # avoid duplicates (unique constraint already helps, but we check)
        exists = RentCharge.query.filter_by(
            lease_id=lease.id,
            period_year=year,
            period_month=month
        ).first()

        if exists:
            continue

        due_date = _safe_due_date(year, month, lease.due_day)

        charge = RentCharge(
            lease_id=lease.id,
            period_year=year,
            period_month=month,
            amount_due=lease.rent_amount_at_start,
            late_fee=0,
            due_date=due_date,
            status="unpaid"
        )

        db.session.add(charge)
        created += 1

    db.session.commit()
    return created