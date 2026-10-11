// Central API client for the FastAPI backend.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Access code for the private content dashboard. Sent as a header with
// every add/delete request; visitors without it can still read everything.
let dashboardKey = "";

export function setDashboardKey(key: string) {
  dashboardKey = key;
}

function authHeaders(): Record<string, string> {
  return dashboardKey ? { "X-Dashboard-Key": dashboardKey } : {};
}

/** Verify the current dashboard key against the backend. */
export async function checkDashboardKey(): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/dashboard/check`, { headers: authHeaders() });
  return res.ok;
}

export type AddedSkill = { id?: number; name: string; category: string; level?: number };

export type Project = {
  id?: number;
  name: string;
  description: string;
  tech: string[];
  link?: string;
  image?: string;
  details?: string;
};

export type Achievement = {
  id?: number;
  title: string;
  description?: string;
  date?: string;
  image?: string;
  images?: string[];
  details?: string;
};

/** URL-friendly slug for detail-page routes (title → /projects/slug). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type Experience = {
  role: string;
  company: string;
  period: string;
  highlights: string[];
};

export type Education = {
  degree: string;
  school: string;
  period: string;
  detail?: string;
};

export type Profile = {
  name: string;
  title: string;
  location: string;
  email: string;
  summary: string;
  skills: {
    languages?: string[];
    frontend?: string[];
    backend?: string[];
    ai?: string[];
    tools?: string[];
    added?: AddedSkill[];
    [group: string]: string[] | AddedSkill[] | undefined;
  };
  projects: Project[];
  achievements: Achievement[];
  experience: Experience[];
  education?: Education[];
  contact: { github: string; linkedin: string; phone?: string };
};

export type ChatMessage = { role: "user" | "assistant"; content: string };

/** Absolute URL for files served by the backend (e.g. uploaded achievement images). */
export function mediaUrl(path?: string): string | undefined {
  if (!path) return undefined;
  return path.startsWith("http") ? path : `${API_URL}${path}`;
}

export async function fetchProfile(): Promise<Profile> {
  const res = await fetch(`${API_URL}/api/profile`, { cache: "no-store" });
  if (!res.ok) throw new Error(`profile fetch failed (${res.status})`);
  return res.json();
}

/** POST /api/chat and invoke onDelta for every streamed token. */
export async function streamChat(
  messages: ChatMessage[],
  onDelta: (text: string) => void,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `chat failed (${res.status})`);
  }
  if (!res.body) throw new Error("no response stream");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const event of events) {
      const line = event.split("\n").find((l) => l.startsWith("data:"));
      if (!line) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") return;
      const parsed = JSON.parse(data);
      if (parsed.error) throw new Error(parsed.error);
      if (parsed.text) onDelta(parsed.text);
    }
  }
}

export async function addSkill(payload: {
  name: string;
  category: string;
  level: number;
}): Promise<AddedSkill> {
  const res = await fetch(`${API_URL}/api/skills`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addProject(payload: {
  name: string;
  description: string;
  tech: string;
  link: string;
  details: string;
}): Promise<Project> {
  const res = await fetch(`${API_URL}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addAchievement(form: FormData): Promise<Achievement> {
  const res = await fetch(`${API_URL}/api/achievements`, {
    method: "POST",
    body: form,
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteItem(
  kind: "skills" | "projects" | "achievements",
  id: number,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/${kind}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
}
