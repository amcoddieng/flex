"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Job = {
  id: number;
  title: string;
  location: string;
  is_active: boolean;
  blocked: boolean;
  posted_at: string;
  applicants?: number;
  description?: string;
};

export default function EmployerJobsPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    location: '',
    description: '',
  });
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  /**
   * Helper: Get the current valid token from localStorage
   * Returns null if token doesn't exist or is invalid
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

  /**
   * Initialize auth check on mount
   * Redirects to /login if token is invalid or missing
   */
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

  /**
   * Fetch jobs list from API
   * @param pageNum - Page number to fetch
   */
  const fetchJobs = async (pageNum: number) => {
    setLoading(true);
    setError(null);

    try {
      const token = getValidToken();
      if (!token) {
        router.push('/login');
        return;
      }

      // Build query URL with pagination and search
      let url = `/api/employer/jobs?page=${pageNum}&limit=${limit}`;
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      // Make request with Authorization header
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle non-2xx responses
      if (!res.ok) {
        let errorMsg = 'Erreur lors de la récupération des offres';
        
        try {
          const errorData = await res.json();
          if (errorData.error) {
            errorMsg = errorData.error;
          }
        } catch {
          // If response is not JSON, use status-based message
          if (res.status === 401 || res.status === 403) {
            errorMsg = 'Vous n\'êtes pas autorisé. Veuillez vous reconnecter.';
            router.push('/login');
            return;
          } else if (res.status === 500) {
            errorMsg = 'Erreur serveur. Veuillez réessayer.';
          }
        }

        throw new Error(errorMsg);
      }

      const data = await res.json();

      // Validate response structure
      if (!data.success) {
        throw new Error(data.error || 'Réponse invalide du serveur');
      }

      setJobs(data.data || []);
      setTotal(data.pagination?.total || 0);
      setPage(pageNum);
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('fetchJobs error:', message);
      setError(message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle search input change
   * Reset to page 1 and trigger fetch
   */
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  /**
   * Fetch jobs when dependencies change
   */
  useEffect(() => {
    if (isAuthed) {
      fetchJobs(1);
    }
  }, [searchQuery, isAuthed]);

  /**
   * Open detail modal for a job
   * Fetches full job details including applicants
   */
  const openDetailModal = async (jobId: number) => {
    setSelectedJob(null);
    setShowDetailModal(true);
    setDetailLoading(true);

    try {
      const token = getValidToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/employer/jobs/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let errorMsg = 'Erreur lors du chargement de l\'offre';

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

      if (data.success && data.data) {
        setSelectedJob(data.data);
      } else {
        throw new Error(data.error || 'Données invalides');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('openDetailModal error:', message);
      setSelectedJob(null);
    } finally {
      setDetailLoading(false);
    }
  };

  /**
   * Toggle job active status
   * Requires confirmation before updating
   */
  const toggleJobActive = async (jobId: number, activate: boolean) => {
    if (!confirm(`Confirmer ${activate ? 'l\'activation' : 'la désactivation'} de l'offre ?`)) {
      return;
    }

    try {
      const token = getValidToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/employer/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: activate }),
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

      // Refresh list and detail if modal is open
      await fetchJobs(page);
      if (selectedJob && showDetailModal) {
        await openDetailModal(jobId);
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('toggleJobActive error:', message);
      alert(`Erreur : ${message}`);
    }
  };

  if (!isAuthed) {
    return <div className="p-8">Vérification...</div>;
  }

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mes offres d'emploi</h1>
          <p className="text-slate-600 mt-2">Gérez vos offres et candidatures</p>
        </div>
        <Link href="/employer/jobs/new">
          <Button className="bg-blue-600 hover:bg-blue-700">+ Créer une offre</Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-slate-400" />
          <h3 className="font-semibold text-slate-900">Recherche</h3>
        </div>
        <Input
          type="text"
          placeholder="Rechercher par titre ou localisation..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full"
        />
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <p className="text-sm text-slate-600">Total: {total} offres</p>
          <Button onClick={() => fetchJobs(page)} disabled={loading}>
            {loading ? 'Rafraîchir...' : 'Rafraîchir'}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-slate-900">Titre</th>
                <th className="text-left p-4 font-semibold text-slate-900">Localisation</th>
                <th className="text-left p-4 font-semibold text-slate-900">Candidatures</th>
                <th className="text-left p-4 font-semibold text-slate-900">Statut</th>
                <th className="text-right p-4 font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{job.title}</td>
                  <td className="p-4 text-slate-600">{job.location}</td>
                  <td className="p-4 text-slate-600">{job.applicants || 0}</td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        job.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {job.is_active ? 'Active' : 'Fermée'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        size="sm"
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => openDetailModal(job.id)}
                      >
                        Détails
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleJobActive(job.id, !job.is_active)}
                      >
                        {job.is_active ? 'Désactiver' : 'Activer'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {jobs.length === 0 && !loading && (
          <div className="p-8 text-center">
            <p className="text-slate-600">Aucune offre trouvée</p>
            <Link href="/employer/jobs/new">
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                Créer votre première offre
              </Button>
            </Link>
          </div>
        )}

        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Page {page} sur {pages}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page === 1} onClick={() => fetchJobs(page - 1)}>
              Précédent
            </Button>
            <Button
              variant="outline"
              disabled={page === pages || pages === 0}
              onClick={() => fetchJobs(page + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Détails de l'offre</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedJob(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {detailLoading ? (
              <p className="text-slate-600">Chargement...</p>
            ) : !selectedJob ? (
              <p className="text-slate-600">Aucune donnée</p>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {selectedJob.title}
                  </h3>
                  <div className="text-sm text-slate-600">{selectedJob.location}</div>
                  {selectedJob.description && (
                    <div className="mt-4 text-slate-800">{selectedJob.description}</div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedJob(null);
                    }}
                    className="flex-1"
                  >
                    Fermer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      selectedJob && toggleJobActive(selectedJob.id, !selectedJob.is_active);
                    }}
                    className="flex-1"
                  >
                    {selectedJob.is_active ? 'Désactiver' : 'Activer'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
