ALTER TYPE "LeadActivityType" ADD VALUE 'TRIAL';
ALTER TYPE "LeadActivityType" ADD VALUE 'ASSIGNMENT';

CREATE TYPE "LeadLostReason" AS ENUM (
  'PRICE',
  'LOCATION',
  'TIMING',
  'JOINED_ELSEWHERE',
  'NO_RESPONSE',
  'NOT_INTERESTED',
  'OTHER'
);

ALTER TABLE "leads"
  ADD COLUMN "lost_reason_code" "LeadLostReason",
  ADD COLUMN "assigned_to_user_id" UUID,
  ADD COLUMN "trial_at" TIMESTAMP(3),
  ADD COLUMN "first_contacted_at" TIMESTAMP(3);

-- Existing lost leads keep their free-text reason as details.
UPDATE "leads" SET "lost_reason_code" = 'OTHER' WHERE "status" = 'LOST';

-- Best-effort backfill: the earliest outreach activity marks first contact.
UPDATE "leads" AS l
SET "first_contacted_at" = a.first_at
FROM (
  SELECT "lead_id", MIN("created_at") AS first_at
  FROM "lead_activities"
  WHERE "type" IN ('CALL', 'WHATSAPP', 'EMAIL')
  GROUP BY "lead_id"
) AS a
WHERE a."lead_id" = l."id";

CREATE INDEX "leads_gym_id_trial_at_idx" ON "leads"("gym_id", "trial_at");
CREATE INDEX "leads_gym_id_assigned_to_user_id_idx" ON "leads"("gym_id", "assigned_to_user_id");

ALTER TABLE "leads"
  ADD CONSTRAINT "leads_assigned_to_user_id_fkey"
  FOREIGN KEY ("assigned_to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
