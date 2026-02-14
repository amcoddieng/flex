"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Users, TrendingUp } from "lucide-react";
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Tableau de bord</h1>
        <p className="text-slate-600">Gérez vos offres d'emploi et suivez vos candidatures</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-600">Chargement...</p>
        </div>
      ) : stats ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Offers */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Offres publiées</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total_jobs || 0}</p>
                </div>
                <Briefcase className="h-10 w-10 text-blue-500 opacity-20" />
              </div>
              <Link href="/employer/jobs" className="text-blue-600 text-sm font-medium mt-4 inline-flex items-center gap-1 hover:gap-2 transition-all">
                Voir les offres <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Active Offers */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Offres actives</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.active_jobs || 0}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-500 opacity-20" />
              </div>
              <p className="text-slate-600 text-xs mt-4">
                {stats.total_jobs > 0 ? Math.round(((stats.active_jobs || 0) / (stats.total_jobs || 1)) * 100) : 0}% du total
              </p>
            </div>

            {/* Total Applications */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Candidatures reçues</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total_applications || 0}</p>
                </div>
                <Users className="h-10 w-10 text-amber-500 opacity-20" />
              </div>
              <Link href="/employer/applications" className="text-blue-600 text-sm font-medium mt-4 inline-flex items-center gap-1 hover:gap-2 transition-all">
                Voir candidatures <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Pending Applications */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Candidatures en attente</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.pending_applications || 0}</p>
                </div>
                <Users className="h-10 w-10 text-red-500 opacity-20" />
              </div>
              <p className="text-slate-600 text-xs mt-4">À traiter rapidement</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Actions rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/employer/jobs/new" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  + Créer une offre
                </Button>
              </Link>
              <Link href="/employer/applications" className="block">
                <Button variant="outline" className="w-full">
                  Gérer les candidatures
                </Button>
              </Link>
              <Link href="/employer/profile" className="block">
                <Button variant="outline" className="w-full">
                  Modifier mon profil
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Offers */}
          {stats.recent_jobs && stats.recent_jobs.length > 0 && (
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Offres récentes</h2>
              <div className="space-y-4">
                {stats.recent_jobs.map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div>
                      <h3 className="font-semibold text-slate-900">{job.title}</h3>
                      <p className="text-sm text-slate-600">{job.location} • {job.applicants || 0} candidature{(job.applicants || 0) !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        job.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {job.is_active ? 'Active' : 'Fermée'}
                      </span>
                      <Link href={`/employer/jobs/${job.id}`}>
                        <Button size="sm" variant="outline">
                          Voir
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
