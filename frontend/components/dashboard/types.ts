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
  salary?: string;
  appliedDate?: string;
  notes?: string;
};
