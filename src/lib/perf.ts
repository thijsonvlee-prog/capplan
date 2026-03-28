/**
 * Performance Logging Library
 *
 * Lightweight, fire-and-forget performance event logging for CapPlan.
 * Logs are stored in Postgres (PerformanceEvent table) and designed
 * for later analysis by nightly runs.
 *
 * Key design decisions:
 * - Fire-and-forget: logging never blocks or crashes the app
 * - Async writes with no await in hot paths (unless explicitly requested)
 * - Sampling for high-frequency events
 * - Slow-event thresholds to reduce noise
 * - No sensitive data in metadata
 */

import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PerfSource = "api" | "frontend" | "db" | "system";
export type PerfEventType = "request" | "query" | "action" | "error";
export type PerfStatus = "success" | "error" | "slow";

export interface PerfEventInput {
  source: PerfSource;
  eventType: PerfEventType;
  name: string;
  durationMs?: number;
  status?: PerfStatus;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const CONFIG = {
  /** Events slower than this (ms) are marked as "slow" */
  slowThresholdMs: 500,
  /** Sample rate for non-slow events (1.0 = log everything, 0.1 = 10%) */
  sampleRate: 1.0,
  /** Whether logging is enabled */
  enabled: process.env.PERF_LOGGING_ENABLED !== "false",
  /** Current environment */
  environment: process.env.NODE_ENV || "development",
} as const;

// ---------------------------------------------------------------------------
// Core logging
// ---------------------------------------------------------------------------

/**
 * Log a performance event. Fire-and-forget by default.
 * Never throws — errors are silently caught.
 */
export function logPerfEvent(event: PerfEventInput): void {
  if (!CONFIG.enabled) return;

  // Determine status
  const status =
    event.status ||
    (event.durationMs && event.durationMs > CONFIG.slowThresholdMs
      ? "slow"
      : "success");

  // Sampling: always log slow events and errors, sample normal events
  if (
    status === "success" &&
    CONFIG.sampleRate < 1.0 &&
    Math.random() > CONFIG.sampleRate
  ) {
    return;
  }

  // Fire-and-forget write
  writePerfEvent({
    ...event,
    status,
    environment: CONFIG.environment,
  }).catch(() => {
    // Silently ignore logging failures — never impact the app
  });
}

async function writePerfEvent(
  event: PerfEventInput & { environment: string }
): Promise<void> {
  await prisma.performanceEvent.create({
    data: {
      source: event.source,
      eventType: event.eventType,
      name: event.name,
      durationMs: event.durationMs ?? null,
      status: event.status ?? null,
      requestId: event.requestId ?? null,
      environment: event.environment,
      metadata: (event.metadata as any) ?? undefined,
    },
  });
}

// ---------------------------------------------------------------------------
// Timing helpers
// ---------------------------------------------------------------------------

/**
 * Measure the duration of an async operation and log it.
 *
 * Usage:
 *   const result = await measureAsync("loadDrivers", "api", "query", async () => {
 *     return await prisma.driver.findMany();
 *   });
 */
export async function measureAsync<T>(
  name: string,
  source: PerfSource,
  eventType: PerfEventType,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const start = performance.now();
  let status: PerfStatus = "success";
  let error: unknown;

  try {
    const result = await fn();
    return result;
  } catch (err) {
    status = "error";
    error = err;
    throw err;
  } finally {
    const durationMs = Math.round(performance.now() - start);
    logPerfEvent({
      source,
      eventType,
      name,
      durationMs,
      status:
        status === "error"
          ? "error"
          : durationMs > CONFIG.slowThresholdMs
            ? "slow"
            : "success",
      metadata: {
        ...metadata,
        ...(status === "error" && error instanceof Error
          ? { errorMessage: error.message }
          : {}),
      },
    });
  }
}

// ---------------------------------------------------------------------------
// API Route wrapper
// ---------------------------------------------------------------------------

type NextRouteHandler = (
  request: any,
  context?: any
) => Promise<Response>;

/**
 * Wrap a Next.js API route handler with automatic performance logging.
 *
 * Usage:
 *   export const GET = withPerfLogging("GET /api/planning/for-range", handler);
 */
export function withPerfLogging(
  name: string,
  handler: NextRouteHandler,
  options?: { metadata?: Record<string, unknown> }
): NextRouteHandler {
  return async (request: Request, context?: any): Promise<Response> => {
    const start = performance.now();
    const requestId = crypto.randomUUID();
    let status: PerfStatus = "success";
    let responseStatus: number | undefined;

    try {
      const response = await handler(request, context);
      responseStatus = response.status;
      if (responseStatus >= 400) {
        status = "error";
      }
      return response;
    } catch (err) {
      status = "error";
      throw err;
    } finally {
      const durationMs = Math.round(performance.now() - start);
      logPerfEvent({
        source: "api",
        eventType: "request",
        name,
        durationMs,
        requestId,
        status:
          status === "error"
            ? "error"
            : durationMs > CONFIG.slowThresholdMs
              ? "slow"
              : "success",
        metadata: {
          ...options?.metadata,
          httpStatus: responseStatus,
          method: name.split(" ")[0],
          url: request.url ? new URL(request.url).pathname : undefined,
        },
      });
    }
  };
}

// ---------------------------------------------------------------------------
// Analysis helpers (for nightly runs)
// ---------------------------------------------------------------------------

/**
 * Get the slowest events in a time range.
 */
export async function getSlowEvents(options: {
  since?: Date;
  limit?: number;
  source?: PerfSource;
  minDurationMs?: number;
}) {
  const since = options.since ?? new Date(Date.now() - 24 * 60 * 60 * 1000);
  return prisma.performanceEvent.findMany({
    where: {
      timestamp: { gte: since },
      durationMs: { gte: options.minDurationMs ?? 100 },
      ...(options.source ? { source: options.source } : {}),
    },
    orderBy: { durationMs: "desc" },
    take: options.limit ?? 50,
  });
}

/**
 * Get aggregated stats per route/action for a time range.
 * Returns raw data that can be processed for p95 etc.
 */
export async function getRouteStats(options: {
  since?: Date;
  source?: PerfSource;
}) {
  const since = options.since ?? new Date(Date.now() - 24 * 60 * 60 * 1000);

  const events = await prisma.performanceEvent.findMany({
    where: {
      timestamp: { gte: since },
      durationMs: { not: null },
      ...(options.source ? { source: options.source } : {}),
    },
    select: {
      name: true,
      source: true,
      durationMs: true,
      status: true,
    },
    orderBy: { name: "asc" },
  });

  // Group and compute stats in-memory (small dataset per day)
  const groups = new Map<
    string,
    { durations: number[]; errors: number; slow: number }
  >();

  for (const event of events) {
    const key = `${event.source}:${event.name}`;
    let group = groups.get(key);
    if (!group) {
      group = { durations: [], errors: 0, slow: 0 };
      groups.set(key, group);
    }
    if (event.durationMs != null) group.durations.push(event.durationMs);
    if (event.status === "error") group.errors++;
    if (event.status === "slow") group.slow++;
  }

  const stats: Array<{
    source: string;
    name: string;
    count: number;
    avgMs: number;
    p95Ms: number;
    maxMs: number;
    minMs: number;
    errorCount: number;
    slowCount: number;
  }> = [];

  const entries = Array.from(groups.entries());
  for (const [key, group] of entries) {
    const [source, name] = key.split(":", 2);
    const sorted = group.durations.sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);
    stats.push({
      source,
      name,
      count: sorted.length,
      avgMs: Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length),
      p95Ms: sorted[p95Index] ?? sorted[sorted.length - 1] ?? 0,
      maxMs: sorted[sorted.length - 1] ?? 0,
      minMs: sorted[0] ?? 0,
      errorCount: group.errors,
      slowCount: group.slow,
    });
  }

  return stats.sort((a, b) => b.p95Ms - a.p95Ms);
}

