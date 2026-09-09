CREATE TYPE "MemberImportStatus" AS ENUM (
  'UPLOADING',
  'QUEUED',
  'VALIDATING',
  'READY_FOR_REVIEW',
  'FAILED',
  'CANCELLED'
);

CREATE TYPE "MemberImportRowStatus" AS ENUM ('VALID', 'EXCLUDED');

CREATE TABLE "member_imports" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "gym_id" UUID NOT NULL,
  "created_by_user_id" UUID NOT NULL,
  "original_file_name" TEXT NOT NULL,
  "storage_key" TEXT NOT NULL,
  "content_type" TEXT NOT NULL,
  "file_size" INTEGER NOT NULL,
  "status" "MemberImportStatus" NOT NULL DEFAULT 'UPLOADING',
  "total_rows" INTEGER NOT NULL DEFAULT 0,
  "processed_rows" INTEGER NOT NULL DEFAULT 0,
  "valid_rows" INTEGER NOT NULL DEFAULT 0,
  "excluded_rows" INTEGER NOT NULL DEFAULT 0,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "failure_message" TEXT,
  "started_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "member_imports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "member_import_rows" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "import_id" UUID NOT NULL,
  "row_number" INTEGER NOT NULL,
  "member_id" TEXT,
  "full_name" TEXT,
  "normalized_data" JSONB NOT NULL,
  "errors" JSONB NOT NULL,
  "status" "MemberImportRowStatus" NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "member_import_rows_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "member_imports_storage_key_key" ON "member_imports"("storage_key");
CREATE INDEX "member_imports_gym_id_created_at_idx" ON "member_imports"("gym_id", "created_at");
CREATE INDEX "member_imports_status_created_at_idx" ON "member_imports"("status", "created_at");
CREATE UNIQUE INDEX "member_import_rows_import_id_row_number_key" ON "member_import_rows"("import_id", "row_number");
CREATE INDEX "member_import_rows_import_id_status_row_number_idx" ON "member_import_rows"("import_id", "status", "row_number");

ALTER TABLE "member_imports"
  ADD CONSTRAINT "member_imports_gym_id_fkey"
  FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "member_imports"
  ADD CONSTRAINT "member_imports_created_by_user_id_fkey"
  FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "member_import_rows"
  ADD CONSTRAINT "member_import_rows_import_id_fkey"
  FOREIGN KEY ("import_id") REFERENCES "member_imports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
