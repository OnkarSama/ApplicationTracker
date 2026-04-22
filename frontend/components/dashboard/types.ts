export type ApplicationStatus =
  | "Wishlist"
  | "Applied"
  | "Under Review"
  | "Awaiting Decision"
  | "Interview"
  | "Offer"
  | "Rejected";

export type ApplicationPriority = "High" | "Medium" | "Low";

export type JobApplication = {
  id: string;
  company: string;
  role: string;
  location?: string;
  url?: string;
  status: ApplicationStatus;
  priority: ApplicationPriority;
  salary?: string;
  appliedDate?: string;
  notes?: string;
};