/**
 * Generate and store daily summaries. Called by nightly analysis runs.
 */
export async function generateDailySummary(date?: string) {
  const targetDate =
    date ?? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const dayStart = new Date(`${targetDate}T00:00:00.000Z`);
  const dayEnd = new Date(`${targetDate}T23:59:59.999Z`);

  const stats = await getRouteStats({
    since: dayStart,
  });

  // Filter to only events from the target day
  for (const stat of stats) {
    await prisma.performanceSummary.upsert({
      where: {
        date_source_name: {
          date: targetDate,
          source: stat.source,
          name: stat.name,
        },
      },
      create: {
        date: targetDate,
        source: stat.source,
        name: stat.name,
        count: stat.count,
        avgMs: stat.avgMs,
        p95Ms: stat.p95Ms,
        maxMs: stat.maxMs,
        minMs: stat.minMs,
        errorCount: stat.errorCount,
        slowCount: stat.slowCount,
      },
      update: {
        count: stat.count,
        avgMs: stat.avgMs,
        p95Ms: stat.p95Ms,
        maxMs: stat.maxMs,
        minMs: stat.minMs,
        errorCount: stat.errorCount,
        slowCount: stat.slowCount,
      },
    });
  }

  return stats;
}

/**
 * Get error events with performance context.
 */
export async function getErrorEvents(options: {
  since?: Date;
  limit?: number;
  name?: string;
}) {
  const since = options.since ?? new Date(Date.now() - 24 * 60 * 60 * 1000);
  return prisma.performanceEvent.findMany({
    where: {
      timestamp: { gte: since },
      status: "error",
      ...(options.name ? { name: options.name } : {}),
    },
    orderBy: { timestamp: "desc" },
    take: options.limit ?? 50,
  });
}

/**
 * Compare performance between two dates (for regression detection).
 */
export async function compareDays(date1: string, date2: string) {
  const [summaries1, summaries2] = await Promise.all([
    prisma.performanceSummary.findMany({ where: { date: date1 } }),
    prisma.performanceSummary.findMany({ where: { date: date2 } }),
  ]);

  const map2 = new Map(
    summaries2.map((s) => [`${s.source}:${s.name}`, s])
  );

  return summaries1.map((s1) => {
    const key = `${s1.source}:${s1.name}`;
    const s2 = map2.get(key);
    return {
      source: s1.source,
      name: s1.name,
      date1: {
        avgMs: s1.avgMs,
        p95Ms: s1.p95Ms,
        maxMs: s1.maxMs,
        count: s1.count,
        errorCount: s1.errorCount,
      },
      date2: s2
        ? {
            avgMs: s2.avgMs,
            p95Ms: s2.p95Ms,
            maxMs: s2.maxMs,
            count: s2.count,
            errorCount: s2.errorCount,
          }
        : null,
      regression: s2
        ? {
            avgMsDelta: Math.round(s1.avgMs - s2.avgMs),
            p95MsDelta: Math.round(s1.p95Ms - s2.p95Ms),
            avgMsRatio: s2.avgMs > 0 ? +(s1.avgMs / s2.avgMs).toFixed(2) : null,
          }
        : null,
    };
  });
}

/**
 * Clean up old performance events (retention policy).
 * Default: keep 30 days of raw events, summaries indefinitely.
 */
export async function cleanupOldEvents(retentionDays = 30) {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const result = await prisma.performanceEvent.deleteMany({
    where: { timestamp: { lt: cutoff } },
  });
  return result.count;
}
