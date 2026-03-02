export type ApplicationStatus =
  | "Applied"
  | "Interview"
  | "Offer"
  | "Rejected"
  | "Wishlist";

export type ApplicationPriority = "High" | "Medium" | "Low";

export type JobApplication = {
  id: string;
  company: string;
  role: string;
  location?: string;
  url?: string;
  status: ApplicationStatus;
  priority: ApplicationPriority;
  salary?: string;         // e.g. "$120,000"
  appliedDate?: string;    // YYYY-MM-DD
  notes?: string;
};