-- AlterTable
ALTER TABLE "memberships" ADD COLUMN     "trainer_revenue_eligible_snapshot" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "trainer_revenue_eligible" BOOLEAN NOT NULL DEFAULT false;
