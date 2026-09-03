export function allowedOrigins(value = process.env.ALLOWED_ORIGINS) {
  return new Set(
    (value ?? "http://localhost:5173")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean),
  );
}
export function isOriginAllowed(
  origin: string | undefined,
  allowed = allowedOrigins(),
) {
  return (
    !origin ||
    allowed.has(origin) ||
    (/^https:\/\/[^/]+\.app\.github\.dev$/.test(origin) &&
      process.env.NODE_ENV !== "production")
  );
}
