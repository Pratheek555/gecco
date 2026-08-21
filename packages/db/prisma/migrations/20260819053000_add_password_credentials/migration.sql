-- Existing users may have been provisioned by another identity provider, so
-- retain a nullable hash until they set a password through a recovery flow.
ALTER TABLE "users" ADD COLUMN "password_hash" TEXT;
