// ============================================================
// SHADOW PROTOCOL KEY SYSTEM — Configuration
// Creator: Black master
// ------------------------------------------------------------
// Change the system name here:
export const SYSTEM_NAME = "SHADOW PROTOCOL";
export const SYSTEM_TAGLINE = "KEY SYSTEM";
export const CREATOR = "Black master";

// Change the key prefix here (used in SHADOW-XXXX-XXXX):
export const KEY_PREFIX = "SHADOW";

// Change default expiration windows (in hours):
export const DEFAULT_TTL_HOURS = {
  free: 24,        // free keys valid for 24h
  premium: 24 * 30, // premium keys valid for 30 days
  admin: 24 * 365,  // admin keys valid for 1 year
};
// ============================================================
