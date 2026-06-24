"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Users, TrendingUp, Clock, UserPlus, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function EmployerDashboard() {
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
    if (!decoded || decoded.role !== 'EMPLOYER') {
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

      const res = await fetch('/api/employer/stats', {
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
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/></pattern></defs>
            <rect width="100" height="100" fill="url(#grid)"/>
          </svg>
        </div>
        <div className="relative px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-slate-400 text-sm mb-1">Bienvenue sur votre espace</p>
              <h1 className="text-2xl sm:text-3xl font-bold">Tableau de bord</h1>
              <p className="text-slate-400 text-sm mt-1">Gérez vos offres et suivez vos candidatures</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-400">Connecté en tant que</p>
                <p className="font-semibold text-sm">Employeur</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-lg ring-2 ring-white/20">
                E
              </div>
            </div>
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
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-slate-500 text-sm">Chargement de vos données...</p>
            </div>
          </div>
        ) : stats ? (
          <>
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Link href="/employer/jobs" className="group">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.total_jobs || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Offres publiées</p>
              </div>
            </Link>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+8%</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.active_jobs || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Offres actives</p>
            </div>

            <Link href="/employer/applications" className="group">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <Users className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">+24%</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.total_applications || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Candidatures</p>
              </div>
            </Link>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">-5%</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.pending_applications || 0}</p>
              <p className="text-xs text-slate-500 mt-1">En attente</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Recent Jobs */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Vos offres récentes</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Activité des 7 derniers jours</p>
                </div>
                <Link href="/employer/jobs">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    Voir tout <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                {stats.recent_jobs && stats.recent_jobs.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {stats.recent_jobs.map((job: any) => (
                      <div key={job.id} className="group flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Briefcase className="h-4 w-4 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-sm text-slate-900 truncate group-hover:text-blue-600 transition-colors">{job.title}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-slate-500">{job.location}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-xs text-slate-500">{job.applicants || 0} candidat{(job.applicants || 0) !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${job.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                            {job.is_active ? 'Active' : 'Fermée'}
                          </span>
                          <Link href={`/employer/jobs/${job.id}`}>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <Briefcase className="h-6 w-6 text-slate-400" />
                    </div>
                    <h4 className="text-sm font-medium text-slate-900 mb-1">Aucune offre récente</h4>
                    <p className="text-xs text-slate-500 mb-3">Créez votre première offre</p>
                    <Link href="/employer/jobs/new">
                      <Button size="sm" className="gap-2">
                        <Briefcase className="h-4 w-4" />
                        Créer une offre
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Actions rapides</h2>
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
                <div className="space-y-3">
                  <Link href="/employer/jobs/new">
                    <Button className="w-full bg-white/15 hover:bg-white/25 border border-white/20 text-white backdrop-blur-sm justify-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold">Nouvelle offre</p>
                        <p className="text-xs text-blue-100">Publier une annonce</p>
                      </div>
                    </Button>
                  </Link>
                  <Link href="/employer/applications">
                    <Button className="w-full bg-white/15 hover:bg-white/25 border border-white/20 text-white backdrop-blur-sm justify-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold">Candidatures</p>
                        <p className="text-xs text-blue-100">{stats.pending_applications || 0} en attente</p>
                      </div>
                    </Button>
                  </Link>
                  <Link href="/employer/profile">
                    <Button className="w-full bg-white/15 hover:bg-white/25 border border-white/20 text-white backdrop-blur-sm justify-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <UserPlus className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold">Mon profil</p>
                        <p className="text-xs text-blue-100">Mettre à jour</p>
                      </div>
                    </Button>
                  </Link>
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
