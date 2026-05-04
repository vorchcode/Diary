import React, { useState } from "react";

export function LetItOut() {
  const [text, setText] = useState("");
  const [released, setReleased] = useState(false);

  const handleRelease = () => {
    if (!text.trim()) return;
    setReleased(true);
    setText("");
  };

  return (
    <div className="rounded-3xl border border-border bg-card/60 p-8">
      <h3 className="mb-2 text-2xl font-light">Let It Out</h3>
      <p className="mb-5 text-sm text-muted-foreground">Write what's heavy. Then release it.</p>

      {!released ? (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Whatever it is… let it pour out here."
            className="w-full resize-none rounded-2xl border border-border bg-background/60 p-4 outline-none"
          />
          <button
            onClick={handleRelease}
            className="mt-3 w-full rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
          >
            Release
          </button>
        </>
      ) : (
        <div className="py-10 text-center">
          <p className="font-display text-2xl italic text-foreground">It's okay to let it go, even just for a moment.</p>
          <button onClick={() => setReleased(false)} className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
            write again
          </button>
        </div>
      )}
    </div>
  );
}
