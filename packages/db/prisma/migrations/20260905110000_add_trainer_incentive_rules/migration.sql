CREATE TABLE "trainer_incentive_rules" (
    "id" UUID NOT NULL,
    "trainer_id" UUID NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "starts_on" DATE NOT NULL,
    "ends_on" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainer_incentive_rules_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "trainer_incentive_rules_percentage_check" CHECK ("percentage" >= 0 AND "percentage" <= 100)
);

CREATE UNIQUE INDEX "trainer_incentive_rules_trainer_id_starts_on_key"
ON "trainer_incentive_rules"("trainer_id", "starts_on");

CREATE INDEX "trainer_incentive_rules_trainer_id_starts_on_ends_on_idx"
ON "trainer_incentive_rules"("trainer_id", "starts_on", "ends_on");

ALTER TABLE "trainer_incentive_rules"
ADD CONSTRAINT "trainer_incentive_rules_trainer_id_fkey"
FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
