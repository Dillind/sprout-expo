-- CreateEnum
CREATE TYPE "CareType" AS ENUM ('WATER', 'FERTILIZE', 'REPOT');

-- AlterTable
ALTER TABLE "plants"
  ADD COLUMN "water_amount_ml" INTEGER,
  ADD COLUMN "fertilize_days" INTEGER,
  ADD COLUMN "repot_days" INTEGER,
  ADD COLUMN "last_watered_at" TIMESTAMP(3),
  ADD COLUMN "last_fertilized_at" TIMESTAMP(3),
  ADD COLUMN "last_repotted_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "plant_care_logs" (
  "id" TEXT NOT NULL,
  "plant_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "type" "CareType" NOT NULL,
  "done_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "plant_care_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plant_care_logs_plant_id_idx" ON "plant_care_logs"("plant_id");

-- CreateIndex
CREATE INDEX "plant_care_logs_user_id_idx" ON "plant_care_logs"("user_id");

-- AddForeignKey
ALTER TABLE "plant_care_logs"
  ADD CONSTRAINT "plant_care_logs_plant_id_fkey"
  FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
