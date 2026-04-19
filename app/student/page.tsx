"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Users, TrendingUp, Calendar, Clock, Star, BarChart3, Activity, UserPlus, FileText, ChevronUp, ChevronDown, MoreVertical, Search, Bell, Zap, MessageCircle, User } from "lucide-react";
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
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Bienvenue sur votre tableau de bord</h1>
            <p className="text-blue-100">Découvrez les opportunités qui correspondent à votre profil</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Link href="/student/jobs">
            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border border-white/30 text-white">
              <Search className="h-4 w-4 mr-2" />
              Explorer les offres
            </Button>
          </Link>
          <Link href="/student/applications">
            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border border-white/30 text-white">
              <FileText className="h-4 w-4 mr-2" />
              Mes candidatures
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-600">Chargement...</p>
          </div>
        </div>
      ) : stats ? (
        <>
          {/* Modern Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Applications */}
            <div className="group relative bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center shadow">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                    <ChevronUp className="h-3 w-3" />
                    <span>12%</span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-600 text-xs font-medium mb-1">Candidatures envoyées</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.applications?.total || 0}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <Link href="/student/applications" className="text-blue-600 text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                    Voir les candidatures <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Pending Applications */}
            <div className="group relative bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center shadow">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600 text-xs font-medium">
                    <ChevronUp className="h-3 w-3" />
                    <span>8%</span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-600 text-xs font-medium mb-1">En attente de réponse</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.applications?.pending || 0}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-slate-600 text-xs">
                    {stats.applications?.total > 0 ? Math.round(((stats.applications?.pending || 0) / (stats.applications?.total || 1)) * 100) : 0}% du total
                  </p>
                </div>
              </div>
            </div>

            {/* Interviews */}
            <div className="group relative bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center shadow">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                    <ChevronUp className="h-3 w-3" />
                    <span>24%</span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-600 text-xs font-medium mb-1">Entretiens obtenus</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.applications?.interview || 0}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-slate-600 text-xs">Excellent progression!</p>
                </div>
              </div>
            </div>

            {/* Profile Views */}
            <div className="group relative bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center shadow">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-purple-600 text-xs font-medium">
                    <ChevronUp className="h-3 w-3" />
                    <span>5%</span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-600 text-xs font-medium mb-1">Messages non lus</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.messages?.unread || 0}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <Link href="/student/messages" className="text-blue-600 text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                    Voir les messages <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Activity Chart */}
            <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200/50 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Activité récente</h3>
                  <p className="text-xs text-slate-600 mt-1">Candidatures par semaine</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-slate-600">Cette semaine</span>
                </div>
              </div>
              <div className="h-48 flex items-end justify-between gap-2">
                {[45, 60, 35, 80, 55, 70, 40].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-500"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs text-slate-500">L{8-i}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200/50 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Performance</h3>
                  <p className="text-xs text-slate-600 mt-1">Métriques clés</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <BarChart3 className="h-3 w-3" />
                  Exporter
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <UserPlus className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Taux de réponse</p>
                      <p className="text-xs text-slate-600">Candidatures avec réponse</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-900">68%</p>
                    <p className="text-xs text-green-600">+5.2%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <Activity className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Temps moyen</p>
                      <p className="text-xs text-slate-600">Réponse des employeurs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-900">4.2j</p>
                    <p className="text-xs text-green-600">-1.1j</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <Star className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Score profil</p>
                      <p className="text-xs text-slate-600">Complétude du profil</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-900">85%</p>
                    <p className="text-xs text-amber-600">+2%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200/50 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Candidatures récentes</h3>
                <p className="text-xs text-slate-600 mt-1">Vos dernières activités</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <Calendar className="h-3 w-3" />
                Cette semaine
              </Button>
            </div>
            <div className="space-y-4">
              {stats.recent_applications && stats.recent_applications.length > 0 ? (
                stats.recent_applications.map((app: any) => (
                  <div key={app.id} className="group flex items-center justify-between p-3 rounded-lg border border-slate-200/50 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">{app.job_title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-600">{app.company}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-xs text-slate-600">{new Date(app.applied_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.status === 'ACCEPTED' 
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : app.status === 'INTERVIEW'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : app.status === 'REJECTED'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {app.status === 'ACCEPTED' ? 'Acceptée' : app.status === 'INTERVIEW' ? 'Entretien' : app.status === 'REJECTED' ? 'Refusée' : 'En attente'}
                      </span>
                      <Link href={`/student/applications/${app.id}`}>
                        <Button size="sm" variant="outline" className="gap-1 text-xs">
                          <FileText className="h-3 w-3" />
                          Voir
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-slate-400" />
                  </div>
                  <h4 className="text-base font-medium text-slate-900 mb-2">Aucune candidature récente</h4>
                  <p className="text-sm text-slate-600 mb-3">Commencez par postuler aux offres qui vous intéressent</p>
                  <Link href="/student/jobs">
                    <Button className="gap-2 text-sm">
                      <Search className="h-4 w-4" />
                      Explorer les offres
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold mb-1">Actions rapides</h3>
                <p className="text-blue-100">Accédez rapidement aux fonctionnalités principales</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/student/jobs">
                <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 border border-white/30 text-white justify-start">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Rechercher
                </Button>
              </Link>
              <Link href="/student/applications">
                <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 border border-white/30 text-white justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Candidatures
                </Button>
              </Link>
              <Link href="/student/messages">
                <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 border border-white/30 text-white justify-start">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Messages
                </Button>
              </Link>
              <Link href="/student/profile">
                <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 border border-white/30 text-white justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Profil
                </Button>
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
