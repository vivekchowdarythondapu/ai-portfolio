"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { streamChat, type ChatMessage } from "@/lib/api";

type UiMessage = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What are his strongest skills?",
  "Tell me about the AI Portfolio project",
  "Does he have experience with Docker?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm the AI assistant on this portfolio. Ask me anything about this developer's skills, projects or experience.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;

    const history: ChatMessage[] = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: question },
    ];

    setInput("");
    setBusy(true);
    setMessages((prev) => [...prev, { role: "user", content: question }, { role: "assistant", content: "" }]);

    try {
      await streamChat(history, (delta) => {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          next[next.length - 1] = { ...last, content: last.content + delta };
          return next;
        });
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: `⚠️ ${detail}. Is the backend running on port 8000?`,
        };
        return next;
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* floating toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-2xl text-white shadow-xl shadow-indigo-600/40 transition hover:scale-105"
        aria-label="Open AI chat"
      >
        <span className="pulse-ring absolute inset-0 rounded-full" />
        <span className="relative">{open ? "✕" : "🤖"}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-4 z-50 flex h-[32rem] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d16] shadow-2xl shadow-black/60"
          >
            <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-indigo-600/20 to-cyan-500/10 px-4 py-3">
              <span className="text-xl">🤖</span>
              <div>
                <p className="text-sm font-semibold">Portfolio AI</p>
                <p className="text-xs text-gray-400">Ask about my experience</p>
              </div>
            </div>

            <div ref={scrollRef} className="thin-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "ml-auto rounded-br-md bg-indigo-600 text-white"
                      : "rounded-bl-md bg-white/10 text-gray-200"
                  }`}
                >
                  {m.content || (busy && i === messages.length - 1 ? "…" : "")}
                </div>
              ))}

              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-gray-300 transition hover:border-indigo-400/50 hover:text-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="flex gap-2 border-t border-white/10 p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question…"
                className="flex-1 rounded-full bg-white/5 px-4 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-gray-500 focus:ring-indigo-400/60"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-40"
              >
                {busy ? "…" : "Send"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
