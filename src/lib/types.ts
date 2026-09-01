export type AdminRole = "SUPER_ADMIN" | "COORDINATOR";
export type AdminStatus = "pending" | "active" | "suspended";

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole | null;
  status: AdminStatus;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FestEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  venue: string | null;
  start_time: string;
  end_time: string | null;
  banner_url: string | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sponsor {
  id: string;
  name: string;
  tier: string;
  logo_url: string | null;
  website_url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  storage_path: string;
  caption: string | null;
  event_id: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLogEntry {
  id: string;
  actor_id: string | null;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_label: string | null;
  created_at: string;
}
