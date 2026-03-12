from decimal import Decimal
from app.extensions import db
from app.models.payment import Payment
from app.models.rent_charge import RentCharge
from typing import Optional

def _decimal(x) -> Decimal:
    return Decimal(str(x))

def _charge_total_due(charge: RentCharge) -> Decimal:
    return _decimal(charge.amount_due) + _decimal(charge.late_fee)

def _charge_total_paid(charge: RentCharge) -> Decimal:
    total = Decimal("0.00")
    for p in charge.payments:
        total += _decimal(p.amount)
    return total

def recalculate_charge_status(charge: RentCharge) -> None:
    total_paid = _charge_total_paid(charge)
    total_due = _charge_total_due(charge)

    if total_paid <= 0:
        charge.status = "unpaid"
    elif total_paid < total_due:
        charge.status = "partial"
    else:
        charge.status = "paid"

def record_payment(
    lease_id: int,
    amount: float,
    method: str = "cash",
    rent_charge_id: Optional[int] = None,
    reference: Optional[str] = None,
    notes: Optional[str] = None,
    created_by_user_id: Optional[int] = None,
) -> Payment:
    amt = _decimal(amount)

    payment = Payment(
        lease_id=lease_id,
        rent_charge_id=rent_charge_id,
        amount=amt,
        method=method,
        reference=reference,
        notes=notes,
        created_by_user_id=created_by_user_id,
    )

    # ✅ If not linked to a charge, it's credit/advance
    if rent_charge_id is None:
        payment.unapplied_amount = amt
    else:
        payment.unapplied_amount = Decimal("0.00")

    db.session.add(payment)

    # If linked to a charge, update charge status
    if rent_charge_id is not None:
        charge = RentCharge.query.get_or_404(rent_charge_id)
        recalculate_charge_status(charge)

    db.session.commit()
    return payment

def apply_credits_to_lease_charges(lease_id: int) -> int:
    """
    Takes any advance/unapplied payments (credit) and applies them to the oldest unpaid charges.
    Returns number of allocation records created.
    """
    charges = (RentCharge.query
               .filter_by(lease_id=lease_id)
               .order_by(RentCharge.period_year.asc(), RentCharge.period_month.asc())
               .all())

    credits = (Payment.query
               .filter(Payment.lease_id == lease_id, Payment.unapplied_amount > 0)
               .order_by(Payment.paid_at.asc(), Payment.id.asc())
               .all())

    created_allocations = 0

    for charge in charges:
        # Skip fully paid charges
        remaining_due = _charge_total_due(charge) - _charge_total_paid(charge)
        if remaining_due <= 0:
            charge.status = "paid"
            continue

        for credit in credits:
            if remaining_due <= 0:
                break

            if credit.unapplied_amount <= 0:
                continue

            use_amount = min(remaining_due, _decimal(credit.unapplied_amount))

            # ✅ create a child "allocation" payment linked to the charge
            allocation = Payment(
                lease_id=lease_id,
                rent_charge_id=charge.id,
                amount=use_amount,
                method=credit.method,
                reference=credit.reference,
                notes=f"Allocated from advance payment #{credit.id}",
                created_by_user_id=credit.created_by_user_id,
                parent_payment_id=credit.id,
                unapplied_amount=Decimal("0.00"),
                paid_at=credit.paid_at,  # keep original payment time
            )

            db.session.add(allocation)

            # reduce credit
            credit.unapplied_amount = _decimal(credit.unapplied_amount) - use_amount
            remaining_due -= use_amount

            created_allocations += 1

        # update status after allocations
        recalculate_charge_status(charge)

    db.session.commit()
    return created_allocations