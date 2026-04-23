"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Users, TrendingUp, Calendar, Clock, Star, BarChart3, Activity, UserPlus, FileText, ChevronUp, ChevronDown, MoreVertical } from "lucide-react";
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
    <div className="w-full h-full">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">Tableau de bord</h1>
              <p className="text-slate-600 text-sm">Gérez vos offres d'emploi et suivez vos candidatures</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-500">Bienvenue</p>
                <p className="font-semibold text-sm text-slate-900">Employeur</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                E
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
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
        <div className="px-6 py-6 space-y-6">
          {/* =========================================== */}
          {/* SECTION 1: CARDS DE STATISTIQUES PRINCIPALES */}
          {/* =========================================== */}
          {/* Grid responsive pour les 4 cartes de statistiques principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* CARTE 1: TOTAL DES OFFRES PUBLIÉES */}
            {/* Affiche le nombre total d'offres créées par l'employeur */}
            <div className="group relative bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                  {/* Icône principale de la carte */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500 flex items-center justify-center shadow">
                    <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  {/* Indicateur de croissance */}
                  <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                    <ChevronUp className="h-3 w-3" />
                    <span>12%</span>
                  </div>
                </div>
                <div>
                  {/* Titre et valeur principale */}
                  <p className="text-slate-600 text-xs font-medium mb-1">Offres publiées</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{stats.total_jobs || 0}</p>
                </div>
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100">
                  {/* Lien vers la page des offres */}
                  <Link href="/employer/jobs" className="text-blue-600 text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                    Voir les offres <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* CARTE 2: OFFRES ACTIVES */}
            {/* Affiche le nombre d'offres actuellement actives/en ligne */}
            <div className="group relative bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                  {/* Icône principale de la carte */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-500 flex items-center justify-center shadow">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  {/* Indicateur de croissance */}
                  <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                    <ChevronUp className="h-3 w-3" />
                    <span>8%</span>
                  </div>
                </div>
                <div>
                  {/* Titre et valeur principale */}
                  <p className="text-slate-600 text-xs font-medium mb-1">Offres actives</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{stats.active_jobs || 0}</p>
                </div>
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100">
                  <p className="text-slate-600 text-xs">
                    {stats.total_jobs > 0 ? Math.round(((stats.active_jobs || 0) / (stats.total_jobs || 1)) * 100) : 0}% du total
                  </p>
                </div>
              </div>
            </div>

            {/* CARTE 3: TOTAL DES CANDIDATURES REÇUES */}
            {/* Affiche le nombre total de candidatures pour toutes les offres de l'employeur */}
            <div className="group relative bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                  {/* Icône principale de la carte */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-indigo-500 flex items-center justify-center shadow">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  {/* Indicateur de croissance */}
                  <div className="flex items-center gap-1 text-amber-600 text-xs font-medium">
                    <ChevronUp className="h-3 w-3" />
                    <span>24%</span>
                  </div>
                </div>
                <div>
                  {/* Titre et valeur principale */}
                  <p className="text-slate-600 text-xs font-medium mb-1">Candidatures reçues</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total_applications || 0}</p>
                </div>
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100">
                  {/* Lien vers la page des candidatures */}
                  <Link href="/employer/applications" className="text-blue-600 text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                    Voir candidatures <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* CARTE 4: CANDIDATURES EN ATTENTE */}
            {/* Affiche le nombre de candidatures nécessitant une action de l'employeur */}
            <div className="group relative bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                  {/* Icône principale de la carte */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-yellow-500 flex items-center justify-center shadow">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  {/* Indicateur de tendance (baisse ici) */}
                  <div className="flex items-center gap-1 text-red-600 text-xs font-medium">
                    <ChevronDown className="h-3 w-3" />
                    <span>5%</span>
                  </div>
                </div>
                <div>
                  {/* Titre et valeur principale */}
                  <p className="text-slate-600 text-xs font-medium mb-1">En attente</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{stats.pending_applications || 0}</p>
                </div>
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100">
                  {/* Message d'action */}
                  <p className="text-slate-600 text-xs">À traiter rapidement</p>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================== */}
{/* SECTION 2: GRAPHIQUES ET MÉTRIQUES */}
{/* =========================================== */}
{/* Grid responsive pour les 2 graphiques principaux */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* GRAPHIQUE 1: ACTIVITÉ RÉCENTE */}
            {/* Affiche un histogramme des candidatures par semaine */}
            <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200/50 p-3 sm:p-4">
              {/* Header du graphique avec titre et légende */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900">Activité récente</h3>
                  <p className="text-xs text-slate-600 mt-1">Candidatures par semaine</p>
                </div>
                {/* Légende du graphique */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-slate-600 hidden sm:block">Cette semaine</span>
                </div>
              </div>
              {/* Histogramme avec barres animées */}
              <div className="h-40 sm:h-48 flex items-end justify-between gap-1 sm:gap-2">
                {[65, 80, 45, 90, 70, 85, 60].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
                    {/* Barre individuelle avec gradient et hover effect */}
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-500"
                      style={{ height: `${height}%` }}
                    ></div>
                    {/* Étiquette des jours (L1, L2, etc.) */}
                    <span className="text-xs text-slate-500 hidden sm:block">L{8-i}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* GRAPHIQUE 2: MÉTRIQUES DE PERFORMANCE */}
            {/* Affiche les indicateurs de performance clés */}
            <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200/50 p-3 sm:p-4">
              {/* Header avec titre et bouton d'export */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900">Performance</h3>
                  <p className="text-xs text-slate-600 mt-1">Métriques clés</p>
                </div>
                {/* Bouton d'export des données */}
                <Button variant="outline" size="sm" className="gap-2 text-xs hidden sm:flex">
                  <BarChart3 className="h-3 w-3" />
                  Exporter
                </Button>
              </div>
              {/* Liste des métriques avec icônes et valeurs */}
              <div className="space-y-3">
                {/* MÉTRIQUE 1: TAUX DE CONVERSION */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Icône de la métrique */}
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                    </div>
                    {/* Nom et description de la métrique */}
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">Taux de conversion</p>
                      <p className="text-xs text-slate-600 truncate">Candidatures → Entretiens</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg sm:text-xl font-bold text-slate-900">24%</p>
                    <p className="text-xs text-green-600">+3.2%</p>
                  </div>
                </div>
                {/* MÉTRIQUE 2: TEMPS MOYEN DE RÉPONSE */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Icône de la métrique */}
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    </div>
                    {/* Nom et description de la métrique */}
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">Temps moyen</p>
                      <p className="text-xs text-slate-600 truncate">Réponse aux candidats</p>
                    </div>
                  </div>
                  {/* Valeur et tendance */}
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-900">2.5j</p>
                    <p className="text-xs text-green-600">-0.8j</p>
                  </div>
                </div>
                
                {/* MÉTRIQUE 3: SATISFACTION DES CANDIDATS */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Icône de la métrique */}
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                    </div>
                    {/* Nom et description de la métrique */}
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">Satisfaction</p>
                      <p className="text-xs text-slate-600 truncate">Note des candidats</p>
                    </div>
                  </div>
                  {/* Valeur et tendance */}
                  <div className="text-right">
                    <p className="text-lg sm:text-xl font-bold text-slate-900">4.8</p>
                    <p className="text-xs text-amber-600">+0.2</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200/50 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900">Activité récente</h3>
                <p className="text-xs text-slate-600 mt-1">Vos dernières offres et candidatures</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2 text-xs hidden sm:flex">
                <Calendar className="h-3 w-3" />
                Cette semaine
              </Button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {stats.recent_jobs && stats.recent_jobs.length > 0 ? (
                stats.recent_jobs.map((job: any) => (
                  <div key={job.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-slate-200/50 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">{job.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-600 truncate">{job.location}</span>
                          <span className="text-slate-400 hidden sm:inline">•</span>
                          <span className="text-xs text-slate-600">{job.applicants || 0} candidature{(job.applicants || 0) !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        job.is_active 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {job.is_active ? 'Active' : 'Fermée'}
                      </span>
                      <Link href={`/employer/jobs/${job.id}`}>
                        <Button size="sm" variant="outline" className="gap-1 text-xs">
                          <FileText className="h-3 w-3" />
                          Voir
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400" />
                  </div>
                  <h4 className="text-sm sm:text-base font-medium text-slate-900 mb-2">Aucune offre récente</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mb-3">Commencez par créer votre première offre d'emploi</p>
                  <Link href="/employer/jobs/new">
                    <Button className="gap-2 text-sm w-full sm:w-auto">
                      <Briefcase className="h-4 w-4" />
                      Créer une offre
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-xl p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold mb-1">Actions rapides</h3>
                <p className="text-blue-100 text-xs sm:text-sm">Gérez votre activité efficacement</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link href="/employer/jobs/new" className="group">
                <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm transition-all duration-200 text-sm">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Créer une offre
                </Button>
              </Link>
              <Link href="/employer/applications" className="group">
                <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm transition-all duration-200 text-sm">
                  <Users className="h-4 w-4 mr-2" />
                  Candidatures
                </Button>
              </Link>
              <Link href="/employer/profile" className="group">
                <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm transition-all duration-200 text-sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Profil
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
