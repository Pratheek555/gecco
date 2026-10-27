-- AlterTable
ALTER TABLE "gyms" ADD COLUMN     "email_owners_on_payment" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "email_member_receipts" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable: the volatile default gives every existing member their own token.
ALTER TABLE "members" ADD COLUMN     "bills_token" TEXT NOT NULL DEFAULT (replace((gen_random_uuid())::text, '-'::text, ''::text) || replace((gen_random_uuid())::text, '-'::text, ''::text));

-- CreateIndex
CREATE UNIQUE INDEX "members_bills_token_key" ON "members"("bills_token");
