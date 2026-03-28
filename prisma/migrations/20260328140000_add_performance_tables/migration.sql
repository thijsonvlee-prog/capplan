-- CreateTable
CREATE TABLE "PerformanceEvent" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "environment" TEXT NOT NULL DEFAULT 'production',
    "source" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "durationMs" INTEGER,
    "status" TEXT,
    "requestId" TEXT,
    "metadata" JSONB,

    CONSTRAINT "PerformanceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceSummary" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "avgMs" DOUBLE PRECISION NOT NULL,
    "p95Ms" DOUBLE PRECISION NOT NULL,
    "maxMs" DOUBLE PRECISION NOT NULL,
    "minMs" DOUBLE PRECISION NOT NULL,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "slowCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,

    CONSTRAINT "PerformanceSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PerformanceEvent_timestamp_idx" ON "PerformanceEvent"("timestamp");

-- CreateIndex
CREATE INDEX "PerformanceEvent_source_name_timestamp_idx" ON "PerformanceEvent"("source", "name", "timestamp");

-- CreateIndex
CREATE INDEX "PerformanceEvent_eventType_timestamp_idx" ON "PerformanceEvent"("eventType", "timestamp");

-- CreateIndex
CREATE INDEX "PerformanceEvent_status_timestamp_idx" ON "PerformanceEvent"("status", "timestamp");

-- CreateIndex
CREATE INDEX "PerformanceSummary_date_idx" ON "PerformanceSummary"("date");

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceSummary_date_source_name_key" ON "PerformanceSummary"("date", "source", "name");
