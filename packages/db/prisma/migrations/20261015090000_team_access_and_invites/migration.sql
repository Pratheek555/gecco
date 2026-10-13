CREATE TYPE "MemberScope" AS ENUM ('ALL', 'ASSIGNED');

ALTER TABLE "gyms" ADD COLUMN "seat_limit" INTEGER NOT NULL DEFAULT 5;

ALTER TABLE "gym_users"
  ADD COLUMN "permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "member_scope" "MemberScope" NOT NULL DEFAULT 'ALL';

-- Preserve existing access: staff keep the operational permissions they had
-- under the fixed role policy; trainers keep no access, scoped to their clients.
UPDATE "gym_users"
SET "permissions" = ARRAY[
  'overview:read', 'members:read', 'members:write', 'leads:read', 'leads:write',
  'payments:read', 'payments:record', 'memberships:read', 'memberships:write',
  'memberships:cancel', 'plans:read', 'trainers:read', 'trainers:manage'
]::TEXT[]
WHERE "role" = 'STAFF';

UPDATE "gym_users" SET "member_scope" = 'ASSIGNED' WHERE "role" = 'TRAINER';

-- A person can be a trainer at several gyms, but only once per gym.
DROP INDEX "trainers_user_id_key";
CREATE UNIQUE INDEX "trainers_gym_id_user_id_key" ON "trainers"("gym_id", "user_id");

CREATE TABLE "gym_invites" (
    "id" UUID NOT NULL,
    "gym_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "invitee_name" TEXT,
    "role" "GymUserRole" NOT NULL,
    "permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "member_scope" "MemberScope" NOT NULL DEFAULT 'ALL',
    "trainer_id" UUID,
    "invited_by_user_id" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "accepted_by_user_id" UUID,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gym_invites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "gym_invites_token_hash_key" ON "gym_invites"("token_hash");
CREATE INDEX "gym_invites_gym_id_accepted_at_revoked_at_expires_at_idx" ON "gym_invites"("gym_id", "accepted_at", "revoked_at", "expires_at");

ALTER TABLE "gym_invites" ADD CONSTRAINT "gym_invites_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "gym_invites" ADD CONSTRAINT "gym_invites_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "gym_invites" ADD CONSTRAINT "gym_invites_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "gym_invites" ADD CONSTRAINT "gym_invites_accepted_by_user_id_fkey" FOREIGN KEY ("accepted_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
