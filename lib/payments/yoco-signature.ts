import { createHmac, timingSafeEqual } from "node:crypto";

/** Standard Webhooks: sign the exact raw body, never a reserialized object. */
export function verifyYocoSignature(body: string, headers: Headers, secret: string, now = Date.now()) {
  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatures = headers.get("webhook-signature");
  if (!id || !timestamp || !signatures || !/^\d+$/.test(timestamp)) return false;
  if (Math.abs(Math.floor(now / 1000) - Number(timestamp)) > 180) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  if (!key.length) return false;
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest();
  return signatures.split(/\s+/).some(signature => {
    const [version, value] = signature.split(",");
    if (version !== "v1" || !value) return false;
    const candidate = Buffer.from(value, "base64");
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  });
}
