import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAllJournalEntries, deleteJournalEntry, JournalEntry } from "@/lib/db";
import { decrypt } from "@/lib/crypto";

export const Route = createFileRoute("/decrypt")({
  component: DecryptPage,
});

function DecryptPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, string | null>>({});

  useEffect(() => {
    let mounted = true;
    getAllJournalEntries()
      .then((e) => {
        if (!mounted) return;
        let all = e || [];
        // also include any legacy localStorage entries
        try {
          const stored = JSON.parse(localStorage.getItem("safespace_journal") || "[]");
          if (Array.isArray(stored) && stored.length) {
            const legacy = stored.map((s: any, idx: number) => ({ id: undefined, cipher: s.cipher, at: s.at || Date.now() - idx }));
            all = all.concat(legacy);
          }
        } catch {}
        setEntries(all.sort((a, b) => b.at - a.at));
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const tryDecrypt = (entryKey: string, cipher?: string) => {
    if (!cipher) return;
    const pass = passwords[entryKey] || "";
    const out = decrypt(cipher, pass);
    setResults((s) => ({ ...s, [entryKey]: out }));
  };

  const handleDelete = async (id?: number) => {
    if (id == null) return;
    await deleteJournalEntry(id);
    setEntries((es) => es.filter((e) => e.id !== id));
    setResults((s) => {
      const copy = { ...s };
      delete copy[String(id)];
      return copy;
    });
  };

  return (
    <main className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-light">Decrypt Saved Journal Entries</h2>
        <p className="mt-2 text-sm text-muted-foreground">Select an entry, enter its password, and decrypt.</p>

        {loading ? (
          <p className="mt-6">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="mt-6">No saved entries found.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {entries.map((e, idx) => {
              const key = e.id != null ? String(e.id) : `legacy-${idx}`;
              return (
                <li key={key} className="rounded-2xl border border-border bg-card/60 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">{new Date(e.at).toLocaleString()}</div>
                    <div className="mt-2 text-sm text-foreground/90">ID: {e.id}</div>
                    <div className="mt-3">
                      <input
                        type="password"
                        placeholder="Password"
                        value={passwords[key] ?? ""}
                        onChange={(ev) => setPasswords((s) => ({ ...s, [key]: ev.target.value }))}
                        className="w-full rounded-2xl border border-border bg-background/60 p-3 outline-none"
                      />
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => tryDecrypt(key, e.cipher)}
                          className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
                        >
                          Decrypt
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="rounded-full border border-border px-4 py-2 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {results[key] !== undefined && (
                  <div className="mt-4 rounded-lg bg-muted/60 p-3">
                    {results[key] === null ? (
                      <p className="italic text-muted-foreground">Incorrect password or corrupted entry.</p>
                    ) : (
                      <pre className="whitespace-pre-wrap text-sm">{results[key]}</pre>
                    )}
                  </div>
                )}
              </li>
            );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
