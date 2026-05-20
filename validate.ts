// Public API for Roblox executor — returns plain text: VALID / INVALID / EXPIRED / BLACKLISTED / USED
// Usage: game:HttpGet("https://yourdomain/api/public/validate?key=SHADOW-XXXX-XXXX&hwid=...")
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function check(key: string, hwid: string | null) {
  if (!key) return "INVALID";
  const { data: row } = await supabaseAdmin
    .from("keys")
    .select("*")
    .eq("key", key.toUpperCase())
    .maybeSingle();
  if (!row) return "INVALID";
  if (row.blacklisted) return "BLACKLISTED";
  if (row.expires_at && new Date(row.expires_at) < new Date()) return "EXPIRED";
  if (row.hwid && hwid && row.hwid !== hwid) return "INVALID";
  if (row.used && row.hwid && hwid && row.hwid === row.hwid) return "VALID";
  if (row.used && !hwid) return "USED";
  // Bind hwid on first use
  if (!row.used && hwid) {
    await supabaseAdmin
      .from("keys")
      .update({ used: true, hwid, redeemed_by: hwid })
      .eq("id", row.id);
  }
  return "VALID";
}

export const Route = createFileRoute("/api/public/validate")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const key = url.searchParams.get("key") ?? "";
        const hwid = url.searchParams.get("hwid");
        const result = await check(key, hwid);
        return new Response(result, {
          status: 200,
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "no-store",
            "access-control-allow-origin": "*",
          },
        });
      },
      POST: async ({ request }) => {
        let body: { key?: string; hwid?: string } = {};
        try {
          body = await request.json();
        } catch {}
        const result = await check(body.key ?? "", body.hwid ?? null);
        return new Response(result, {
          status: 200,
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "no-store",
            "access-control-allow-origin": "*",
          },
        });
      },
    },
  },
});
