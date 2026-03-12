from datetime import datetime
from app.extensions import db

class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)

    lease_id = db.Column(db.Integer, db.ForeignKey("leases.id"), nullable=False, index=True)

    # Optional link to a specific charge (monthly bill)
    rent_charge_id = db.Column(db.Integer, db.ForeignKey("rent_charges.id"), nullable=True, index=True)

    amount = db.Column(db.Numeric(12, 2), nullable=False)

    paid_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    parent_payment_id = db.Column(db.Integer, db.ForeignKey("payments.id"), nullable=True, index=True)

    unapplied_amount = db.Column(db.Numeric(12, 2), nullable=False, default=0)

    # cash, bank, mpesa
    method = db.Column(db.String(20), nullable=False, default="cash", index=True)

    reference = db.Column(db.String(120), nullable=True, index=True)  # mpesa receipt number etc.
    notes = db.Column(db.Text, nullable=True)

    # who recorded it (manual) - optional
    created_by_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ✅ relationships
    lease = db.relationship("Lease", back_populates="payments")
    rent_charge = db.relationship("RentCharge", back_populates="payments")
    created_by = db.relationship("User")  # no back_populates needed unless you want user.payments_recorded

    def __repr__(self) -> str:
        return f"<Payment id={self.id} lease_id={self.lease_id} amount={self.amount} method={self.method}>"