"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { streamChat, type ChatMessage } from "@/lib/api";

type UiMessage = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What are his strongest skills?",
  "Tell me about the AI Code Reviewer project",
  "Go to his skills section",
  "Show me his achievements",
];

/** Sections the AI can navigate to, mapped to DOM ids. */
const NAV_TARGETS = ["top", "skills", "projects", "achievements", "education", "experience", "contact"];

/** Hidden token the AI appends, e.g. [NAVIGATE:skills] — stripped before display. */
const NAV_TOKEN = /\[NAVIGATE:([a-z]+)\]/g;

function stripNav(text: string): string {
  return text.replace(NAV_TOKEN, "").replace(/\s+/g, " ").trim();
}

function navigateTo(section: string) {
  const el = document.getElementById(section);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  el.classList.remove("section-flash");
  void el.offsetWidth; // restart the CSS animation
  el.classList.add("section-flash");
}

/** Gemini-style four-point sparkle mark used as the AI's face. */
function GeminiSparkle({ className = "", gradient = false }: { className?: string; gradient?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="gemini-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="55%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path
        d="M12 1.5c.6 5.4 5.1 9.9 10.5 10.5c-5.4.6-9.9 5.1-10.5 10.5c-.6-5.4-5.1-9.9-10.5-10.5C6.9 11.4 11.4 6.9 12 1.5Z"
        fill={gradient ? "url(#gemini-grad)" : "currentColor"}
      />
    </svg>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm the AI assistant on Vivek's portfolio. Ask me anything about his skills, projects or experience — or just say \"go to his projects\" and I'll take you there.",
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
      ...messages.map((m) => ({ role: m.role, content: stripNav(m.content) })),
      { role: "user", content: question },
    ];

    setInput("");
    setBusy(true);
    setMessages((prev) => [...prev, { role: "user", content: question }, { role: "assistant", content: "" }]);

    let raw = "";
    try {
      await streamChat(history, (delta) => {
        raw += delta;
        const visible = stripNav(raw);
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          next[next.length - 1] = { ...last, content: visible || "…" };
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
      // The AI may have requested navigation — fly to that section.
      const match = raw.match(/\[NAVIGATE:([a-z]+)\]/);
      if (match && NAV_TARGETS.includes(match[1])) {
        navigateTo(match[1]);
      }
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
        <span className="relative flex h-7 w-7 items-center justify-center">
          {open ? "✕" : <GeminiSparkle className="h-7 w-7 text-white" />}
        </span>
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
              <GeminiSparkle gradient className="h-7 w-7 shrink-0" />
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
