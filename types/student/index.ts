export interface UserInfo {
  userId: string;
  name?: string;
  email?: string;
  role?: string;
  avatar?: string | null;
}

export interface Application {
  id: number;
  job_id: number;
  student_id: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "INTERVIEW";
  applied_at: string;
  cover_letter: string;
  job: {
    id: number;
    title: string;
    description: string;
    location: string;
    job_type: string;
    salary: string;
    created_at: string;
    employer: {
      company_name: string;
      contact_person: string;
      email: string;
      phone: string;
    };
  };
}

export interface Job {
  id: string | number;
  title: string;
  company?: string;
  employer?: { company_name: string };
  location: string;
  salary: string;
  job_type?: string;
  type?: string;
  category?: string;
  created_at?: string;
  description?: string;
  urgent?: boolean;
}

export interface ForumTopic {
  id: number;
  title: string;
  author_name: string;
  author_university?: string;
  author_department?: string;
  category: string;
  likes: number;
  is_pinned: boolean;
  created_at: string;
  reply_count?: number;
  content?: string;
  tags?: string[];
  likedByMe?: boolean;
}

export interface ForumReply {
  id: number;
  author_name: string;
  author_university?: string;
  content: string;
  likes: number;
  is_helpful: boolean;
  created_at: string;
}

export type Section = "home" | "jobs" | "applications" | "forum" | "profile";
