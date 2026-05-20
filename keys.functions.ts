import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { KEY_PREFIX, DEFAULT_TTL_HOURS } from "./keys.config";

// ---- Key generation ---------------------------------------------------------
// Format: SHADOW-XXXX-XXXX (change in src/lib/keys.config.ts)
function randSegment(len = 4) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let out = "";
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) out += alphabet[arr[i] % alphabet.length];
  return out;
}

export function generateKeyString() {
  return `${KEY_PREFIX}-${randSegment(4)}-${randSegment(4)}`;
}

// ---- Admin gate -------------------------------------------------------------
async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

// ---- PUBLIC: validate -------------------------------------------------------
// Used by Roblox executor + frontend. No auth required.
export const validateKey = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        key: z.string().min(4).max(64),
        hwid: z.string().max(128).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("keys")
      .select("*")
      .eq("key", data.key.toUpperCase())
      .maybeSingle();
    if (error) return { status: "INVALID" as const, message: error.message };
    if (!row) return { status: "INVALID" as const };
    if (row.blacklisted) return { status: "BLACKLISTED" as const };
    if (row.expires_at && new Date(row.expires_at) < new Date())
      return { status: "EXPIRED" as const };
    if (row.hwid && data.hwid && row.hwid !== data.hwid)
      return { status: "INVALID" as const, message: "HWID mismatch" };
    if (row.used && row.hwid && data.hwid && row.hwid === data.hwid) {
      // Same HWID re-checking — allowed
      return { status: "VALID" as const, type: row.type, expires_at: row.expires_at };
    }
    if (row.used) return { status: "USED" as const };
    return { status: "VALID" as const, type: row.type, expires_at: row.expires_at };
  });

// ---- PUBLIC: redeem ---------------------------------------------------------
// Marks key as used and binds HWID/IP.
export const redeemKey = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        key: z.string().min(4).max(64),
        hwid: z.string().min(1).max(128),
        ip: z.string().max(64).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const keyStr = data.key.toUpperCase();
    const { data: row } = await supabaseAdmin
      .from("keys")
      .select("*")
      .eq("key", keyStr)
      .maybeSingle();
    if (!row) return { status: "INVALID" as const };
    if (row.blacklisted) return { status: "BLACKLISTED" as const };
    if (row.expires_at && new Date(row.expires_at) < new Date())
      return { status: "EXPIRED" as const };
    if (row.used && row.hwid !== data.hwid) return { status: "USED" as const };

    const { error: upErr } = await supabaseAdmin
      .from("keys")
      .update({
        used: true,
        hwid: data.hwid,
        ip: data.ip ?? row.ip,
        redeemed_by: data.hwid,
      })
      .eq("id", row.id);
    if (upErr) return { status: "INVALID" as const, message: upErr.message };
    return { status: "VALID" as const, type: row.type, expires_at: row.expires_at };
  });

// ---- PUBLIC: generate a free key (rate-limited soft) ------------------------
export const generateFreeKey = createServerFn({ method: "POST" }).handler(async () => {
  const key = generateKeyString();
  const expires_at = new Date(
    Date.now() + DEFAULT_TTL_HOURS.free * 60 * 60 * 1000,
  ).toISOString();
  const { error } = await supabaseAdmin
    .from("keys")
    .insert({ key, type: "free", expires_at });
  if (error) throw new Error(error.message);
  return { key, expires_at };
});

// ---- ADMIN ------------------------------------------------------------------
export const adminGenerateKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        type: z.enum(["free", "premium", "admin"]).default("free"),
        ttlHours: z.number().int().positive().max(24 * 365 * 5).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const ttl = data.ttlHours ?? DEFAULT_TTL_HOURS[data.type];
    const key = generateKeyString();
    const expires_at = new Date(Date.now() + ttl * 60 * 60 * 1000).toISOString();
    const { data: row, error } = await supabaseAdmin
      .from("keys")
      .insert({ key, type: data.type, expires_at })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminListKeys = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({ search: z.string().max(64).optional() })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    let q = supabaseAdmin
      .from("keys")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.search) q = q.ilike("key", `%${data.search.toUpperCase()}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const [total, premium, used, blacklisted] = await Promise.all([
      supabaseAdmin.from("keys").select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("keys")
        .select("*", { count: "exact", head: true })
        .eq("type", "premium"),
      supabaseAdmin
        .from("keys")
        .select("*", { count: "exact", head: true })
        .eq("used", true),
      supabaseAdmin
        .from("keys")
        .select("*", { count: "exact", head: true })
        .eq("blacklisted", true),
    ]);
    return {
      total: total.count ?? 0,
      premium: premium.count ?? 0,
      used: used.count ?? 0,
      blacklisted: blacklisted.count ?? 0,
    };
  });

export const adminBlacklistKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), value: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("keys")
      .update({ blacklisted: data.value })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("keys").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const checkIsAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });
