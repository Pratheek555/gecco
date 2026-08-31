ALTER TABLE "memberships"
  ADD COLUMN "duration_months" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "memberships"
  ADD CONSTRAINT "memberships_duration_months_check" CHECK ("duration_months" > 0);

UPDATE "memberships" AS membership
SET "duration_months" = plan."duration_months"
FROM "plans" AS plan
WHERE membership."plan_id" = plan."id";
