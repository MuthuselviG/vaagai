/**
 * Route smoke tests — every defined app route should return HTTP 200.
 *
 * These tests start a real Next.js dev server (see playwright.config.ts).
 * Run with: npm run test:e2e
 *
 * Requirements:
 *  - Supabase queries fail gracefully (empty data, no 500) when
 *    NEXT_PUBLIC_SUPABASE_URL points to a non-reachable host.
 *  - Server components with `data ?? []` fallback or try/catch always render.
 */

import { test, expect, APIRequestContext } from "@playwright/test";

// ── Helpers ──────────────────────────────────────────────────────────────────

async function expectStatus(
  request: APIRequestContext,
  path: string,
  expected: number | number[]
) {
  const res = await request.get(path, { failOnStatusCode: false });
  const allowed = Array.isArray(expected) ? expected : [expected];
  expect(
    allowed,
    `${path} → got ${res.status()}, expected one of ${allowed.join("|")}`
  ).toContain(res.status());
}

// ── Client-component pages (always 200 — initial HTML shell, data loads client-side) ──

test("/ — home", async ({ request }) => {
  await expectStatus(request, "/", 200);
});

test("/login — Google OAuth page", async ({ request }) => {
  await expectStatus(request, "/login", 200);
});

test("/subjects — subject selector", async ({ request }) => {
  await expectStatus(request, "/subjects", 200);
});

test("/mock — mock test listing", async ({ request }) => {
  await expectStatus(request, "/mock", 200);
});

test("/mock/[year] — mock test for a year", async ({ request }) => {
  await expectStatus(request, "/mock/2024", 200);
});

test("/mock/[year]/result — mock results page", async ({ request }) => {
  await expectStatus(request, "/mock/2024/result", 200);
});

test("/pyq/[group]/[year] — PYQ practice page", async ({ request }) => {
  await expectStatus(request, "/pyq/group4/2024", 200);
});

test("/practice/[subject]/[chapter] — practice page", async ({ request }) => {
  await expectStatus(request, "/practice/Polity/Constitution", 200);
});

test("/score — score dashboard", async ({ request }) => {
  await expectStatus(request, "/score", 200);
});

test("/creator — creator dashboard", async ({ request }) => {
  await expectStatus(request, "/creator", 200);
});

test("/current-affairs — daily CA page", async ({ request }) => {
  await expectStatus(request, "/current-affairs", 200);
});

test("/onboarding — onboarding page", async ({ request }) => {
  await expectStatus(request, "/onboarding", 200);
});

// ── Server-component pages (Supabase returns data ?? [] when unreachable) ─────

test("/experts — experts listing", async ({ request }) => {
  await expectStatus(request, "/experts", 200);
});

test("/experts/[slug] — creator profile (404 for unknown slug is OK)", async ({ request }) => {
  await expectStatus(request, "/experts/unknown-creator-slug", [200, 404]);
});

test("/experts/[slug]/[packId] — pack detail (404 for unknown is OK)", async ({ request }) => {
  await expectStatus(request, "/experts/unknown-creator/unknown-pack", [200, 404]);
});

test("/tnpsc-study-materials — study hub", async ({ request }) => {
  await expectStatus(request, "/tnpsc-study-materials", 200);
});

test("/tnpsc-study-materials/current-affairs — redirects to may-2026", async ({ request }) => {
  // This page calls redirect() → Next.js returns 308; following it lands at 200
  await expectStatus(request, "/tnpsc-study-materials/current-affairs", [200, 308]);
});

test("/tnpsc-study-materials/current-affairs/may-2026", async ({ request }) => {
  await expectStatus(request, "/tnpsc-study-materials/current-affairs/may-2026", 200);
});

test("/tnpsc-study-materials/current-affairs/may-2026/[unit] — valid unit", async ({ request }) => {
  await expectStatus(request, "/tnpsc-study-materials/current-affairs/may-2026/general-science", 200);
});

test("/tnpsc-study-materials/current-affairs/may-2026/[unit] — invalid unit returns 404", async ({ request }) => {
  await expectStatus(request, "/tnpsc-study-materials/current-affairs/may-2026/nonexistent-unit", 404);
});

test("/tnpsc-study-materials/current-affairs/may-2026-tamil", async ({ request }) => {
  await expectStatus(request, "/tnpsc-study-materials/current-affairs/may-2026-tamil", 200);
});

test("/tnpsc-study-materials/current-affairs/may-2026-tamil/[unit] — valid unit", async ({ request }) => {
  await expectStatus(request, "/tnpsc-study-materials/current-affairs/may-2026-tamil/geography", 200);
});

// ── Admin routes ───────────────────────────────────────────────────────────────

test("/admin-fun-panrom/login — admin login form", async ({ request }) => {
  await expectStatus(request, "/admin-fun-panrom/login", 200);
});

test("/admin-fun-panrom — redirects to login (no auth cookie)", async ({ request }) => {
  // Middleware sends 307, Playwright request follows → lands at login (200)
  await expectStatus(request, "/admin-fun-panrom", [200, 307]);
});

// ── Auth callback (no OAuth params — renders empty shell) ─────────────────────

test("/auth/callback — callback page", async ({ request }) => {
  await expectStatus(request, "/auth/callback", 200);
});

// ── API health checks ──────────────────────────────────────────────────────────

test("POST /api/admin/login — missing credentials returns 400", async ({ request }) => {
  const res = await request.post("/api/admin/login", {
    data: {},
    headers: { "Content-Type": "application/json" },
    failOnStatusCode: false,
  });
  expect(res.status()).toBe(400);
});

test("GET /api/mock/questions — missing year returns 400", async ({ request }) => {
  const res = await request.get("/api/mock/questions", { failOnStatusCode: false });
  expect(res.status()).toBe(400);
});
