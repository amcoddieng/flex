"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApplicationDetailModalMinimal } from "@/components/application-detail-modal-minimal";
import { EmployerProtection } from "@/components/employer-protection";
import { Search, X, Briefcase, Calendar, AlertTriangle, RefreshCw } from "lucide-react";

type Application = {
  id: number;
  job_id: number;
  student_id: number;
  status: string;
  applied_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  job_title?: string;
};

export default function EmployerApplicationsPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [conversationLoading, setConversationLoading] = useState(false);
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  /**
   * Helper: Get the current valid token from localStorage
   */
  const getValidToken = (): string | null => {
      if (typeof window === 'undefined') return null;
      
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      // Decode to verify it's valid and has role EMPLOYER
      const decoded = decodeToken(token);
      if (!decoded || decoded.role !== 'EMPLOYER') {
        // Invalid token, clear it
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
  }, [router]);

  const fetchApplications = async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = getValidToken();
      if (!token) {
        router.push('/login');
        return;
      }

      let url = `/api/employer/applications?page=${pageNum}&limit=${limit}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (filterStatus) url += `&status=${encodeURIComponent(filterStatus)}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        let errorMsg = 'Erreur lors de la récupération des candidatures';
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
      if (!data.success) {
        throw new Error(data.error || 'Réponse invalide');
      }

      setApplications(data.data || []);
      setTotal(data.pagination?.total || 0);
      setPage(pageNum);
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('fetchApplications error:', message);
      setError(message);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setPage(1);
  };

  useEffect(() => {
    if (isAuthed) fetchApplications(1);
  }, [searchQuery, filterStatus, isAuthed]);

  const openDetailModal = async (appId: number) => {
    setSelectedApp(null);
    setShowDetailModal(true);
    setDetailLoading(true);
    try {
      const token = getValidToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/employer/applications/${appId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        let errorMsg = 'Erreur lors du chargement de la candidature';
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
        setSelectedApp(data.data);
      } else {
        throw new Error(data.error || 'Données invalides');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('openDetailModal error:', message);
      setSelectedApp(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const updateApplicationStatus = async (
    appId: number,
    newStatus: string,
    interview?: { date: string; time: string; location: string }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const token = getValidToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const payload: any = { status: newStatus };
      if (interview) {
        payload.interview_date = interview.date;
        payload.interview_time = interview.time;
        payload.interview_location = interview.location;
      }

      const res = await fetch(`/api/employer/applications/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorMsg = 'Erreur lors de la mise à jour';
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
      if (!data.success) {
        throw new Error(data.error || 'Erreur inconnue');
      }

      await fetchApplications(page);
      if (selectedApp) {
        await openDetailModal(appId);
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('updateApplicationStatus error:', message);
      alert(`Erreur : ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async (studentId: number, offerId: number) => {
    setConversationLoading(true);
    try {
      const token = getValidToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/employer/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ student_id: studentId, offer_id: offerId }),
      });
      
      if (!res.ok) throw new Error("Erreur lors de la création de la conversation");

      const data = await res.json();
      if (data.success) {
        // L'API retourne conversation_id, pas id
        const conversationId = data.data.conversation_id;
        console.log('📝 Conversation créée avec ID:', conversationId);
        console.log('📝 Réponse API complète:', data);
        
        if (conversationId) {
          // Rediriger immédiatement vers la page de messagerie
          router.push(`/employer/messages?conversation=${conversationId}`);
        } else {
          console.error('❌ ID de conversation manquant dans la réponse');
          alert('Erreur: ID de conversation non reçu');
        }
      } else {
        throw new Error(data.error || 'Erreur lors de la création');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('startConversation error:', message);
      alert(`Erreur : ${message}`);
    } finally {
      setConversationLoading(false);
    }
  };

  if (!isAuthed) {
    return <div className="p-8">Vérification...</div>;
  }

  const pages = Math.ceil(total / limit);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'INTERVIEW':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <EmployerProtection>
      <div className="min-h-screen">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs><pattern id="grid4" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/></pattern></defs>
              <rect width="100" height="100" fill="url(#grid4)"/>
            </svg>
          </div>
          <div className="relative px-6 py-6 sm:py-8">
            <div>
              <p className="text-slate-400 text-sm mb-1">Suivi des candidatures</p>
              <h1 className="text-2xl sm:text-3xl font-bold">Candidatures reçues</h1>
              <p className="text-slate-400 text-sm mt-1">Gérez les candidatures pour vos offres</p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6 space-y-6 max-w-7xl">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input type="text" placeholder="Rechercher par nom ou email..." value={searchQuery} onChange={handleSearch} className="pl-10 rounded-xl border-slate-200" />
            </div>
            <select value={filterStatus} onChange={handleStatusFilter} className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option value="">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="ACCEPTED">Acceptée</option>
              <option value="REJECTED">Refusée</option>
              <option value="INTERVIEW">Entretien</option>
            </select>
            <Button onClick={() => fetchApplications(page)} disabled={loading} variant="outline" className="gap-2 rounded-xl">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Rafraîchir</span>
            </Button>
          </div>

          {/* Applications List */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">{total} candidature{total !== 1 ? 's' : ''}</p>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden">
              {applications.map((app) => (
                <div key={app.id} className="border-b border-slate-100 p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-slate-900">{app.first_name} {app.last_name}</h4>
                      <p className="text-xs text-slate-500">{app.email}</p>
                    </div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ml-2 ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span className="truncate">{app.job_title}</span>
                  </div>
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-xs" onClick={() => openDetailModal(app.id)}>Voir les détails</Button>
                </div>
              ))}
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr>
                    <th className="text-left py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidat</th>
                    <th className="text-left py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Offre</th>
                    <th className="text-left py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                    <th className="text-right py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-5">
                        <p className="font-semibold text-sm text-slate-900">{app.first_name} {app.last_name}</p>
                        <p className="text-xs text-slate-500">{app.email}</p>
                      </td>
                      <td className="py-3 px-5 text-sm text-slate-500">{app.job_title}</td>
                      <td className="py-3 px-5 text-sm text-slate-500">{app.applied_at ? new Date(app.applied_at).toLocaleDateString('fr-FR') : '-'}</td>
                      <td className="py-3 px-5">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>{app.status}</span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-7 text-xs px-3" onClick={() => openDetailModal(app.id)}>Détails</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {applications.length === 0 && !loading && (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">Aucune candidature trouvée</p>
              </div>
            )}

            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-sm text-slate-500 text-center sm:text-left">Page {page} sur {pages}</div>
              <div className="flex gap-2 justify-center sm:justify-end">
                <Button variant="outline" disabled={page === 1 || loading} onClick={() => fetchApplications(page - 1)} className="flex-1 sm:flex-none rounded-xl text-xs">Précédent</Button>
                <Button variant="outline" disabled={page === pages || pages === 0 || loading} onClick={() => fetchApplications(page + 1)} className="flex-1 sm:flex-none rounded-xl text-xs">Suivant</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Modal */}
        <ApplicationDetailModalMinimal
          open={showDetailModal}
          loading={detailLoading}
          application={selectedApp}
          onClose={() => { setShowDetailModal(false); setSelectedApp(null); }}
          onUpdateStatus={updateApplicationStatus}
          onStartConversation={startConversation}
          conversationLoading={conversationLoading}
        />
      </div>
    </EmployerProtection>
  );
}
