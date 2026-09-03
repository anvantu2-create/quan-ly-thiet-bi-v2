import assert from "node:assert/strict";
import test from "node:test";
import { allowedOrigins, isOriginAllowed } from "./security.js";
test("CORS chỉ chấp nhận origin trong allowlist", () => {
  const allowed = allowedOrigins("https://app.example.com");
  assert.equal(isOriginAllowed("https://app.example.com", allowed), true);
  assert.equal(isOriginAllowed("https://evil.example", allowed), false);
  assert.equal(isOriginAllowed(undefined, allowed), true);
});
