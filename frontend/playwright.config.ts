import { defineConfig } from "@playwright/test";

/**
 * Route smoke tests — verifies every app route returns HTTP 200.
 *
 * The webServer starts Next.js with stub Supabase credentials so server
 * components render gracefully (empty data) even without a live DB.
 *
 * For CI: set real NEXT_PUBLIC_SUPABASE_URL / ANON_KEY env vars and
 * pass --workers=1 to avoid port conflicts.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 15000,
  projects: [{ name: "api", use: {} }],
  webServer: {
    command: [
      "NEXT_PUBLIC_SUPABASE_URL=https://placeholder-for-tests.supabase.co",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key-placeholder",
      "ADMIN_PASSWORD=test-admin-pw",
      "SUPABASE_SERVICE_ROLE_KEY=test-service-role-key",
      "npx next dev -p 3001",
    ].join(" "),
    url: "http://localhost:3001",
    reuseExistingServer: true,
    timeout: 60000,
  },
  use: {
    baseURL: "http://localhost:3001",
    extraHTTPHeaders: { Accept: "text/html,application/xhtml+xml" },
  },
});
