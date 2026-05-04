import { useState, useEffect } from "react";
import { Reveal } from "./Reveal";
import { ensureAnonymousAuth } from "@/lib/firebase";
import { saveDiaryEntry, getDiaryEntries, deleteDiaryEntry } from "@/lib/firebaseDb";
import { encryptWithPassword, decryptWithPassword } from "@/lib/crypto";

type DiaryEntry = { id?: string; date: string; mood: string; text: string };

export function Journal() {
  const [message, setMessage] = useState("");
  const [mood, setMood] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pastEntries, setPastEntries] = useState<DiaryEntry[]>([]);
  const [showPast, setShowPast] = useState(false);
  const [useFirebase, setUseFirebase] = useState(true);
  const [encryptOnSave, setEncryptOnSave] = useState(false);
  const [savePassword, setSavePassword] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [decryptPassword, setDecryptPassword] = useState("");
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const quotes = [
    "You don't have to be strong all the time.",
    "It's okay to feel everything.",
    "Grief comes in waves, and that's okay.",
    "Healing isn't linear — and you're allowed to rest.",
    "Their love stays with you, always.",
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setQuoteIndex((i) => (i + 1) % quotes.length), 8000);
    return () => clearInterval(t);
  }, []);

  // Initialize Firebase and load entries (fallback to localStorage)
  useEffect(() => {
    const initFirebase = async () => {
      try {
        await ensureAnonymousAuth();
        const entries = await getDiaryEntries();
        setPastEntries(entries);
        setUseFirebase(true);
      } catch (error) {
        console.warn("Firebase unavailable, using localStorage:", error);
        const stored = JSON.parse(localStorage.getItem("diary_entries") || "[]");
        setPastEntries(stored);
        setUseFirebase(false);
      } finally {
        setLoading(false);
      }
    };
    initFirebase();
  }, []);

  const handleSave = async () => {
    if (!message.trim()) return;
    try {
      let content = message.trim();
      if (encryptOnSave) {
        if (!savePassword) throw new Error("Provide a password to encrypt the entry");
        content = await encryptWithPassword(savePassword, content);
      }
      if (useFirebase) {
        await saveDiaryEntry(today, mood, content);
        const entries = await getDiaryEntries();
        setPastEntries(entries);
      } else {
        const entry: DiaryEntry = { date: today, mood, text: content };
        const stored: DiaryEntry[] = JSON.parse(localStorage.getItem("diary_entries") || "[]");
        const updated = [entry, ...stored];
        localStorage.setItem("diary_entries", JSON.stringify(updated));
        setPastEntries(updated);
      }
      setSaved(true);
      setMessage("");
      setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      console.error(err);
      alert("Failed to save entry.");
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      if (useFirebase) {
        await deleteDiaryEntry(id);
        const entries = await getDiaryEntries();
        setPastEntries(entries);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete entry.");
    }
  };

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Daily Diary</p>
            <h2 className="mt-3 text-3xl font-light sm:text-4xl">Write how you're feeling today</h2>
            <p className="mt-3 text-muted-foreground">A safe space for your feelings. Saved on your device, just for you.</p>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="relative rounded-3xl border border-border bg-card/60 p-6 shadow-sm backdrop-blur sm:p-10">
            <div className="notebook-decor">🌸</div>
            <div className="notebook-card">
              <div className="notebook-title">
                <h1>A Little Letter</h1>
                <p>because some things need to be said</p>
              </div>

              <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center -z-10 select-none" style={{ opacity: 0.06, transform: "translateY(-6px)" }}>
                <div className="max-w-2xl px-6 text-center text-3xl font-serif italic sm:text-5xl md:text-6xl text-muted-foreground">{quotes[quoteIndex]}</div>
              </div>

              <div className="notebook-sheet mt-6">
                <div className="torn-top" />

                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading your diary...</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <label className="mb-2 block text-sm font-medium text-foreground">How are you feeling? (write your emotion)</label>
                      <input
                        value={mood}
                        onChange={(e) => setMood(e.target.value)}
                        placeholder="Write your feeling… e.g. confused, relieved, lovelyy 🤍"
                        className="w-full rounded-md border-0 bg-transparent p-0 text-base leading-relaxed outline-none handwriting placeholder:italic placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="mb-3 text-sm text-muted-foreground">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>

                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={8} placeholder="Write your story… what happened today? What are you feeling? 🤍" className="w-full resize-none rounded-md border-0 bg-transparent p-0 text-base leading-relaxed outline-none handwriting" />

                    <div className="mt-3 flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={encryptOnSave} onChange={(e) => setEncryptOnSave(e.target.checked)} />
                        Encrypt on save
                      </label>
                      {encryptOnSave && (
                        <input type="password" value={savePassword} onChange={(e) => setSavePassword(e.target.value)} placeholder="encryption password" className="ml-auto rounded-md border border-border px-3 py-2 text-sm" />
                      )}
                    </div>

                    <button onClick={handleSave} disabled={!message.trim()} className="mt-4 w-full rounded-full bg-primary px-6 py-3 text-sm tracking-wide text-primary-foreground transition hover:opacity-90 disabled:opacity-50">Save Entry</button>

                    {saved && <p className="mt-6 animate-fade-up text-center italic text-muted-foreground">✓ Entry saved. Thank you for sharing. 🤍</p>}

                    <p className="mt-4 text-center text-xs text-muted-foreground">{useFirebase ? "☁️ Syncing to cloud" : "💾 Saving locally"}</p>

                    <div className="mt-6 border-t border-border pt-6">
                      <h3 className="text-sm font-medium">Decrypt previous entries</h3>
                      <div className="mt-2 flex flex-col md:flex-row gap-2 items-stretch">
                        <select value={selectedIndex ?? ""} onChange={(e) => setSelectedIndex(e.target.value === "" ? null : Number(e.target.value))} className="rounded-md border border-border px-3 py-2 text-sm w-full md:w-1/2">
                          <option value="">Select entry</option>
                          {pastEntries.map((entry, i) => (
                            <option key={(entry as any).id || entry.date} value={i}>{entry.date} • {entry.mood || "(no label)"}</option>
                          ))}
                        </select>
                        <input type="password" value={decryptPassword} onChange={(e) => setDecryptPassword(e.target.value)} placeholder="password" className="rounded-md border border-border px-3 py-2 text-sm w-full md:w-1/3" />
                        <button onClick={async () => {
                          setDecryptedText(null);
                          setDecryptError(null);
                          if (selectedIndex === null) return setDecryptError("Select an entry first");
                          const entry = pastEntries[selectedIndex];
                          if (!entry) return setDecryptError("Invalid entry selected");
                          try {
                            const plain = await decryptWithPassword(decryptPassword, entry.text);
                            setDecryptedText(plain);
                          } catch (err: any) {
                            setDecryptError(err?.message || "Decryption failed");
                          }
                        }} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground w-full md:w-auto">Decrypt</button>
                      </div>
                      {decryptedText && <div className="mt-3 rounded-md bg-muted/40 p-3 text-sm handwriting whitespace-pre-wrap">{decryptedText}</div>}
                      {decryptError && <div className="mt-3 text-sm text-destructive">{decryptError}</div>}
                    </div>

                    {pastEntries.length > 0 && (
                      <div className="mt-8 border-t border-border pt-6">
                        <button onClick={() => setShowPast(!showPast)} className="text-sm underline text-accent">{showPast ? "Hide" : "Show"} past entries ({pastEntries.length})</button>
                        {showPast && (
                          <div className="mt-4 space-y-3">
                            {pastEntries.map((entry) => (
                              <div key={entry.id || entry.date} className="group rounded-lg bg-muted/60 p-3">
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-muted-foreground">{entry.date} • {entry.mood}</div>
                                  {useFirebase && entry.id && <button onClick={() => handleDelete(entry.id)} className="text-xs text-muted-foreground/60 opacity-0 transition hover:text-destructive group-hover:opacity-100">✕</button>}
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-foreground line-clamp-3 handwriting">{entry.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default Journal;
