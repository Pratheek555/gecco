-- Preserve the existing PT business rule after adding configurable eligibility.
UPDATE "plans"
SET "trainer_revenue_eligible" = true
WHERE "type" = 'PT';

UPDATE "memberships"
SET "trainer_revenue_eligible_snapshot" = true
WHERE "plan_type_snapshot" = 'PT';
