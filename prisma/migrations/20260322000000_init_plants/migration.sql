CREATE TABLE IF NOT EXISTS "plants" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "photo_url" TEXT,
  "location" TEXT NOT NULL,
  "watering_days" INTEGER NOT NULL DEFAULT 7,
  "reminders_enabled" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "plants_pkey" PRIMARY KEY ("id")
);
