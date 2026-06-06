import { beforeEach } from "vitest";

// Set env vars before any test module is loaded
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key-placeholder";
process.env.ADMIN_PASSWORD = "test_admin_password_vitest_123";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";

beforeEach(() => {
  localStorage.clear();
});
