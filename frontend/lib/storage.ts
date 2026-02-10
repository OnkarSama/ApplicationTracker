import type { JobApplication } from "@/components/dashboard/types";

const AUTH_KEY = "apptracker_authed";
const APPS_KEY = "apptracker_apps";

export function setAuthed(v: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEY, v ? "1" : "0");
}

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "1";
}

export function logout() {
  setAuthed(false);
}

export function loadApps(): JobApplication[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(APPS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as JobApplication[];
  } catch {
    return [];
  }
}

export function saveApps(apps: JobApplication[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(APPS_KEY, JSON.stringify(apps));
}
