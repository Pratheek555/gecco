CREATE TYPE "LeadStatus" AS ENUM (
  'NEW',
  'CONTACTED',
  'TRIAL_BOOKED',
  'TRIAL_COMPLETED',
  'WON',
  'LOST'
);

CREATE TYPE "LeadSource" AS ENUM (
  'WALK_IN',
  'REFERRAL',
  'INSTAGRAM',
  'FACEBOOK',
  'GOOGLE',
  'WEBSITE',
  'PHONE',
  'OTHER'
);

CREATE TYPE "LeadActivityType" AS ENUM (
  'NOTE',
  'CALL',
  'WHATSAPP',
  'EMAIL',
  'STATUS_CHANGE',
  'FOLLOW_UP',
  'CONVERSION'
);

CREATE TABLE "leads" (
  "id" UUID NOT NULL,
  "gym_id" UUID NOT NULL,
  "full_name" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  "source" "LeadSource" NOT NULL DEFAULT 'OTHER',
  "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
  "interested_plan" "PlanType",
  "next_follow_up_at" TIMESTAMP(3),
  "last_contacted_at" TIMESTAMP(3),
  "lost_reason" TEXT,
  "converted_member_id" UUID,
  "converted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lead_activities" (
  "id" UUID NOT NULL,
  "lead_id" UUID NOT NULL,
  "type" "LeadActivityType" NOT NULL,
  "body" TEXT NOT NULL,
  "created_by_user_id" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "leads_converted_member_id_key" ON "leads"("converted_member_id");
CREATE INDEX "leads_gym_id_status_updated_at_idx" ON "leads"("gym_id", "status", "updated_at");
CREATE INDEX "leads_gym_id_next_follow_up_at_idx" ON "leads"("gym_id", "next_follow_up_at");
CREATE INDEX "leads_gym_id_full_name_idx" ON "leads"("gym_id", "full_name");
CREATE INDEX "lead_activities_lead_id_created_at_idx" ON "lead_activities"("lead_id", "created_at");

ALTER TABLE "leads"
  ADD CONSTRAINT "leads_gym_id_fkey"
  FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "leads"
  ADD CONSTRAINT "leads_converted_member_id_fkey"
  FOREIGN KEY ("converted_member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "lead_activities"
  ADD CONSTRAINT "lead_activities_lead_id_fkey"
  FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lead_activities"
  ADD CONSTRAINT "lead_activities_created_by_user_id_fkey"
  FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
