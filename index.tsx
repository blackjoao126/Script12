import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateFreeKey, validateKey } from "@/lib/keys.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, Key, ShieldCheck, Sparkles, Terminal, Clock } from "lucide-react";
import { SYSTEM_NAME, SYSTEM_TAGLINE, CREATOR } from "@/lib/keys.config";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const generate = useServerFn(generateFreeKey);
  const validate = useServerFn(validateKey);

  const [key, setKey] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState("");

  const [checkKey, setCheckKey] = useState("");
  const [checkResult, setCheckResult] = useState<string | null>(null);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) return setRemaining("EXPIRED");
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setRemaining(`${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const onGenerate = async () => {
    setLoading(true);
    try {
      const res = await generate();
      setKey(res.key);
      setExpiresAt(res.expires_at);
      await navigator.clipboard.writeText(res.key).catch(() => {});
      toast.success("Key generated and copied to clipboard");
    } catch (e) {
      toast.error("Failed to generate key");
    } finally {
      setLoading(false);
    }
  };

  const onCopy = () => {
    if (!key) return;
    navigator.clipboard.writeText(key);
    toast.success("Copied!");
  };

  const onValidate = async () => {
    if (!checkKey) return;
    const res = await validate({ data: { key: checkKey.trim() } });
    setCheckResult(res.status);
  };

  return (
    <div className="min-h-screen grid-bg">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-md panel-glow">
            <Terminal className="h-5 w-5 text-neon" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {SYSTEM_TAGLINE}
            </p>
            <h1 className="font-mono text-sm font-semibold text-neon">{SYSTEM_NAME}</h1>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-muted-foreground sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Online
          </span>
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="text-neon hover:bg-accent/40">
              Admin
            </Button>
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col items-center px-6 py-10 md:py-16">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card/40 px-3 py-1 text-xs text-neon">
          <Sparkles className="h-3.5 w-3.5" />
          Secure key issuance · Roblox ready
        </div>

        <h2 className="text-center font-mono text-3xl font-bold leading-tight md:text-5xl">
          <span className="text-neon">SHADOW</span>{" "}
          <span className="text-foreground">PROTOCOL</span>
        </h2>
        <p className="mt-3 max-w-xl text-center text-sm text-muted-foreground md:text-base">
          Generate, validate, and control script-execution keys. Built for executors,
          loaders, and premium loaders.
        </p>

        {/* Generator */}
        <section className="panel-glow mt-10 w-full p-6 md:p-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Key className="h-4 w-4 text-neon" /> Your key
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-4 py-4">
            <code className="flex-1 truncate font-mono text-lg text-neon md:text-2xl">
              {key ?? "SHADOW-XXXX-XXXX"}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={onCopy}
              disabled={!key}
              className="border-primary/40 hover:bg-accent/40"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {key && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Expires in{" "}
              <span className="text-neon">{remaining}</span>
            </div>
          )}

          <Button
            onClick={onGenerate}
            disabled={loading}
            className="mt-6 w-full bg-primary text-primary-foreground glow-neon hover:bg-primary/90"
            size="lg"
          >
            {loading ? "Generating…" : "Generate Key"}
          </Button>
        </section>

        {/* Validator */}
        <section className="panel mt-6 w-full p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-neon" /> Validate a key
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="SHADOW-XXXX-XXXX"
              value={checkKey}
              onChange={(e) => setCheckKey(e.target.value)}
              className="font-mono uppercase"
            />
            <Button onClick={onValidate} variant="secondary">
              Check
            </Button>
          </div>
          {checkResult && (
            <div className="mt-4 font-mono text-sm">
              Status:{" "}
              <span
                className={
                  checkResult === "VALID"
                    ? "text-emerald-400"
                    : "text-red-400"
                }
              >
                {checkResult}
              </span>
            </div>
          )}
        </section>

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          <p>
            API endpoint:{" "}
            <code className="text-neon">/api/public/validate?key=...&hwid=...</code>
          </p>
          <p className="mt-2">
            {SYSTEM_NAME} {SYSTEM_TAGLINE} · Created by{" "}
            <span className="text-neon">{CREATOR}</span>
          </p>
        </footer>
      </main>
    </div>
  );
}
