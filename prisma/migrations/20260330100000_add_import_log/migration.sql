-- CreateTable
CREATE TABLE "ImportLog" (
    "id" TEXT NOT NULL,
    "importSourceId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "importedRows" INTEGER NOT NULL,
    "skippedRows" INTEGER NOT NULL,
    "errors" JSONB,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImportLog_importSourceId_idx" ON "ImportLog"("importSourceId");

-- CreateIndex
CREATE INDEX "ImportLog_executedAt_idx" ON "ImportLog"("executedAt");

-- AddForeignKey
ALTER TABLE "ImportLog" ADD CONSTRAINT "ImportLog_importSourceId_fkey" FOREIGN KEY ("importSourceId") REFERENCES "ImportSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
