CREATE TABLE "gym_signup_invites" (
    "id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "gym_name" TEXT,
    "email" TEXT,
    "seat_limit" INTEGER NOT NULL DEFAULT 5,
    "note" TEXT,
    "created_by_user_id" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "gym_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gym_signup_invites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "gym_signup_invites_token_hash_key" ON "gym_signup_invites"("token_hash");
CREATE UNIQUE INDEX "gym_signup_invites_gym_id_key" ON "gym_signup_invites"("gym_id");
CREATE INDEX "gym_signup_invites_created_at_idx" ON "gym_signup_invites"("created_at");

ALTER TABLE "gym_signup_invites" ADD CONSTRAINT "gym_signup_invites_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "gym_signup_invites" ADD CONSTRAINT "gym_signup_invites_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
