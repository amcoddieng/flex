"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApplicationDetailModal } from "@/components/application-detail-modal";
import { Search, X } from "lucide-react";

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
      console.log("ssss", res);
      if (!res.ok) throw new Error("Erreur lors de la création de la conversation");

      const data = await res.json();
      if (data.success) {
        // Rediriger vers la page de messagerie
        router.push('/employer/messages');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('startConversation error:', message);
      alert(`Erreur : ${message}`);
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Candidatures reçues</h1>
        <p className="text-slate-600 mt-2">Gérez les candidatures pour vos offres</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-slate-400" />
          <h3 className="font-semibold text-slate-900">Filtres</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Rechercher (Nom, Email)
            </label>
            <Input
              type="text"
              placeholder="Entrez nom ou email..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filtrer par Statut
            </label>
            <select
              value={filterStatus}
              onChange={handleStatusFilter}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="ACCEPTED">Acceptée</option>
              <option value="REJECTED">Refusée</option>
              <option value="INTERVIEW">Entretien</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <p className="text-sm text-slate-600">Total: {total} candidatures</p>
          <Button onClick={() => fetchApplications(page)} disabled={loading}>
            {loading ? 'Rafraîchir...' : 'Rafraîchir'}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-slate-900">Candidat</th>
                <th className="text-left p-4 font-semibold text-slate-900">Offre</th>
                <th className="text-left p-4 font-semibold text-slate-900">Date</th>
                <th className="text-left p-4 font-semibold text-slate-900">Statut</th>
                <th className="text-right p-4 font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-slate-900">
                      {app.first_name} {app.last_name}
                    </div>
                    <div className="text-sm text-slate-600">{app.email}</div>
                  </td>
                  <td className="p-4 text-slate-600">{app.job_title}</td>
                  <td className="p-4 text-slate-600">
                    {app.applied_at
                      ? new Date(app.applied_at).toLocaleDateString('fr-FR')
                      : '-'}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      size="sm"
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => openDetailModal(app.id)}
                    >
                      Détails
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {applications.length === 0 && !loading && (
          <div className="p-8 text-center">
            <p className="text-slate-600">Aucune candidature trouvée</p>
          </div>
        )}

        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Page {page} sur {pages}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page === 1} onClick={() => fetchApplications(page - 1)}>
              Précédent
            </Button>
            <Button
              variant="outline"
              disabled={page === pages || pages === 0}
              onClick={() => fetchApplications(page + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <ApplicationDetailModal
        open={showDetailModal}
        loading={detailLoading}
        application={selectedApp}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedApp(null);
        }}
        onUpdateStatus={updateApplicationStatus}
        onStartConversation={startConversation}
      />
    </div>
  );
}
