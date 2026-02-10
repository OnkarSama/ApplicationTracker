export type ApplicationStatus =
  | "Applied"
  | "Interview"
  | "Offer"
  | "Rejected"
  | "Wishlist";

export type JobApplication = {
  id: string;
  company: string;
  role: string;
  location?: string;
  url?: string;
  status: ApplicationStatus;
  appliedDate?: string; // YYYY-MM-DD
  notes?: string;
};
