import type { JobApplication } from "@/components/dashboard/types";

export const seedApps: JobApplication[] = [
  {
    id: "1",
    company: "Acme Corp",
    role: "Software Engineer Intern",
    location: "New York, NY",
    url: "https://example.com/job/1",
    status: "Applied",
    appliedDate: "2026-02-01",
    notes: "Submitted via portal",
  },
  {
    id: "2",
    company: "Globex",
    role: "Frontend Developer",
    location: "Remote",
    url: "https://example.com/job/2",
    status: "Interview",
    appliedDate: "2026-02-03",
    notes: "Recruiter screen scheduled",
  },
];
