-- AlterTable: Add API-specific fields to ImportSource
ALTER TABLE "ImportSource" ADD COLUMN "apiUrl" TEXT;
ALTER TABLE "ImportSource" ADD COLUMN "apiMethod" TEXT DEFAULT 'GET';
ALTER TABLE "ImportSource" ADD COLUMN "apiHeaders" JSONB;
ALTER TABLE "ImportSource" ADD COLUMN "apiAuthType" TEXT DEFAULT 'NONE';
ALTER TABLE "ImportSource" ADD COLUMN "apiCredentials" JSONB;
