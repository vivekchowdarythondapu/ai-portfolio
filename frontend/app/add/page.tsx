"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  addAchievement,
  addProject,
  addSkill,
  checkDashboardKey,
  deleteItem,
  fetchProfile,
  mediaUrl,
  setDashboardKey,
  type Profile,
} from "@/lib/api";

type Tab = "skills" | "projects" | "achievements";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "skills", label: "Skill", icon: "🛠️" },
  { id: "projects", label: "Project", icon: "🚀" },
  { id: "achievements", label: "Achievement", icon: "🏆" },
];

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-indigo-400/60";
const labelCls = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400";

export default function AddPage() {
  const [tab, setTab] = useState<Tab>("skills");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // dashboard lock
  const [unlocked, setUnlocked] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [keyBusy, setKeyBusy] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);

  // skill form
  const [skillName, setSkillName] = useState("");
  const [skillCategory, setSkillCategory] = useState("added");
  const [skillLevel, setSkillLevel] = useState(80);

  // project form
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projTech, setProjTech] = useState("");
  const [projLink, setProjLink] = useState("");
  const [projDetails, setProjDetails] = useState("");

  // achievement form
  const [achTitle, setAchTitle] = useState("");
  const [achDesc, setAchDesc] = useState("");
  const [achDate, setAchDate] = useState("");
  const [achDetails, setAchDetails] = useState("");
  const [achFiles, setAchFiles] = useState<File[]>([]);
  const [achPreviews, setAchPreviews] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    try {
      setProfile(await fetchProfile());
    } catch {
      /* backend not up; the error shows on submit */
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // returning to the dashboard with a saved access code → verify silently
  useEffect(() => {
    const stored = localStorage.getItem("dashboard_key");
    if (!stored) return;
    setDashboardKey(stored);
    checkDashboardKey()
      .then((ok) => {
        if (ok) setUnlocked(true);
        else localStorage.removeItem("dashboard_key");
      })
      .catch(() => /* backend down; gate stays up */ {});
  }, []);

  async function tryUnlock() {
    if (!keyInput.trim()) return;
    setKeyBusy(true);
    setKeyError(null);
    setDashboardKey(keyInput.trim());
    try {
      if (await checkDashboardKey()) {
        localStorage.setItem("dashboard_key", keyInput.trim());
        setKeyInput("");
        setUnlocked(true);
      } else {
        setKeyError("Wrong access code — try again.");
        setDashboardKey("");
      }
    } catch {
      setKeyError("Could not reach the backend — is it running on port 8000?");
      setDashboardKey("");
    } finally {
      setKeyBusy(false);
    }
  }

  function notify(ok: boolean, text: string) {
    setMessage({ ok, text });
    setTimeout(() => setMessage(null), 4000);
  }

  async function withBusy(fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      notify(false, err instanceof Error ? err.message : "Request failed — is the backend running?");
    } finally {
      setBusy(false);
    }
  }

  async function submitSkill() {
    if (!skillName.trim()) return;
    await withBusy(async () => {
      await addSkill({ name: skillName.trim(), category: skillCategory, level: skillLevel });
      setSkillName("");
      notify(true, "Skill added ✅");
      await refresh();
    });
  }

  async function submitProject() {
    if (!projName.trim() || !projDesc.trim()) return;
    await withBusy(async () => {
      await addProject({
        name: projName.trim(),
        description: projDesc.trim(),
        tech: projTech,
        link: projLink,
        details: projDetails.trim(),
      });
      setProjName("");
      setProjDesc("");
      setProjTech("");
      setProjLink("");
      setProjDetails("");
      notify(true, "Project added 🚀");
      await refresh();
    });
  }

  function pickFiles(list: FileList | null) {
    const files = Array.from(list ?? []).filter((f) => f.type.startsWith("image/")).slice(0, 6);
    achPreviews.forEach((url) => URL.revokeObjectURL(url));
    setAchFiles(files);
    setAchPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  async function submitAchievement() {
    if (!achTitle.trim()) return;
    await withBusy(async () => {
      const form = new FormData();
      form.append("title", achTitle.trim());
      form.append("description", achDesc.trim());
      form.append("date", achDate.trim());
      form.append("details", achDetails.trim());
      for (const f of achFiles) form.append("images", f);
      await addAchievement(form);
      setAchTitle("");
      setAchDesc("");
      setAchDate("");
      setAchDetails("");
      setAchFiles([]);
      achPreviews.forEach((url) => URL.revokeObjectURL(url));
      setAchPreviews([]);
      notify(true, "Achievement added 🏆");
      await refresh();
    });
  }

  async function handleDelete(kind: Tab, id: number) {
    await withBusy(async () => {
      await deleteItem(kind, id);
      notify(true, "Deleted");
      await refresh();
    });
  }

  const addedSkills = Array.isArray(profile?.skills.added) ? profile!.skills.added : [];

  if (!unlocked) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="text-4xl">🔒</p>
          <h1 className="mt-4 text-xl font-bold">Private dashboard</h1>
          <p className="mt-2 text-sm text-gray-400">
            This is the portfolio&apos;s content dashboard. Enter the access code to continue —
            visitors can browse the portfolio and chat with the AI without it.
          </p>
          <input
            type="password"
            className={`${inputCls} mt-5 text-center`}
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void tryUnlock();
            }}
            placeholder="Access code"
            autoFocus
          />
          {keyError && <p className="mt-3 text-sm text-red-300">{keyError}</p>}
          <button
            onClick={() => void tryUnlock()}
            disabled={keyBusy || !keyInput.trim()}
            className="mt-4 w-full rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-40"
          >
            {keyBusy ? "Checking…" : "Unlock"}
          </button>
          <Link href="/" className="mt-5 inline-block text-sm text-indigo-400 hover:text-indigo-300">
            ← Back to portfolio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300">
        ← Back to portfolio
      </Link>

      <h1 className="mt-4 text-3xl font-bold">
        Content dashboard<span className="text-gradient">.</span>
      </h1>
      <p className="mt-2 text-gray-400">
        Add skills, projects and achievements (with photos) — they appear on the portfolio and are
        fed to the AI assistant instantly.
      </p>

      {message && (
        <div
          className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
            message.ok
              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
              : "border-red-400/30 bg-red-500/10 text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* tabs */}
      <div className="mt-8 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${
              tab === t.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        {tab === "skills" && (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Skill name</label>
              <input className={inputCls} value={skillName} onChange={(e) => setSkillName(e.target.value)} placeholder="e.g. Kubernetes" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Category</label>
                <select className={inputCls} value={skillCategory} onChange={(e) => setSkillCategory(e.target.value)}>
                  <option value="added">General</option>
                  <option value="languages">Languages</option>
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="ai">AI</option>
                  <option value="tools">Tools</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Level: {skillLevel}%</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(Number(e.target.value))}
                  className="mt-3 w-full accent-indigo-500"
                />
              </div>
            </div>
            <button
              onClick={submitSkill}
              disabled={busy || !skillName.trim()}
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-40"
            >
              {busy ? "Adding…" : "Add skill"}
            </button>

            {addedSkills.length > 0 && (
              <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                {addedSkills.map((s) => (
                  <li key={s.id} className="flex items-center justify-between rounded-lg bg-black/30 px-4 py-2 text-sm">
                    <span>{s.name} <span className="text-gray-500">· {s.category} · {s.level}%</span></span>
                    <button onClick={() => void handleDelete("skills", s.id!)} className="text-red-400 hover:text-red-300">delete</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "projects" && (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Project name</label>
              <input className={inputCls} value={projName} onChange={(e) => setProjName(e.target.value)} placeholder="e.g. Expense Tracker" />
            </div>
            <div>
              <label className={labelCls}>Description (short — shown on the card)</label>
              <textarea className={inputCls} rows={3} value={projDesc} onChange={(e) => setProjDesc(e.target.value)} placeholder="One-paragraph summary of what it does…" />
            </div>
            <div>
              <label className={labelCls}>Full story (optional — shown on the detail page, blank lines separate paragraphs)</label>
              <textarea className={inputCls} rows={4} value={projDetails} onChange={(e) => setProjDetails(e.target.value)} placeholder="The problem it solves, how you built it, what you learned…" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Tech (comma-separated)</label>
                <input className={inputCls} value={projTech} onChange={(e) => setProjTech(e.target.value)} placeholder="React, FastAPI, Postgres" />
              </div>
              <div>
                <label className={labelCls}>Link (optional)</label>
                <input className={inputCls} value={projLink} onChange={(e) => setProjLink(e.target.value)} placeholder="https://github.com/…" />
              </div>
            </div>
            <button
              onClick={submitProject}
              disabled={busy || !projName.trim() || !projDesc.trim()}
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-40"
            >
              {busy ? "Adding…" : "Add project"}
            </button>

            {profile && profile.projects.filter((p) => p.id !== undefined).length > 0 && (
              <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                {profile.projects.filter((p) => p.id !== undefined).map((p) => (
                  <li key={p.id} className="flex items-center justify-between rounded-lg bg-black/30 px-4 py-2 text-sm">
                    <span>{p.name}</span>
                    <button onClick={() => void handleDelete("projects", p.id!)} className="text-red-400 hover:text-red-300">delete</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "achievements" && (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Title</label>
              <input className={inputCls} value={achTitle} onChange={(e) => setAchTitle(e.target.value)} placeholder="e.g. AWS Certified" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Date (optional)</label>
                <input className={inputCls} value={achDate} onChange={(e) => setAchDate(e.target.value)} placeholder="Mar 2025" />
              </div>
              <div>
                <label className={labelCls}>Photos (png/jpg/webp, up to 6, max 5 MB each)</label>
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(e) => pickFiles(e.target.files)}
                  className="w-full text-sm text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Description (optional — shown on the card)</label>
              <textarea className={inputCls} rows={2} value={achDesc} onChange={(e) => setAchDesc(e.target.value)} placeholder="One-line summary of the achievement…" />
            </div>
            <div>
              <label className={labelCls}>Full story (optional — shown on the detail page, blank lines separate paragraphs)</label>
              <textarea className={inputCls} rows={4} value={achDetails} onChange={(e) => setAchDetails(e.target.value)} placeholder="Where it happened, when, what was involved, why it matters…" />
            </div>

            {achPreviews.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {achPreviews.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={url} src={url} alt="preview" className="h-28 w-28 rounded-xl object-cover ring-1 ring-white/10" />
                ))}
              </div>
            )}

            <button
              onClick={submitAchievement}
              disabled={busy || !achTitle.trim()}
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-40"
            >
              {busy ? "Uploading…" : "Add achievement"}
            </button>

            {(profile?.achievements.length ?? 0) > 0 && (
              <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                {profile!.achievements.filter((a) => a.id !== undefined).map((a) => (
                  <li key={a.id} className="flex items-center justify-between rounded-lg bg-black/30 px-4 py-2 text-sm">
                    <span className="flex items-center gap-2">
                      {a.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mediaUrl(a.image)} alt="" className="h-8 w-8 rounded object-cover" />
                      )}
                      {a.title}
                    </span>
                    <button onClick={() => void handleDelete("achievements", a.id!)} className="text-red-400 hover:text-red-300">delete</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
