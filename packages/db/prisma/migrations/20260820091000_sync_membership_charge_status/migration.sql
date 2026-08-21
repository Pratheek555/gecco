-- Keep the charge status as a write-optimised cache. The balance view remains
-- authoritative for dashboard reads, but this makes charge queries ergonomic.
CREATE OR REPLACE FUNCTION "refresh_membership_charge_payment_status"("target_charge_id" UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE "membership_charges" AS charge
  SET "status" = CASE
    WHEN allocation."amount" >= charge."amount" THEN 'PAID'::"MembershipChargeStatus"
    WHEN allocation."amount" > 0 THEN 'PARTIALLY_PAID'::"MembershipChargeStatus"
    ELSE 'OPEN'::"MembershipChargeStatus"
  END
  FROM (
    SELECT
      candidate."id",
      COALESCE(SUM(payment_allocation."amount") FILTER (WHERE payment."status" = 'SUCCEEDED'), 0) AS "amount"
    FROM "membership_charges" AS candidate
    LEFT JOIN "payment_allocations" AS payment_allocation ON payment_allocation."charge_id" = candidate."id"
    LEFT JOIN "payments" AS payment ON payment."id" = payment_allocation."payment_id"
    WHERE candidate."id" = "target_charge_id"
    GROUP BY candidate."id"
  ) AS allocation
  WHERE charge."id" = allocation."id"
    AND charge."status" <> 'VOIDED';
END;
$$;

CREATE OR REPLACE FUNCTION "validate_payment_allocation"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  payment_amount DECIMAL(12,2);
  charge_amount DECIMAL(12,2);
  allocated_payment_amount DECIMAL(12,2);
  allocated_charge_amount DECIMAL(12,2);
  payment_gym_id UUID;
  payment_member_id UUID;
  charge_gym_id UUID;
  charge_member_id UUID;
BEGIN
  SELECT "amount", "gym_id", "member_id"
    INTO payment_amount, payment_gym_id, payment_member_id
  FROM "payments"
  WHERE "id" = NEW."payment_id" AND "status" = 'SUCCEEDED'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Allocations require a successful payment';
  END IF;

  SELECT "amount", "gym_id", "member_id"
    INTO charge_amount, charge_gym_id, charge_member_id
  FROM "membership_charges"
  WHERE "id" = NEW."charge_id" AND "status" <> 'VOIDED'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Allocations require a non-voided charge';
  END IF;

  IF payment_gym_id <> charge_gym_id OR payment_member_id <> charge_member_id THEN
    RAISE EXCEPTION 'Payment and charge must belong to the same gym member';
  END IF;

  SELECT COALESCE(SUM("amount"), 0) INTO allocated_payment_amount
  FROM "payment_allocations" WHERE "payment_id" = NEW."payment_id";
  IF allocated_payment_amount > payment_amount THEN
    RAISE EXCEPTION 'Payment allocations exceed the payment amount';
  END IF;

  SELECT COALESCE(SUM("amount"), 0) INTO allocated_charge_amount
  FROM "payment_allocations" WHERE "charge_id" = NEW."charge_id";
  IF allocated_charge_amount > charge_amount THEN
    RAISE EXCEPTION 'Payment allocations exceed the charge amount';
  END IF;

  PERFORM "refresh_membership_charge_payment_status"(NEW."charge_id");
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION "sync_membership_charge_status_after_payment_change"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  charge_record RECORD;
BEGIN
  FOR charge_record IN
    SELECT DISTINCT "charge_id"
    FROM "payment_allocations"
    WHERE "payment_id" = NEW."id"
  LOOP
    PERFORM "refresh_membership_charge_payment_status"(charge_record."charge_id");
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER "payments_sync_charge_status"
AFTER UPDATE OF "status" ON "payments"
FOR EACH ROW EXECUTE FUNCTION "sync_membership_charge_status_after_payment_change"();

SELECT "refresh_membership_charge_payment_status"("id")
FROM "membership_charges";
