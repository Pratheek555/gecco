ALTER TYPE "MemberImportStatus" ADD VALUE 'COMMITTING';
ALTER TYPE "MemberImportStatus" ADD VALUE 'COMPLETED';
ALTER TYPE "MemberImportStatus" ADD VALUE 'COMPLETED_WITH_ERRORS';

ALTER TABLE "member_imports"
  ADD COLUMN "imported_rows" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "correction_for_id" UUID;

CREATE INDEX "member_imports_correction_for_id_idx" ON "member_imports"("correction_for_id");

ALTER TABLE "member_imports"
  ADD CONSTRAINT "member_imports_correction_for_id_fkey"
  FOREIGN KEY ("correction_for_id") REFERENCES "member_imports"("id") ON DELETE SET NULL ON UPDATE CASCADE;
