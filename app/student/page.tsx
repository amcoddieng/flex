"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Users, Calendar, Clock, FileText, Search, MessageCircle, User, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function StudentDashboard() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  /**
   * Helper: Get the current valid token from localStorage
   */
  const getValidToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = decodeToken(token);
    if (!decoded || decoded.role !== 'STUDENT') {
      localStorage.removeItem('token');
      return null;
    }
    return token;
  };

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const token = getValidToken();
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAuthed(true);
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getValidToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/student/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!res.ok) {
        let errorMsg = 'Erreur lors de la récupération des statistiques';
        try {
          const errorData = await res.json();
          if (errorData.error) {
            errorMsg = errorData.error;
          }
        } catch {
          if (res.status === 401 || res.status === 403) {
            errorMsg = 'Accès refusé';
            router.push('/login');
            return;
          }
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.error || 'Réponse invalide');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('fetchStats error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthed) {
    return <div className="p-8">Vérification...</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs><pattern id="gridStud" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/></pattern></defs>
            <rect width="100" height="100" fill="url(#gridStud)"/>
          </svg>
        </div>
        <div className="relative px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-slate-400 text-sm mb-1">Bienvenue</p>
              <h1 className="text-2xl sm:text-3xl font-bold">Tableau de bord</h1>
              <p className="text-slate-400 text-sm mt-1">Découvrez les opportunités pour votre profil</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-semibold shadow-lg ring-2 ring-white/20">
              E
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link href="/student/jobs">
              <Button className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg gap-2">
                <Search className="h-4 w-4" />
                Explorer les offres
              </Button>
            </Link>
            <Link href="/student/applications">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/15 gap-2">
                <FileText className="h-4 w-4" />
                Mes candidatures
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-6 max-w-7xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : stats ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Link href="/student/applications">
                <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.applications?.total || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Candidatures envoyées</p>
                </div>
              </Link>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{stats.applications?.total > 0 ? Math.round(((stats.applications?.pending || 0) / (stats.applications?.total || 1)) * 100) : 0}%</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.applications?.pending || 0}</p>
                <p className="text-xs text-slate-500 mt-1">En attente</p>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Users className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+24%</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.applications?.interview || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Entretiens obtenus</p>
              </div>

              <Link href="/student/messages">
                <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    {stats.messages?.unread > 0 && (
                      <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{stats.messages?.unread} nouv.</span>
                    )}
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.messages?.unread || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Messages non lus</p>
                </div>
              </Link>
            </div>

            {/* Quick Actions + Recent Applications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Quick Actions */}
              <div className="lg:col-span-1">
                <h2 className="text-lg font-bold text-slate-900 mb-3">Actions rapides</h2>
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg space-y-2">
                  <Link href="/student/jobs">
                    <div className="group flex items-center gap-3 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl p-3 backdrop-blur-sm transition-all cursor-pointer">
                      <Briefcase className="h-5 w-5" />
                      <span className="text-sm font-semibold">Rechercher des offres</span>
                      <ArrowRight className="h-4 w-4 ml-auto opacity-60 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                  <Link href="/student/applications">
                    <div className="group flex items-center gap-3 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl p-3 backdrop-blur-sm transition-all cursor-pointer">
                      <FileText className="h-5 w-5" />
                      <span className="text-sm font-semibold">Mes candidatures</span>
                      <ArrowRight className="h-4 w-4 ml-auto opacity-60 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                  <Link href="/student/messages">
                    <div className="group flex items-center gap-3 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl p-3 backdrop-blur-sm transition-all cursor-pointer">
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm font-semibold">Messages</span>
                      <ArrowRight className="h-4 w-4 ml-auto opacity-60 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                  <Link href="/student/profile">
                    <div className="group flex items-center gap-3 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl p-3 backdrop-blur-sm transition-all cursor-pointer">
                      <User className="h-5 w-5" />
                      <span className="text-sm font-semibold">Mon profil</span>
                      <ArrowRight className="h-4 w-4 ml-auto opacity-60 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </div>
              </div>

              {/* Recent Applications */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Candidatures récentes</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Vos dernières activités</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs h-8 rounded-xl">Cette semaine</Button>
                  </div>
                  <div className="space-y-2">
                    {stats.recent_applications && stats.recent_applications.length > 0 ? (
                      stats.recent_applications.map((app: any) => (
                        <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                              <Briefcase className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{app.job_title}</p>
                              <p className="text-xs text-slate-500">{app.company} · {new Date(app.applied_at).toLocaleDateString('fr-FR')}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                            app.status === 'INTERVIEW' ? 'bg-blue-100 text-blue-700' :
                            app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {app.status === 'ACCEPTED' ? 'Acceptée' : app.status === 'INTERVIEW' ? 'Entretien' : app.status === 'REJECTED' ? 'Refusée' : 'En attente'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                          <FileText className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500 mb-3">Aucune candidature récente</p>
                        <Link href="/student/jobs">
                          <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Search className="h-4 w-4" />
                            Explorer les offres
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
