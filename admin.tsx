import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  adminGenerateKey,
  adminListKeys,
  adminStats,
  adminBlacklistKey,
  adminDeleteKey,
  checkIsAdmin,
} from "@/lib/keys.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Ban, RefreshCw, Plus, LogOut, Terminal, Search } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type KeyRow = {
  id: string;
  key: string;
  type: "free" | "premium" | "admin";
  used: boolean;
  blacklisted: boolean;
  expires_at: string | null;
  created_at: string;
  hwid: string | null;
};

function AdminPage() {
  const navigate = useNavigate();
  const isAdminFn = useServerFn(checkIsAdmin);
  const listFn = useServerFn(adminListKeys);
  const statsFn = useServerFn(adminStats);
  const genFn = useServerFn(adminGenerateKey);
  const blFn = useServerFn(adminBlacklistKey);
  const delFn = useServerFn(adminDeleteKey);

  const [ready, setReady] = useState(false);
  const [rows, setRows] = useState<KeyRow[]>([]);
  const [stats, setStats] = useState({ total: 0, premium: 0, used: 0, blacklisted: 0 });
  const [search, setSearch] = useState("");
  const [keyType, setKeyType] = useState<"free" | "premium" | "admin">("free");

  const refresh = useCallback(async () => {
    try {
      const [r, s] = await Promise.all([listFn({ data: { search } }), statsFn()]);
      setRows(r as KeyRow[]);
      setStats(s);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    }
  }, [listFn, statsFn, search]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate({ to: "/login" });
        return;
      }
      try {
        const { isAdmin } = await isAdminFn();
        if (!isAdmin) {
          toast.error("You are not an admin. Grant the admin role in the database.");
          navigate({ to: "/" });
          return;
        }
        setReady(true);
        await refresh();
      } catch {
        navigate({ to: "/login" });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onGenerate = async () => {
    try {
      await genFn({ data: { type: keyType } });
      toast.success(`${keyType} key generated`);
      await refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const onBlacklist = async (id: string, value: boolean) => {
    await blFn({ data: { id, value } });
    toast.success(value ? "Blacklisted" : "Unblacklisted");
    await refresh();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this key?")) return;
    await delFn({ data: { id } });
    toast.success("Deleted");
    await refresh();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center text-neon font-mono">
        Authenticating…
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-bg">
      <header className="flex items-center justify-between border-b border-border/40 px-6 py-4 md:px-10">
        <Link to="/" className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-neon" />
          <span className="font-mono text-sm text-neon">SHADOW · ADMIN</span>
        </Link>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 md:px-10">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Total Keys" value={stats.total} />
          <StatCard label="Premium" value={stats.premium} />
          <StatCard label="Used" value={stats.used} />
          <StatCard label="Blacklisted" value={stats.blacklisted} />
        </div>

        {/* Controls */}
        <div className="panel-glow mt-6 flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search key…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && refresh()}
              className="font-mono"
            />
            <Button variant="outline" size="icon" onClick={refresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Select value={keyType} onValueChange={(v) => setKeyType(v as typeof keyType)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">free</SelectItem>
                <SelectItem value="premium">premium</SelectItem>
                <SelectItem value="admin">admin</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={onGenerate} className="bg-primary glow-neon">
              <Plus className="mr-1 h-4 w-4" /> Generate
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="panel mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/40 bg-background/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Key</th>
                  <th className="px-3 py-3 text-left">Type</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Expires</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const expired = r.expires_at && new Date(r.expires_at) < new Date();
                  return (
                    <tr key={r.id} className="border-b border-border/20 hover:bg-accent/20">
                      <td className="px-4 py-3 font-mono text-neon">{r.key}</td>
                      <td className="px-3 py-3 font-mono uppercase text-xs">{r.type}</td>
                      <td className="px-3 py-3 text-xs">
                        {r.blacklisted ? (
                          <span className="text-red-400">BLACKLISTED</span>
                        ) : expired ? (
                          <span className="text-yellow-400">EXPIRED</span>
                        ) : r.used ? (
                          <span className="text-amber-300">USED</span>
                        ) : (
                          <span className="text-emerald-400">ACTIVE</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        {r.expires_at
                          ? new Date(r.expires_at).toLocaleString()
                          : "never"}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onBlacklist(r.id, !r.blacklisted)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(r.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-sm text-muted-foreground"
                    >
                      No keys yet. Generate one above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel-glow p-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-2xl text-neon">{value}</p>
    </div>
  );
}
