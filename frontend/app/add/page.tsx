"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  addAchievement,
  addProject,
  addSkill,
  deleteItem,
  fetchProfile,
  mediaUrl,
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

  // skill form
  const [skillName, setSkillName] = useState("");
  const [skillCategory, setSkillCategory] = useState("added");
  const [skillLevel, setSkillLevel] = useState(80);

  // project form
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projTech, setProjTech] = useState("");
  const [projLink, setProjLink] = useState("");

  // achievement form
  const [achTitle, setAchTitle] = useState("");
  const [achDesc, setAchDesc] = useState("");
  const [achDate, setAchDate] = useState("");
  const [achFile, setAchFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

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
      });
      setProjName("");
      setProjDesc("");
      setProjTech("");
      setProjLink("");
      notify(true, "Project added 🚀");
      await refresh();
    });
  }

  async function submitAchievement() {
    if (!achTitle.trim()) return;
    await withBusy(async () => {
      const form = new FormData();
      form.append("title", achTitle.trim());
      form.append("description", achDesc.trim());
      form.append("date", achDate.trim());
      if (achFile) form.append("image", achFile);
      await addAchievement(form);
      setAchTitle("");
      setAchDesc("");
      setAchDate("");
      setAchFile(null);
      setPreview(null);
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
              <label className={labelCls}>Description</label>
              <textarea className={inputCls} rows={3} value={projDesc} onChange={(e) => setProjDesc(e.target.value)} placeholder="What it does and what you used…" />
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
                <label className={labelCls}>Photo (png/jpg/webp, max 5 MB)</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setAchFile(file);
                    setPreview(file ? URL.createObjectURL(file) : null);
                  }}
                  className="w-full text-sm text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Description (optional)</label>
              <textarea className={inputCls} rows={2} value={achDesc} onChange={(e) => setAchDesc(e.target.value)} placeholder="Details about the achievement…" />
            </div>

            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="preview" className="h-40 rounded-xl object-cover ring-1 ring-white/10" />
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
