-- A charge records what is owed; a payment records money received; allocations
-- apply received money to a specific charge. This migration keeps the legacy
-- payment.membership_id relation so existing readers remain compatible.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "MembershipChargeKind" AS ENUM ('MEMBERSHIP_FEE', 'RENEWAL', 'ADD_ON', 'ADJUSTMENT');
CREATE TYPE "MembershipChargeStatus" AS ENUM ('OPEN', 'PARTIALLY_PAID', 'PAID', 'VOIDED');

ALTER TABLE "payments"
  ADD COLUMN "gym_id" UUID,
  ADD COLUMN "member_id" UUID;

UPDATE "payments" AS payment
SET
  "gym_id" = member."gym_id",
  "member_id" = membership."member_id"
FROM "memberships" AS membership
JOIN "members" AS member ON member."id" = membership."member_id"
WHERE payment."membership_id" = membership."id";

ALTER TABLE "payments"
  ALTER COLUMN "gym_id" SET NOT NULL,
  ALTER COLUMN "member_id" SET NOT NULL,
  ALTER COLUMN "membership_id" DROP NOT NULL;

CREATE TABLE "membership_charges" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "gym_id" UUID NOT NULL,
  "member_id" UUID NOT NULL,
  "membership_id" UUID NOT NULL,
  "kind" "MembershipChargeKind" NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "due_on" DATE NOT NULL,
  "status" "MembershipChargeStatus" NOT NULL DEFAULT 'OPEN',
  "description" TEXT,
  "voided_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "membership_charges_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "membership_charges_amount_check" CHECK ("amount" > 0)
);

CREATE TABLE "payment_allocations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "payment_id" UUID NOT NULL,
  "charge_id" UUID NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "payment_allocations_payment_id_charge_id_key" UNIQUE ("payment_id", "charge_id"),
  CONSTRAINT "payment_allocations_amount_check" CHECK ("amount" > 0)
);

ALTER TABLE "payments"
  ADD CONSTRAINT "payments_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "payments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "membership_charges"
  ADD CONSTRAINT "membership_charges_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "membership_charges_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "membership_charges_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payment_allocations"
  ADD CONSTRAINT "payment_allocations_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "payment_allocations_charge_id_fkey" FOREIGN KEY ("charge_id") REFERENCES "membership_charges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "payments_gym_id_member_id_paid_on_idx" ON "payments"("gym_id", "member_id", "paid_on");
CREATE INDEX "membership_charges_gym_id_status_due_on_idx" ON "membership_charges"("gym_id", "status", "due_on");
CREATE INDEX "membership_charges_member_id_status_idx" ON "membership_charges"("member_id", "status");
CREATE INDEX "membership_charges_membership_id_idx" ON "membership_charges"("membership_id");
CREATE INDEX "payment_allocations_charge_id_idx" ON "payment_allocations"("charge_id");

-- Backfill one initial charge per existing membership, then attach successful
-- legacy payments to that charge. Refunded and voided payments remain receipts
-- without an active allocation.
INSERT INTO "membership_charges" ("gym_id", "member_id", "membership_id", "kind", "amount", "due_on", "status", "description")
SELECT
  member."gym_id",
  membership."member_id",
  membership."id",
  'MEMBERSHIP_FEE'::"MembershipChargeKind",
  membership."agreed_fee",
  membership."starts_on",
  CASE WHEN membership."status" = 'CANCELLED' THEN 'VOIDED'::"MembershipChargeStatus" ELSE 'OPEN'::"MembershipChargeStatus" END,
  'Migrated from membership agreed fee'
FROM "memberships" AS membership
JOIN "members" AS member ON member."id" = membership."member_id";

INSERT INTO "payment_allocations" ("payment_id", "charge_id", "amount")
SELECT payment."id", charge."id", payment."amount"
FROM "payments" AS payment
JOIN "membership_charges" AS charge
  ON charge."membership_id" = payment."membership_id"
  AND charge."kind" = 'MEMBERSHIP_FEE'
WHERE payment."status" = 'SUCCEEDED';

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

  RETURN NEW;
END;
$$;

CREATE TRIGGER "payment_allocations_validate_amounts"
AFTER INSERT ON "payment_allocations"
FOR EACH ROW EXECUTE FUNCTION "validate_payment_allocation"();

CREATE OR REPLACE FUNCTION "prevent_payment_allocation_mutation"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Payment allocations are immutable; create a correcting entry instead';
END;
$$;

CREATE TRIGGER "payment_allocations_immutable"
BEFORE UPDATE OR DELETE ON "payment_allocations"
FOR EACH ROW EXECUTE FUNCTION "prevent_payment_allocation_mutation"();

CREATE OR REPLACE VIEW "member_balance_summary" AS
WITH allocated_by_charge AS (
  SELECT allocation."charge_id", SUM(allocation."amount") AS "amount"
  FROM "payment_allocations" AS allocation
  JOIN "payments" AS payment ON payment."id" = allocation."payment_id"
  WHERE payment."status" = 'SUCCEEDED'
  GROUP BY allocation."charge_id"
), charge_balances AS (
  SELECT
    charge."gym_id",
    charge."member_id",
    charge."due_on",
    GREATEST(charge."amount" - COALESCE(allocated."amount", 0), 0) AS "outstanding"
  FROM "membership_charges" AS charge
  LEFT JOIN allocated_by_charge AS allocated ON allocated."charge_id" = charge."id"
  WHERE charge."status" <> 'VOIDED'
), unallocated_payment_credit AS (
  SELECT
    payment."gym_id",
    payment."member_id",
    SUM(payment."amount" - COALESCE(allocated."amount", 0)) AS "available_credit"
  FROM "payments" AS payment
  LEFT JOIN (
    SELECT "payment_id", SUM("amount") AS "amount"
    FROM "payment_allocations"
    GROUP BY "payment_id"
  ) AS allocated ON allocated."payment_id" = payment."id"
  WHERE payment."status" = 'SUCCEEDED'
  GROUP BY payment."gym_id", payment."member_id"
), member_balances AS (
  SELECT
    member."gym_id",
    member."id" AS "member_id",
    COALESCE(SUM(charge."outstanding"), 0) AS "total_outstanding",
    COALESCE(SUM(charge."outstanding") FILTER (WHERE charge."due_on" < CURRENT_DATE), 0) AS "overdue_amount",
    MIN(charge."due_on") FILTER (WHERE charge."outstanding" > 0) AS "oldest_due_on"
  FROM "members" AS member
  LEFT JOIN charge_balances AS charge ON charge."member_id" = member."id"
  GROUP BY member."gym_id", member."id"
)
SELECT
  balance."gym_id",
  balance."member_id",
  balance."total_outstanding",
  balance."overdue_amount",
  COALESCE(credit."available_credit", 0) AS "available_credit",
  balance."oldest_due_on",
  CASE
    WHEN balance."overdue_amount" > 0 THEN 'OVERDUE'
    WHEN balance."total_outstanding" > 0 THEN 'OPEN'
    WHEN COALESCE(credit."available_credit", 0) > 0 THEN 'CREDIT'
    ELSE 'PAID'
  END AS "payment_state"
FROM member_balances AS balance
LEFT JOIN unallocated_payment_credit AS credit
  ON credit."gym_id" = balance."gym_id" AND credit."member_id" = balance."member_id";
