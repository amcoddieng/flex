"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase, FileText, MessageSquare, User, Search, Bell,
  LogOut, Home, MapPin, Clock, Banknote, Building2, Heart,
  ArrowRight, CheckCircle, XCircle, Eye, Trash2, Send,
  ChevronRight, Star, Zap, Pin, ThumbsUp,
  Menu, X, GraduationCap, Mail, Plus, AlertCircle,
  Loader2, Flame, BookOpen, Lightbulb, Users, Trophy, Sparkles, Code2,
  TrendingUp, Minus, BarChart3,
} from "lucide-react";
import { decodeToken } from "@/lib/jwt";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserInfo {
  userId: string;
  name?: string;
  email?: string;
  role?: string;
  avatar?: string | null;
}

interface Application {
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

interface Job {
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

interface ForumTopic {
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
  likedByMe?: boolean; // état local toggle
}

interface ForumReply {
  id: number;
  author_name: string;
  author_university?: string;
  content: string;
  likes: number;
  is_helpful: boolean;
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PENDING: {
    label: "En attente",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: Clock,
  },
  ACCEPTED: {
    label: "Acceptée",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Refusée",
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: XCircle,
  },
  INTERVIEW: {
    label: "Entretien",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    icon: Star,
  },
};

const CAT_COLORS: Record<string, { text: string; bg: string }> = {
  "Carrière":  { text: "text-blue-600",   bg: "bg-blue-50"   },
  "Études":    { text: "text-green-600",  bg: "bg-green-50"  },
  "Questions": { text: "text-amber-600",  bg: "bg-amber-50"  },
  "Idées":     { text: "text-pink-600",   bg: "bg-pink-50"   },
  "Général":   { text: "text-slate-600",  bg: "bg-slate-100" },
};

const TYPE_COLORS: Record<string, { text: string; bg: string }> = {
  "full-time":  { text: "text-blue-600",   bg: "bg-blue-50"   },
  "part-time":  { text: "text-emerald-600",bg: "bg-emerald-50"},
  "freelance":  { text: "text-violet-600", bg: "bg-violet-50" },
  "internship": { text: "text-amber-600",  bg: "bg-amber-50"  },
  "Stage":      { text: "text-amber-600",  bg: "bg-amber-50"  },
  "Part-time":  { text: "text-emerald-600",bg: "bg-emerald-50"},
  "Full-time":  { text: "text-blue-600",   bg: "bg-blue-50"   },
  "Freelance":  { text: "text-violet-600", bg: "bg-violet-50" },
};

type Section = "home" | "jobs" | "applications" | "forum" | "profile";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) { localStorage.removeItem("token"); return null; }
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      localStorage.removeItem("token"); return null;
    }
    return token;
  } catch { localStorage.removeItem("token"); return null; }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}j`;
}

function getJobType(job: Job): string {
  return job.job_type || job.type || "";
}

function getCompany(job: Job): string {
  return job.company || job.employer?.company_name || "";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", cfg.color, cfg.bg, cfg.border)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const cfg = TYPE_COLORS[type] ?? { text: "text-slate-500", bg: "bg-slate-100" };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", cfg.text, cfg.bg)}>
      {type}
    </span>
  );
}

function CatBadge({ cat }: { cat: string }) {
  const cfg = CAT_COLORS[cat] ?? CAT_COLORS["Général"];
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", cfg.text, cfg.bg)}>
      {cat}
    </span>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-slate-100", className)} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  // Data states
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [topicReplies, setTopicReplies] = useState<ForumReply[]>([]);
  const [savedJobs, setSavedJobs] = useState<Set<string | number>>(new Set());
  const [likedTopics, setLikedTopics] = useState<Set<number>>(new Set()); // ✅ toggle like local
  const [forumCatFilter, setForumCatFilter] = useState<string>("all");
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicContent, setNewTopicContent] = useState("");
  const [newTopicCategory, setNewTopicCategory] = useState("Général");
  const [submittingTopic, setSubmittingTopic] = useState(false);

  // Loading & error
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingForum, setLoadingForum] = useState(true);
  const [loadingTopic, setLoadingTopic] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI states
  const [jobSearch, setJobSearch] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [appStatusFilter, setAppStatusFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [newReply, setNewReply] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = getToken();
    console.log("Token check:", token ? "exists" : "missing");
    
    if (!token) { 
      console.log("No token, redirecting to login");
      router.push("/login"); 
      return; 
    }
    
    const decoded = decodeToken(token);
    console.log("Decoded token:", decoded);
    
    if (!decoded || decoded.role !== "STUDENT") { 
      console.log("Invalid token or role, redirecting to login");
      router.push("/login"); 
      return; 
    }
    
    const userInfo = {
      userId: String(decoded.userId),
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      avatar: decoded.avatar,
    };
    
    console.log("Setting user info:", userInfo);
    setUser(userInfo);
  }, [router]);

  // ── Fetch Applications ──────────────────────────────────────────────────────
  const fetchApplications = useCallback(async () => {
    const token = getToken();
    if (!token) {
      console.log("No token for fetchApplications");
      return;
    }
    
    console.log("Fetching applications...");
    setLoadingApps(true);
    try {
      const res = await fetch("/api/student/applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Applications response status:", res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Applications API error:", errorData);
        throw new Error(errorData.error || "Erreur chargement candidatures");
      }
      
      const data = await res.json();
      console.log("Applications data received:", data);
      setApplications(data.applications || []);
    } catch (e: any) {
      console.error("Error fetching applications:", e);
      setError(e.message);
    } finally {
      setLoadingApps(false);
    }
  }, []);

  // ── Fetch Jobs ──────────────────────────────────────────────────────────────
  const fetchJobs = useCallback(async () => {
    const token = getToken();
    if (!token) {
      console.log("No token for fetchJobs");
      return;
    }
    
    console.log("Fetching jobs...");
    setLoadingJobs(true);
    try {
      const res = await fetch("/api/job?page=1&limit=20", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Jobs response status:", res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Jobs API error:", errorData);
        throw new Error(errorData.error || "Erreur chargement offres");
      }
      
      const data = await res.json();
      console.log("Jobs data received:", data);
      // L'API job retourne { data: [...] } selon la route
      setJobs(data.data || data.jobs || data || []);
    } catch (e: any) {
      console.error("Error fetching jobs:", e);
      setError(e.message);
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  // ── Fetch Forum Topics ──────────────────────────────────────────────────────
  const fetchForumTopics = useCallback(async () => {
    const token = getToken();
    if (!token) {
      console.log("No token for fetchForumTopics");
      return;
    }
    
    console.log("Fetching forum topics...");
    setLoadingForum(true);
    try {
      const res = await fetch("/api/forum/topics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Forum response status:", res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Forum API error:", errorData);
        throw new Error(errorData.error || "Erreur chargement forum");
      }
      
      const data = await res.json();
      console.log("Forum data received:", data);
      setForumTopics(data.topics || data || []);
    } catch (e: any) {
      console.error("Error fetching forum topics:", e);
      setError(e.message);
    } finally {
      setLoadingForum(false);
    }
  }, []);

  // ── Fetch Topic Detail ──────────────────────────────────────────────────────
  const fetchTopicDetail = async (topicId: number) => {
    const token = getToken();
    if (!token) {
      console.log("No token for fetchTopicDetail");
      return;
    }
    
    console.log("Fetching topic detail...");
    if (!token) return;
    setLoadingTopic(true);
    try {
      const res = await fetch(`/api/forum/topics/${topicId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur chargement sujet");
      const data = await res.json();
      setSelectedTopic(data.topic);
      setTopicReplies(data.replies || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingTopic(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchApplications();
      fetchJobs();
      fetchForumTopics();
    }
  }, [user, fetchApplications, fetchJobs, fetchForumTopics]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const withdrawApplication = async (id: number) => {
    if (!confirm("Retirer cette candidature ?")) return;
    const token = getToken();
    if (!token) return;
    setWithdrawingId(id);
    try {
      const res = await fetch(`/api/student/applications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur retrait");
      setSelectedApp(null);
      await fetchApplications();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setWithdrawingId(null);
    }
  };

  const submitReply = async () => {
    if (!selectedTopic || !newReply.trim()) return;
    const token = getToken();
    if (!token) return;
    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/forum/topics/${selectedTopic.id}/replies`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: newReply.trim() }),
      });
      if (!res.ok) throw new Error("Erreur envoi réponse");
      setNewReply("");
      await fetchTopicDetail(selectedTopic.id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmittingReply(false);
    }
  };

  // ✅ Toggle like avec optimistic UI + synchronisation serveur
  const likeTopic = async (topicId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const token = getToken();
    if (!token) return;
    const alreadyLiked = likedTopics.has(topicId);
    // Optimistic update immediat
    setLikedTopics(prev => {
      const next = new Set(prev);
      alreadyLiked ? next.delete(topicId) : next.add(topicId);
      return next;
    });
    setForumTopics(prev => prev.map(t =>
      t.id === topicId ? { ...t, likes: t.likes + (alreadyLiked ? -1 : 1) } : t
    ));
    if (selectedTopic?.id === topicId) {
      setSelectedTopic(prev => prev ? { ...prev, likes: prev.likes + (alreadyLiked ? -1 : 1) } : prev);
    }
    try {
      const res = await fetch(`/api/forum/topics/${topicId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLikedTopics(prev => {
          const next = new Set(prev);
          data.liked ? next.add(topicId) : next.delete(topicId);
          return next;
        });
        setForumTopics(prev => prev.map(t =>
          t.id === topicId ? { ...t, likes: data.likes } : t
        ));
        if (selectedTopic?.id === topicId) {
          setSelectedTopic(prev => prev ? { ...prev, likes: data.likes } : prev);
        }
      } else {
        // Rollback si erreur serveur
        setLikedTopics(prev => { const next = new Set(prev); alreadyLiked ? next.add(topicId) : next.delete(topicId); return next; });
        setForumTopics(prev => prev.map(t => t.id === topicId ? { ...t, likes: t.likes + (alreadyLiked ? 1 : -1) } : t));
      }
    } catch {
      // Rollback reseau
      setLikedTopics(prev => { const next = new Set(prev); alreadyLiked ? next.add(topicId) : next.delete(topicId); return next; });
      setForumTopics(prev => prev.map(t => t.id === topicId ? { ...t, likes: t.likes + (alreadyLiked ? 1 : -1) } : t));
    }
  };

  // Creer un nouveau sujet forum
  const submitNewTopic = async () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim()) return;
    const token = getToken();
    if (!token) return;
    setSubmittingTopic(true);
    try {
      const res = await fetch('/api/forum/topics', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTopicTitle.trim(), content: newTopicContent.trim(), category: newTopicCategory, tags: [] }),
      });
      if (!res.ok) throw new Error('Erreur creation sujet');
      setShowNewTopicModal(false);
      setNewTopicTitle('');
      setNewTopicContent('');
      await fetchForumTopics();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmittingTopic(false);
    }
  };

  const likeReply = async (replyId: number) => {
    const token = getToken();
    if (!token) return;
    await fetch(`/api/forum/replies/${replyId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (selectedTopic) fetchTopicDetail(selectedTopic.id);
  };

  const logout = () => {
    localStorage.removeItem("token");
    try { window.dispatchEvent(new Event("user:logout")); } catch {}
    router.push("/login");
  };

  // ── Derived ──────────────────────────────────────────────────────────────────

  const filteredJobs = jobs.filter((j) => {
    const q = jobSearch.toLowerCase();
    const type = getJobType(j);
    const company = getCompany(j);
    return (
      (!q || j.title.toLowerCase().includes(q) || company.toLowerCase().includes(q)) &&
      (jobTypeFilter === "all" || type === jobTypeFilter || j.job_type === jobTypeFilter)
    );
  });

  const filteredApps = applications.filter(
    (a) => appStatusFilter === "all" || a.status === appStatusFilter
  );

  const pendingCount = applications.filter((a) => a.status === "PENDING").length;
  const acceptedCount = applications.filter((a) => a.status === "ACCEPTED").length;
  const interviewCount = applications.filter((a) => a.status === "INTERVIEW").length;

  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  // ── Nav items ─────────────────────────────────────────────────────────────────

  const navItems: { id: Section; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "home",         label: "Tableau de bord",  icon: Home },
    { id: "jobs",         label: "Offres d'emploi",  icon: Search },
    { id: "applications", label: "Mes candidatures", icon: FileText, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: "forum",        label: "Forum étudiant",   icon: MessageSquare },
    { id: "profile",      label: "Mon profil",       icon: User },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ─── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-none">FlexJob</p>
            <p className="text-[11px] text-primary font-medium mt-0.5">Sénégal</p>
          </div>
          <button
            className="ml-auto lg:hidden text-slate-400 hover:text-slate-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User card */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.name || "Étudiant"}</p>
              <p className="text-xs text-slate-400 truncate">{user.email || ""}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => { setActiveSection(id); setSidebarOpen(false); if (id === "forum") setSelectedTopic(null); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                activeSection === id
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              )}
            >
              <Icon className="h-4.5 w-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
              <span className="flex-1 text-left">{label}</span>
              {badge !== undefined && (
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  activeSection === id ? "bg-white/20 text-white" : "bg-primary text-white"
                )}>{badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="lg:ml-64 flex flex-col min-h-screen">

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-5 py-3.5 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1 relative hidden sm:block max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
              placeholder="Rechercher une offre..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
              <Bell className="h-5 w-5" />
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-bold text-xs">
              {userInitials}
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 p-5 lg:p-8">

          {error && (
            <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
              <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
            </div>
          )}

          {/* ════════════════════════════════════════
              HOME
          ════════════════════════════════════════ */}
          {activeSection === "home" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

              {/* Welcome banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-violet-600 text-white p-7">
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
                <div className="relative z-10">
                  <p className="text-white/70 text-sm mb-1">Bienvenue sur votre espace</p>
                  <h1 className="text-2xl lg:text-3xl font-bold mb-1">
                    Bonjour, {user.name?.split(" ")[0] || "Étudiant"} 👋
                  </h1>
                  <p className="text-white/80 text-sm mb-5">
                    {pendingCount > 0
                      ? `${pendingCount} candidature${pendingCount > 1 ? "s" : ""} en attente de réponse`
                      : "Explorez de nouvelles opportunités aujourd'hui !"}
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => setActiveSection("jobs")}
                      className="inline-flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors shadow-md"
                    >
                      <Search className="h-4 w-4" /> Explorer les offres
                    </button>
                    <button
                      onClick={() => setActiveSection("applications")}
                      className="inline-flex items-center gap-2 bg-white/15 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/25 transition-colors border border-white/20"
                    >
                      <FileText className="h-4 w-4" /> Mes candidatures
                    </button>
                  </div>
                </div>
              </div>

              {/* Enhanced Stats Dashboard */}
              <div className="space-y-6">
                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { 
                      label: "Total candidatures", 
                      value: applications.length, 
                      icon: FileText,  
                      color: "from-blue-500 to-blue-600", 
                      bg: "from-blue-50 to-blue-100", 
                      border: "border-blue-200",
                      trend: applications.length > 0 ? "up" : "neutral",
                      percentage: applications.length > 0 ? "+12%" : "0%"
                    },
                    { 
                      label: "En attente", 
                      value: pendingCount,         
                      icon: Clock,     
                      color: "from-amber-500 to-amber-600", 
                      bg: "from-amber-50 to-amber-100", 
                      border: "border-amber-200",
                      trend: pendingCount > 0 ? "up" : "neutral",
                      percentage: pendingCount > 0 ? "+5%" : "0%"
                    },
                    { 
                      label: "Acceptées", 
                      value: acceptedCount,        
                      icon: CheckCircle,
                      color: "from-emerald-500 to-emerald-600",
                      bg: "from-emerald-50 to-emerald-100",
                      border: "border-emerald-200",
                      trend: acceptedCount > 0 ? "up" : "neutral",
                      percentage: acceptedCount > 0 ? "+18%" : "0%"
                    },
                    { 
                      label: "Entretiens", 
                      value: interviewCount,       
                      icon: Star,      
                      color: "from-violet-500 to-violet-600", 
                      bg: "from-violet-50 to-violet-100",
                      border: "border-violet-200",
                      trend: interviewCount > 0 ? "up" : "neutral",
                      percentage: interviewCount > 0 ? "+8%" : "0%"
                    },
                  ].map(({ label, value, icon: Icon, color, bg, border, trend, percentage }) => (
                    <div 
                      key={label} 
                      className={cn(
                        "relative overflow-hidden rounded-3xl border backdrop-blur-md transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer group",
                        border, "bg-white/80"
                      )}
                      onClick={() => setActiveSection("applications")}
                    >
                      {/* Background gradient */}
                      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5", bg)} />
                      
                      {/* Animated decorative elements */}
                      <div className={cn("absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700", color)} />
                      <div className={cn("absolute -bottom-2 -left-2 w-12 h-12 bg-gradient-to-br opacity-15 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700", color)} />
                      
                      <div className="relative p-6">
                        {/* Header with icon and trend */}
                        <div className="flex items-start justify-between mb-4">
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl",
                            "bg-gradient-to-br", color, "text-white shadow-lg"
                          )}>
                            <Icon className="h-7 w-7" />
                          </div>
                          
                          {/* Trend indicator */}
                          <div className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
                            trend === "up" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                          )}>
                            {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                            {percentage}
                          </div>
                        </div>

                        {/* Main value */}
                        <div className="mb-2">
                          <p className="text-3xl font-bold text-slate-800 mb-1">
                            {loadingApps ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                                <span className="text-slate-400">...</span>
                              </div>
                            ) : (
                              <span className="group-hover:scale-105 transition-transform duration-300">{value}</span>
                            )}
                          </p>
                          <p className="text-sm text-slate-600 font-semibold">{label}</p>
                        </div>
                        
                        {/* Progress indicator with animation */}
                        {!loadingApps && (
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between items-center text-xs text-slate-500">
                              <span>Progression</span>
                              <span>{Math.min(value * 10, 100)}%</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full bg-gradient-to-r rounded-full transition-all duration-1000 ease-out",
                                  color
                                )} 
                                style={{ 
                                  width: `${Math.min(value * 10, 100)}%`,
                                  animation: value > 0 ? 'slideIn 1s ease-out' : 'none'
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Hover action hint */}
                        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-xs text-primary font-medium flex items-center gap-1">
                            <Eye className="h-3 w-3" /> Voir les détails
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Statistics Summary Card */}
                <div className="bg-gradient-to-r from-primary to-violet-600 rounded-3xl p-8 text-white relative overflow-hidden">
                  {/* Background decorations */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                  <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">📊 Résumé de vos candidatures</h2>
                        <p className="text-white/80">
                          {applications.length === 0 
                            ? "Commencez à postuler pour voir vos statistiques évoluer"
                            : `Vous avez postulé à ${applications.length} offre${applications.length > 1 ? "s" : ""} au total`
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-bold">{Math.round((acceptedCount / Math.max(applications.length, 1)) * 100)}%</p>
                        <p className="text-sm text-white/70">Taux de succès</p>
                      </div>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Ce mois", value: applications.filter(a => new Date(a.applied_at).getMonth() === new Date().getMonth()).length },
                        { label: "Réponses", value: acceptedCount + interviewCount },
                        { label: "En cours", value: pendingCount },
                        { label: "Taux réponse", value: `${Math.round(((acceptedCount + interviewCount) / Math.max(applications.length, 1)) * 100)}%` }
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                          <p className="text-2xl font-bold">{value}</p>
                          <p className="text-xs text-white/80">{label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Action button */}
                    <div className="mt-6">
                      <button
                        onClick={() => setActiveSection("applications")}
                        className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-2xl font-semibold hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      >
                        <BarChart3 className="h-5 w-5" />
                        Voir toutes les candidatures
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent applications + recent jobs */}
              <div className="grid lg:grid-cols-2 gap-5">

                {/* Recent applications */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-800 text-sm">Candidatures récentes</h2>
                    <button onClick={() => setActiveSection("applications")} className="text-xs text-primary font-medium hover:underline">
                      Voir tout
                    </button>
                  </div>
                  {loadingApps ? (
                    <div className="p-5 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
                  ) : applications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">Aucune candidature pour l'instant</div>
                  ) : (
                    applications.slice(0, 4).map((app) => (
                      <div key={app.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{app.job.title}</p>
                          <p className="text-xs text-slate-400">{app.job.employer.company_name}</p>
                        </div>
                        <StatusBadge status={app.status} />
                      </div>
                    ))
                  )}
                </div>

                {/* Recent jobs */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-800 text-sm">Nouvelles offres</h2>
                    <button onClick={() => setActiveSection("jobs")} className="text-xs text-primary font-medium hover:underline">
                      Explorer
                    </button>
                  </div>
                  {loadingJobs ? (
                    <div className="p-5 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
                  ) : jobs.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">Aucune offre disponible</div>
                  ) : (
                    jobs.slice(0, 4).map((job) => (
                      <div key={job.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{job.title}</p>
                          <p className="text-xs text-slate-400">{getCompany(job)} · {job.location}</p>
                        </div>
                        <TypeBadge type={getJobType(job)} />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Forum teaser */}
              {!loadingForum && forumTopics.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-800 text-sm">🔥 Forum — Sujets populaires</h2>
                    <button onClick={() => setActiveSection("forum")} className="text-xs text-primary font-medium hover:underline">
                      Voir tout
                    </button>
                  </div>
                  {forumTopics.slice(0, 3).map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => { setActiveSection("forum"); fetchTopicDetail(topic.id); }}
                      className="w-full flex items-start gap-3 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors text-left"
                    >
                      {topic.is_pinned && <Pin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{topic.title}</p>
                        <p className="text-xs text-slate-400">{topic.author_name} · {timeAgo(topic.created_at)}</p>
                      </div>
                      <CatBadge cat={topic.category} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════
              JOBS
          ════════════════════════════════════════ */}
          {activeSection === "jobs" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h1 className="text-xl font-bold text-slate-800">Offres d'emploi</h1>
                <p className="text-sm text-slate-500">{jobs.length} offre{jobs.length > 1 ? "s" : ""} disponible{jobs.length > 1 ? "s" : ""}</p>
              </div>

              {/* Search + Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    placeholder="Poste, entreprise, lieu..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["all", "internship", "part-time", "full-time", "freelance"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setJobTypeFilter(f)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-xs font-medium border transition-all",
                        jobTypeFilter === f
                          ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      {f === "all" ? "Toutes" : f === "internship" ? "Stage" : f === "part-time" ? "Temps partiel" : f === "full-time" ? "CDI" : "Freelance"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job cards */}
              {loadingJobs ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-52" />)}
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>Aucune offre trouvée</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredJobs.map((job) => {
                    const type = getJobType(job);
                    const company = getCompany(job);
                    const isSaved = savedJobs.has(job.id);
                    return (
                      <div
                        key={job.id}
                        className={cn(
                          "group relative overflow-hidden rounded-3xl border backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer",
                          "bg-white/80 border-slate-200/50 hover:border-primary/30"
                        )}
                      >
                        {/* Background gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Urgent indicator */}
                        {job.urgent && (
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 via-orange-400 to-red-400 animate-pulse" />
                        )}
                        
                        <div className="relative p-6">
                          {/* Header with icon and save button */}
                          <div className="flex items-start justify-between mb-4">
                            <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6",
                              "bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-primary/10 group-hover:to-primary/20"
                            )}>
                              <Building2 className="h-7 w-7 text-slate-600 group-hover:text-primary transition-colors" />
                            </div>
                            <button
                              onClick={() => setSavedJobs(prev => { const n = new Set(prev); isSaved ? n.delete(job.id) : n.add(job.id); return n; })}
                              className={cn(
                                "p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110",
                                isSaved 
                                  ? "bg-red-50 text-red-500 hover:bg-red-100" 
                                  : "bg-slate-100 text-slate-400 hover:text-red-400 hover:bg-red-50"
                              )}
                            >
                              <Heart className={cn("h-5 w-5 transition-transform duration-300", isSaved && "fill-current scale-110")} />
                            </button>
                          </div>

                          {/* Job title and company */}
                          <div className="mb-4">
                            <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                              {job.title}
                            </h3>
                            <p className="text-sm text-slate-600 font-medium flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary/40" />
                              {company}
                            </p>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {type && (
                              <span className={cn(
                                "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300",
                                "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 hover:border-blue-300"
                              )}>
                                {type}
                              </span>
                            )}
                            {job.urgent && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-red-600 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 animate-pulse">
                                <Zap className="h-3.5 w-3.5" /> Urgent
                              </span>
                            )}
                          </div>

                          {/* Job details */}
                          <div className="space-y-2 mb-5">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              <span className="font-medium">{job.location}</span>
                            </div>
                            {job.salary && (
                              <div className="flex items-center gap-3 text-sm">
                                <Banknote className="h-4 w-4 text-slate-400" />
                                <span className="font-bold text-primary">{job.salary}</span>
                              </div>
                            )}
                          </div>

                          {/* Action button */}
                          <Link
                            href={`/jobs/${job.id}`}
                            className={cn(
                              "block w-full text-center py-3 px-4 rounded-2xl text-sm font-bold transition-all duration-300",
                              "bg-gradient-to-r from-primary to-violet-600 text-white hover:from-primary/90 hover:to-violet-600/90",
                              "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                            )}
                          >
                            <span className="flex items-center justify-center gap-2">
                              Voir l'offre
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                            </span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════
              APPLICATIONS
          ════════════════════════════════════════ */}
          {activeSection === "applications" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Mes candidatures</h1>
                  <p className="text-sm text-slate-500">{applications.length} candidature{applications.length > 1 ? "s" : ""}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(["all", "PENDING", "INTERVIEW", "ACCEPTED", "REJECTED"] as const).map((f) => {
                    const cfg = f !== "all" ? STATUS_CONFIG[f] : null;
                    return (
                      <button
                        key={f}
                        onClick={() => setAppStatusFilter(f)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                          appStatusFilter === f
                            ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                        )}
                      >
                        {f === "all" ? "Toutes" : cfg?.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Debug Info - À supprimer après résolution */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
                  <p><strong>Debug Info:</strong></p>
                  <p>Applications: {applications.length}</p>
                  <p>Filtered Apps: {filteredApps.length}</p>
                  <p>Loading: {loadingApps ? 'Yes' : 'No'}</p>
                  <p>Filter: {appStatusFilter}</p>
                  <p>Error: {error || 'None'}</p>
                  <p>User ID: {user?.userId}</p>
                </div>
              )}

              {loadingApps ? (
                <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}</div>
              ) : filteredApps.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>Aucune candidature dans cette catégorie</p>
                  <button onClick={() => setActiveSection("jobs")} className="mt-4 text-primary text-sm font-medium hover:underline">
                    Explorer les offres →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredApps.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200"
                    >
                      <div className="flex items-start gap-4 flex-wrap">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
                            <h3 className="font-semibold text-slate-800">{app.job.title}</h3>
                            <StatusBadge status={app.status} />
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{app.job.employer.company_name}</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{app.job.location}</span>
                            <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{app.job.job_type}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Postulé le {new Date(app.applied_at).toLocaleDateString("fr-FR")}</span>
                          </div>
                          {app.job.salary && (
                            <p className="text-sm font-semibold text-primary mt-1">{app.job.salary}</p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-200 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" /> Détails
                          </button>
                          {app.status === "PENDING" && (
                            <button
                              onClick={() => withdrawApplication(app.id)}
                              disabled={withdrawingId === app.id}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              {withdrawingId === app.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Application detail modal */}
              {selectedApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-start justify-between">
                      <div>
                        <h2 className="font-bold text-slate-800 text-lg">{selectedApp.job.title}</h2>
                        <p className="text-sm text-slate-500">{selectedApp.job.employer.company_name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={selectedApp.status} />
                        <button onClick={() => setSelectedApp(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-6 space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: "Type de contrat", value: selectedApp.job.job_type, icon: Briefcase },
                          { label: "Localisation",    value: selectedApp.job.location,  icon: MapPin },
                          { label: "Salaire",         value: selectedApp.job.salary || "Non spécifié", icon: Banknote },
                          { label: "Candidature",     value: new Date(selectedApp.applied_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }), icon: Clock },
                        ].map(({ label, value, icon: Icon }) => (
                          <div key={label} className="bg-slate-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="h-3.5 w-3.5 text-slate-400" />
                              <p className="text-xs text-slate-400">{label}</p>
                            </div>
                            <p className="text-sm font-semibold text-slate-700">{value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-slate-50 rounded-xl p-4">
                        <h4 className="text-xs text-slate-400 mb-2 flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Contact recruteur</h4>
                        <p className="text-sm font-medium text-slate-700">{selectedApp.job.employer.contact_person}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{selectedApp.job.employer.email} · {selectedApp.job.employer.phone}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Description du poste</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">{selectedApp.job.description}</p>
                      </div>

                      {selectedApp.cover_letter && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-2">Ma lettre de motivation</h4>
                          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {selectedApp.cover_letter}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button onClick={() => setSelectedApp(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
                          Fermer
                        </button>
                        {selectedApp.status === "PENDING" && (
                          <button
                            onClick={() => withdrawApplication(selectedApp.id)}
                            disabled={withdrawingId === selectedApp.id}
                            className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {withdrawingId === selectedApp.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            Retirer la candidature
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════
              FORUM
          ════════════════════════════════════════ */}

          {/* ════════════════════════════════════════
              FORUM — Agora Étudiante
          ════════════════════════════════════════ */}
          {activeSection === "forum" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">

              {/* ── Vue détail d'un sujet ── */}
              {selectedTopic ? (
                <div className="space-y-5 max-w-3xl">
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
                  >
                    ← Retour à l'Agora
                  </button>

                  {loadingTopic ? (
                    <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32" />)}</div>
                  ) : (
                    <>
                      {/* Topic card */}
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        {/* Bannière catégorie */}
                        <div className={cn(
                          "h-1.5",
                          selectedTopic.category === "Carrière" && "bg-gradient-to-r from-blue-400 to-blue-600",
                          selectedTopic.category === "Études" && "bg-gradient-to-r from-emerald-400 to-emerald-600",
                          selectedTopic.category === "Tech & Code" && "bg-gradient-to-r from-violet-400 to-violet-600",
                          selectedTopic.category === "Entrepreneuriat" && "bg-gradient-to-r from-orange-400 to-orange-600",
                          selectedTopic.category === "Expériences" && "bg-gradient-to-r from-pink-400 to-pink-600",
                          selectedTopic.category === "Questions" && "bg-gradient-to-r from-amber-400 to-amber-600",
                          selectedTopic.category === "Général" && "bg-gradient-to-r from-slate-300 to-slate-500",
                          !["Carrière","Études","Tech & Code","Entrepreneuriat","Expériences","Questions","Général"].includes(selectedTopic.category) && "bg-gradient-to-r from-primary to-violet-500",
                        )} />
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            {selectedTopic.is_pinned && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/8 px-2 py-0.5 rounded-full border border-primary/20">
                                <Pin className="h-2.5 w-2.5" /> Épinglé
                              </span>
                            )}
                            <CatBadge cat={selectedTopic.category} />
                            {selectedTopic.tags?.map(tag => (
                              <span key={tag} className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">#{tag}</span>
                            ))}
                          </div>

                          <h1 className="text-xl font-bold text-slate-800 mb-5 leading-tight">{selectedTopic.title}</h1>

                          {selectedTopic.content && (
                            <div className="bg-slate-50 rounded-xl p-4 mb-5 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap border border-slate-100">
                              {selectedTopic.content}
                            </div>
                          )}

                          {/* Author + actions */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {selectedTopic.author_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-700">{selectedTopic.author_name}</p>
                              <p className="text-xs text-slate-400">
                                {selectedTopic.author_university}
                                {selectedTopic.author_department ? ` · ${selectedTopic.author_department}` : ""}
                                {" · "}{timeAgo(selectedTopic.created_at)}
                              </p>
                            </div>
                            <button
                              onClick={(e) => likeTopic(selectedTopic.id, e)}
                              className={cn(
                                "ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200",
                                likedTopics.has(selectedTopic.id)
                                  ? "bg-red-50 text-red-500 border-red-200 shadow-sm"
                                  : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-red-50 hover:text-red-400 hover:border-red-200"
                              )}
                            >
                              <Heart className={cn("h-3.5 w-3.5 transition-all", likedTopics.has(selectedTopic.id) && "fill-current scale-110")} />
                              {selectedTopic.likes}
                            </button>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 text-slate-400 border border-slate-200">
                              <MessageSquare className="h-3.5 w-3.5" />
                              {topicReplies.length} réponse{topicReplies.length !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Formulaire réponse */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold text-slate-800 text-sm">Partager votre point de vue</h3>
                        </div>
                        <textarea
                          value={newReply}
                          onChange={(e) => setNewReply(e.target.value)}
                          placeholder="Votre expérience, conseil ou avis sur ce sujet..."
                          rows={3}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 resize-none transition-all"
                        />
                        <div className="flex justify-between items-center mt-3">
                          <p className="text-xs text-slate-400">{newReply.length}/1000 caractères</p>
                          <button
                            onClick={submitReply}
                            disabled={submittingReply || !newReply.trim()}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-primary/20"
                          >
                            {submittingReply ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Publier
                          </button>
                        </div>
                      </div>

                      {/* Réponses */}
                      <div>
                        <h3 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-400" />
                          {topicReplies.length} {topicReplies.length === 1 ? "contribution" : "contributions"}
                        </h3>
                        {topicReplies.length === 0 ? (
                          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                            <Sparkles className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-400 text-sm font-medium">Soyez le premier à contribuer !</p>
                            <p className="text-slate-300 text-xs mt-1">Votre expérience peut aider quelqu'un.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {topicReplies.map((reply, idx) => (
                              <div key={reply.id} className={cn(
                                "bg-white rounded-2xl border p-5 transition-all",
                                reply.is_helpful ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200"
                              )}>
                                <div className="flex items-center gap-3 mb-3">
                                  <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0",
                                    idx % 3 === 0 ? "bg-gradient-to-br from-blue-400 to-blue-600" :
                                    idx % 3 === 1 ? "bg-gradient-to-br from-violet-400 to-violet-600" :
                                    "bg-gradient-to-br from-emerald-400 to-emerald-600"
                                  )}>
                                    {reply.author_name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-700">{reply.author_name}</p>
                                    <p className="text-xs text-slate-400">
                                      {reply.author_university ? `${reply.author_university} · ` : ""}
                                      {timeAgo(reply.created_at)}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {reply.is_helpful && (
                                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                        <Trophy className="h-3 w-3" /> Utile
                                      </span>
                                    )}
                                    <button
                                      onClick={() => likeReply(reply.id)}
                                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/5"
                                    >
                                      <ThumbsUp className="h-3.5 w-3.5" /> {reply.likes}
                                    </button>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

              ) : (
                /* ── Liste des sujets — Agora Étudiante ── */
                <div className="space-y-5">

                  {/* Header Agora */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-7">
                    <div className="absolute inset-0 opacity-20"
                      style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 40%)" }} />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="h-5 w-5 text-orange-400" />
                        <span className="text-orange-400 text-sm font-semibold">Agora Étudiante FlexJob</span>
                      </div>
                      <h1 className="text-2xl font-bold mb-1">Le carrefour des savoirs</h1>
                      <p className="text-slate-400 text-sm mb-5 max-w-lg">
                        Partagez vos expériences, posez vos questions, inspirez-vous. Un espace vivant où chaque étudiant devient une ressource pour un autre.
                      </p>
                      <div className="flex gap-3 flex-wrap">
                        <button
                          onClick={() => setShowNewTopicModal(true)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
                        >
                          <Plus className="h-4 w-4" /> Lancer une discussion
                        </button>
                        <div className="flex items-center gap-4 text-xs text-slate-400 ml-2">
                          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{forumTopics.length} sujets</span>
                          <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />Communauté active</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Thématiques — Cards catégories */}
                  <div>
                    <h2 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wide">Explorez par thématique</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {[
                        { id: "all",           label: "Tout",           icon: Flame,        color: "text-slate-600",    bg: "bg-slate-100",    active: "bg-slate-800 text-white" },
                        { id: "Carrière",      label: "Carrière",       icon: Trophy,       color: "text-blue-600",     bg: "bg-blue-50",      active: "bg-blue-600 text-white" },
                        { id: "Études",        label: "Études",         icon: BookOpen,     color: "text-emerald-600",  bg: "bg-emerald-50",   active: "bg-emerald-600 text-white" },
                        { id: "Tech & Code",   label: "Tech & Code",    icon: Code2,         color: "text-violet-600",   bg: "bg-violet-50",    active: "bg-violet-600 text-white" },
                        { id: "Entrepreneuriat",label:"Entrepreneuriat", icon: Lightbulb,   color: "text-orange-600",   bg: "bg-orange-50",    active: "bg-orange-500 text-white" },
                        { id: "Expériences",   label: "Expériences",    icon: Sparkles,     color: "text-pink-600",     bg: "bg-pink-50",      active: "bg-pink-500 text-white" },
                      ].map(({ id, label, icon: Icon, color, bg, active }) => {
                        const count = id === "all" ? forumTopics.length : forumTopics.filter(t => t.category === id).length;
                        const isActive = forumCatFilter === id;
                        return (
                          <button
                            key={id}
                            onClick={() => setForumCatFilter(id)}
                            className={cn(
                              "flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all duration-200 hover:-translate-y-0.5",
                              isActive ? `${active} border-transparent shadow-md` : `bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm`
                            )}
                          >
                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", isActive ? "bg-white/20" : bg)}>
                              <Icon className={cn("h-4.5 w-4.5", isActive ? "text-white" : color)} style={{width:18,height:18}} />
                            </div>
                            <div>
                              <p className={cn("text-xs font-semibold leading-none mb-0.5", isActive ? "text-white" : "text-slate-700")}>{label}</p>
                              <p className={cn("text-[10px]", isActive ? "text-white/70" : "text-slate-400")}>{count} sujet{count !== 1 ? "s" : ""}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Topics list */}
                  {loadingForum ? (
                    <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}</div>
                  ) : (() => {
                    const filtered = forumCatFilter === "all"
                      ? forumTopics
                      : forumTopics.filter(t => t.category === forumCatFilter);

                    if (filtered.length === 0) return (
                      <div className="text-center py-16 text-slate-400">
                        <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p className="font-medium">Aucun sujet dans cette thématique</p>
                        <button
                          onClick={() => setShowNewTopicModal(true)}
                          className="mt-3 text-primary text-sm font-semibold hover:underline"
                        >
                          Soyez le premier à en lancer un →
                        </button>
                      </div>
                    );

                    // Sujets épinglés en premier
                    const pinned = filtered.filter(t => t.is_pinned);
                    const normal = filtered.filter(t => !t.is_pinned);

                    return (
                      <div className="space-y-2">
                        {pinned.length > 0 && (
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-1 flex items-center gap-1.5">
                            <Pin className="h-3 w-3" /> Épinglés
                          </p>
                        )}
                        {[...pinned, ...normal].map((topic) => {
                          const isLiked = likedTopics.has(topic.id);
                          const catCfg: Record<string, {dot: string}> = {
                            "Carrière":       { dot: "bg-blue-500" },
                            "Études":         { dot: "bg-emerald-500" },
                            "Tech & Code":    { dot: "bg-violet-500" },
                            "Entrepreneuriat":{ dot: "bg-orange-500" },
                            "Expériences":    { dot: "bg-pink-500" },
                            "Questions":      { dot: "bg-amber-500" },
                            "Général":        { dot: "bg-slate-400" },
                          };
                          const dot = catCfg[topic.category]?.dot || "bg-primary";

                          return (
                            <div
                              key={topic.id}
                              className={cn(
                                "group bg-white rounded-2xl border transition-all duration-200 cursor-pointer",
                                topic.is_pinned
                                  ? "border-l-4 border-l-primary border-t-slate-200 border-r-slate-200 border-b-slate-200 shadow-sm"
                                  : "border-slate-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
                              )}
                            >
                              <div className="p-5">
                                <div className="flex items-start gap-4">
                                  {/* Avatar */}
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                                    {topic.author_name.charAt(0).toUpperCase()}
                                  </div>

                                  {/* Content */}
                                  <div
                                    className="flex-1 min-w-0"
                                    onClick={() => fetchTopicDetail(topic.id)}
                                  >
                                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                      <span className={cn("w-2 h-2 rounded-full flex-shrink-0", dot)} />
                                      <CatBadge cat={topic.category} />
                                      {topic.is_pinned && (
                                        <span className="text-[10px] font-bold text-primary bg-primary/8 px-1.5 py-0.5 rounded-full">ÉPINGLÉ</span>
                                      )}
                                    </div>
                                    <h3 className="font-semibold text-slate-800 text-sm group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
                                      {topic.title}
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                      <span className="font-medium text-slate-500">{topic.author_name}</span>
                                      {topic.author_university ? ` · ${topic.author_university}` : ""}
                                      {" · "}{timeAgo(topic.created_at)}
                                    </p>
                                  </div>

                                  {/* Stats + like button */}
                                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                      <span
                                        className="flex items-center gap-1 cursor-pointer hover:text-slate-600"
                                        onClick={() => fetchTopicDetail(topic.id)}
                                      >
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        {topic.reply_count ?? 0}
                                      </span>
                                      {/* ✅ Like toggle — stopPropagation pour ne pas ouvrir le topic */}
                                      <button
                                        onClick={(e) => likeTopic(topic.id, e)}
                                        className={cn(
                                          "flex items-center gap-1 px-2 py-1 rounded-lg border transition-all duration-200",
                                          isLiked
                                            ? "text-red-500 bg-red-50 border-red-200"
                                            : "text-slate-400 border-transparent hover:border-red-200 hover:bg-red-50 hover:text-red-400"
                                        )}
                                      >
                                        <Heart className={cn("h-3.5 w-3.5 transition-all duration-150", isLiked && "fill-current scale-110")} />
                                        <span className="font-medium">{topic.likes}</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ── Modal : Nouveau sujet ── */}
              {showNewTopicModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
                  <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header modal */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h2 className="font-bold text-slate-800">Lancer une discussion</h2>
                      </div>
                      <button onClick={() => setShowNewTopicModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="p-6 space-y-4">
                      {/* Catégorie */}
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Thématique</label>
                        <div className="flex flex-wrap gap-2">
                          {["Carrière", "Études", "Tech & Code", "Entrepreneuriat", "Expériences", "Questions", "Général"].map(cat => (
                            <button
                              key={cat}
                              onClick={() => setNewTopicCategory(cat)}
                              className={cn(
                                "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                                newTopicCategory === cat
                                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                              )}
                            >{cat}</button>
                          ))}
                        </div>
                      </div>

                      {/* Titre */}
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Titre du sujet *</label>
                        <input
                          value={newTopicTitle}
                          onChange={e => setNewTopicTitle(e.target.value)}
                          maxLength={120}
                          placeholder="Ex: Comment décrocher un stage en tech au Sénégal ?"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                        />
                        <p className="text-xs text-slate-400 mt-1 text-right">{newTopicTitle.length}/120</p>
                      </div>

                      {/* Contenu */}
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Développez votre idée *</label>
                        <textarea
                          value={newTopicContent}
                          onChange={e => setNewTopicContent(e.target.value)}
                          placeholder="Partagez votre expérience, posez votre question, proposez votre idée... Plus vous êtes précis, plus les réponses seront utiles !"
                          rows={5}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 resize-none transition-all"
                        />
                      </div>

                      {/* Conseil */}
                      <div className="flex items-start gap-3 bg-primary/5 border border-primary/15 rounded-xl p-3">
                        <Lightbulb className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 leading-relaxed">
                          <span className="font-semibold text-primary">Conseil :</span> Un sujet précis et bien rédigé attire plus de contributions. Partagez votre contexte, ce que vous avez déjà essayé, et ce que vous cherchez vraiment.
                        </p>
                      </div>
                    </div>

                    {/* Footer modal */}
                    <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                      <button
                        onClick={() => setShowNewTopicModal(false)}
                        className="flex-1 py-2.5 bg-white text-slate-600 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-100 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={submitNewTopic}
                        disabled={submittingTopic || !newTopicTitle.trim() || !newTopicContent.trim()}
                        className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                      >
                        {submittingTopic ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flame className="h-4 w-4" />}
                        Publier le sujet
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}


          {/* ════════════════════════════════════════
              PROFILE
          ════════════════════════════════════════ */}
          {activeSection === "profile" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-3xl">
              <div>
                <h1 className="text-xl font-bold text-slate-800">Mon profil</h1>
                <p className="text-sm text-slate-500">Gérez vos informations personnelles</p>
              </div>

              {/* Profile header */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-primary to-violet-600" />
                <div className="px-6 pb-6">
                  <div className="flex items-end gap-4 -mt-8 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg">
                      {userInitials}
                    </div>
                    <div className="pb-1">
                      <h2 className="text-lg font-bold text-slate-800">{user.name || "Étudiant"}</h2>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                    <Link
                      href="/student/profile/edit"
                      className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                    >
                      Modifier
                    </Link>
                  </div>
                </div>
              </div>

              {/* Info fields */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-800 text-sm mb-4">Informations personnelles</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: "Nom complet", value: user.name, icon: User },
                    { label: "Adresse email", value: user.email, icon: Mail },
                    { label: "Rôle", value: "Étudiant", icon: GraduationCap },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400">{label}</p>
                        <p className="text-sm font-semibold text-slate-700 truncate">{value || "—"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats recap */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-800 text-sm mb-4">Résumé d'activité</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: "Candidatures", value: applications.length },
                    { label: "Offres sauvegardées", value: savedJobs.size },
                    { label: "Entretiens obtenus", value: interviewCount + acceptedCount },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-4">
                      <p className="text-2xl font-bold text-primary">{loadingApps ? "—" : value}</p>
                      <p className="text-xs text-slate-500 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick links */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <h3 className="font-semibold text-slate-800 text-sm px-5 py-4 border-b border-slate-100">Accès rapide</h3>
                {[
                  { label: "Mes candidatures",  href: "#",         action: () => setActiveSection("applications"), icon: FileText  },
                  { label: "Explorer les offres",href: "#",         action: () => setActiveSection("jobs"),         icon: Search    },
                  { label: "Forum étudiant",     href: "#",         action: () => setActiveSection("forum"),        icon: MessageSquare },
                  { label: "Modifier mon profil",href: "/student/profile/edit", icon: User },
                ].map(({ label, href, action, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="w-full flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-slate-700 font-medium flex-1">{label}</span>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 lg:hidden px-2 pb-safe">
        <div className="flex justify-around">
          {navItems.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => { setActiveSection(id); if (id === "forum") setSelectedTopic(null); }}
              className={cn(
                "flex flex-col items-center gap-1 py-3 px-2 relative flex-1",
                activeSection === id ? "text-primary" : "text-slate-400"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {badge !== undefined && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-none">
                {label.split(" ")[0]}
              </span>
              {activeSection === id && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </nav>

      <div className="h-16 lg:hidden" />
    </div>
  );
}