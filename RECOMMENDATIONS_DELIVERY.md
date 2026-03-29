# Delivery Agent Recommendations

## Purpose

This file contains recommendations from the Delivery Agent for technical, performance, reliability, and code quality improvements in CapPlan. The Product Owner Agent reviews these recommendations and decides which ones to promote to the Product Backlog.

## Summary

Recommendations focus on database performance, API reliability, code maintainability, and build stability. All proposals respect the existing architecture and conventions defined in CLAUDE.md.

## Recommended Next Improvements

### DE-REC-001: Replace individual queries with batch operations in roster assignment API

- **Title:** Batch roster assignment writes
- **Problem:** The roster assignment endpoint creates entries in a loop with individual `prisma.create()` calls. For a full-year assignment this means up to 364 sequential database round-trips over the Neon serverless connection.
- **Proposed improvement:** Replace the loop with `prisma.createMany()` and wrap the operation in `prisma.$transaction()` for atomicity.
- **Expected product/technical value:** Reduces roster assignment time from seconds to milliseconds. Prevents partial writes on failure.
- **Priority:** P2 High
- **Effort:** Small (1 cycle)
- **Risk:** Low. `createMany` is a direct Prisma API. Transaction rollback handles failures cleanly.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** Roster assignment is a frequent planner action. The current latency is noticeable and the fix is straightforward.

### DE-REC-002: Add error response sanitization to API routes

- **Title:** Sanitize API error responses
- **Problem:** Some API routes return raw Prisma error messages to the frontend, which may expose internal schema details and are not user-friendly.
- **Proposed improvement:** Add a shared error handler in `api-route-utils.ts` that catches Prisma errors and returns sanitized Dutch-language error messages. Log the full error server-side.
- **Expected product/technical value:** Prevents information leakage. Gives users understandable error messages instead of technical stack traces.
- **Priority:** P3 Medium
- **Effort:** Medium (1-2 cycles)
- **Risk:** Low. Wrapping existing try/catch blocks. No behavior change for successful requests.
- **Dependencies:** None.
- **Suggested owner:** Delivery Agent
- **Why now:** This is a security hygiene item flagged in CLAUDE.md guidelines. Low risk, high defensive value.

## Risks / Watch-outs

- Any database migration must be tested locally before pushing. Neon applies migrations automatically on deploy.
- Changes to `api-route-utils.ts` affect all API routes. Test broadly after modifications.

## Items Intentionally Not Recommended

- **Migrate to a different ORM:** Prisma is well-integrated and the team is productive with it. Migration cost far outweighs any benefit.
- **Add pagination to all list endpoints:** Current data volumes do not justify the added complexity. Revisit when a specific endpoint shows performance issues.

## Recommendation Rules

- Recommendations are written by the Delivery Agent after reviewing the codebase and deployment behavior.
- Each recommendation must include all required fields.
- IDs are sequential (DE-REC-001, DE-REC-002, ...) and never reused.
- Approved recommendations are moved to `PRODUCT_BACKLOG.md` by the Product Owner Agent.
- Rejected recommendations are moved to `Items Intentionally Not Recommended` with a brief reason.
- This file is the only place the Delivery Agent writes recommendations. Do not scatter suggestions across other files.
