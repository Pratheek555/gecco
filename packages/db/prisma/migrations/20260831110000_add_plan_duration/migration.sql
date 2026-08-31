ALTER TABLE "plans"
  ADD COLUMN "duration_months" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "plans"
  ADD CONSTRAINT "plans_duration_months_check" CHECK ("duration_months" > 0);

UPDATE "plans"
SET "duration_months" = 3
WHERE lower("code") IN ('pt-quaterly', 'pt-quarterly')
   OR lower("name") LIKE '%quarter%';

UPDATE "memberships" AS membership
SET "ends_on" = (membership."starts_on" + make_interval(months => plan."duration_months"))::date
FROM "plans" AS plan
WHERE membership."plan_id" = plan."id"
  AND plan."duration_months" > 1;
