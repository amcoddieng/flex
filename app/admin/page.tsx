"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { AdminLayout } from "@/components/admin-layout";
import { ArrowRight, Users, Briefcase, FileText, CheckCircle, TrendingUp, Building, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const router = useRouter();

  const getValidToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = decodeToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      localStorage.removeItem('token');
      return null;
    }
    return token;
  };

  useEffect(() => {
    const token = getValidToken();
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAuthed(true);
    fetchStats(token);
  }, [router]);

  const fetchStats = async (token: string) => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/admin/stats', {
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
      // En cas d'erreur, afficher un message ou des données par défaut
      setStats({
        total_users: 0,
        total_students: 0,
        total_employers: 0,
        total_jobs: 0,
        active_jobs: 0,
        pending_employers: 0,
        total_applications: 0,
        this_month_registrations: 0,
      });
    } finally {
      setLoadingStats(false);
    }
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Utilisateurs",
      value: stats?.total_users || 0,
      icon: Users,
      // COULEUR: Gris foncé - Couleur neutre pour les statistiques générales
      color: "bg-gray-700",
      change: `+${stats?.new_users_last_7_days || 0} cette semaine`,
      changeType: "positive"
    },
    {
      title: "Étudiants",
      value: stats?.total_students || 0,
      icon: Users,
      // COULEUR: Vert - Couleur positive pour les étudiants (utilisateurs actifs)
      color: "bg-green-500",
      change: `+${stats?.new_users_last_7_days || 0} cette semaine`,
      changeType: "positive"
    },
    {
      title: "Employeurs",
      value: stats?.total_employers || 0,
      icon: Briefcase,
      // COULEUR: Violet - Couleur distinctive pour les employeurs (professionnel)
      color: "bg-purple-500",
      change: `${stats?.pending_employers || 0} en attente`,
      changeType: stats?.pending_employers > 0 ? "warning" : "positive"
    },
    {
      title: "Offres d'Emploi",
      value: stats?.total_jobs || 0,
      icon: FileText,
      // COULEUR: Orange - Couleur chaude pour les offres d'emploi (opportunités)
      color: "bg-orange-500",
      change: `${stats?.active_jobs || 0} actives`,
      changeType: "positive"
    },
    {
      title: "Validations en Attente",
      value: (stats?.pending_employers || 0) + (stats?.pending_students || 0),
      icon: CheckCircle,
      // COULEUR: Jaune - Couleur d'alerte pour les validations en attente (attention requise)
      color: "bg-yellow-500",
      change: `${stats?.pending_employers || 0} employeurs, ${stats?.pending_students || 0} étudiants`,
      changeType: "warning"
    },
    {
      title: "Candidatures Totales",
      value: stats?.total_applications || 0,
      icon: FileText,
      // COULEUR: Indigo - Couleur informative pour les candidatures (données)
      color: "bg-indigo-500",
      change: `${stats?.pending_applications || 0} en attente`,
      changeType: "info"
    },
    {
      title: "Offres Actives",
      value: stats?.active_jobs || 0,
      icon: TrendingUp,
      // COULEUR: Turquoise - Couleur positive pour les offres actives (croissance)
      color: "bg-teal-500",
      change: `${stats?.total_jobs || 0} totales`,
      changeType: "positive"
    },
    {
      title: "Inscriptions ce Mois",
      value: stats?.this_month_registrations || 0,
      icon: Building,
      color: "bg-pink-500",
      change: `+${stats?.new_users_last_7_days || 0} cette semaine`,
      changeType: "positive"
    }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs><pattern id="gridAdmin" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/></pattern></defs>
              <rect width="100" height="100" fill="url(#gridAdmin)"/>
            </svg>
          </div>
          <div className="relative px-6 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">Vue d'ensemble</p>
                <h1 className="text-2xl sm:text-3xl font-bold">Tableau de bord</h1>
                <p className="text-slate-400 text-sm mt-1">Statistiques et activité de la plateforme</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-400">Connecté en tant que</p>
                  <p className="font-semibold text-sm">Administrateur</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-lg ring-2 ring-white/20">
                  A
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6 space-y-6 max-w-7xl">
          {/* Stats Grid */}
          {loadingStats ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm animate-pulse">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 mb-3"></div>
                  <div className="h-8 bg-slate-100 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-slate-100 rounded w-24"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {statCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div key={index} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-slate-600" />
                      </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">{card.value.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-1">{card.title}</p>
                    <p className={`text-[11px] font-semibold mt-1.5 ${card.changeType === 'positive' ? 'text-emerald-600' : card.changeType === 'warning' ? 'text-amber-600' : 'text-blue-600'}`}>
                      {card.change}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Actions + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Actions rapides</h2>
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link href="/admin/employer-validation">
                    <div className="group bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl p-4 backdrop-blur-sm transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Validations</p>
                          <p className="text-xs text-blue-100">{stats?.pending_employers || 0} en attente</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <Link href="/admin/users">
                    <div className="group bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl p-4 backdrop-blur-sm transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Utilisateurs</p>
                          <p className="text-xs text-blue-100">Gérer les comptes</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <Link href="/admin/jobs">
                    <div className="group bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl p-4 backdrop-blur-sm transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Offres</p>
                          <p className="text-xs text-blue-100">{stats?.active_jobs || 0} actives</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <Link href="/admin/applications">
                    <div className="group bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl p-4 backdrop-blur-sm transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Candidatures</p>
                          <p className="text-xs text-blue-100">{stats?.total_applications || 0} totales</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Activité récente</h2>
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70">
                  <div>
                    <p className="text-xs text-slate-500">Nouveaux employeurs</p>
                    <p className="text-sm font-semibold text-slate-900">Ce mois</p>
                  </div>
                  <span className="text-lg font-bold text-purple-600">{stats?.this_month_registrations || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70">
                  <div>
                    <p className="text-xs text-slate-500">Offres actives</p>
                    <p className="text-sm font-semibold text-slate-900">En ligne</p>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">{stats?.active_jobs || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70">
                  <div>
                    <p className="text-xs text-slate-500">Validations en attente</p>
                    <p className="text-sm font-semibold text-slate-900">Profils</p>
                  </div>
                  <span className="text-lg font-bold text-amber-600">{stats?.pending_employers || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
