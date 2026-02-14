"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

type Job = {
  id: number;
  title: string;
  location: string;
  is_active: boolean;
  blocked: boolean;
  posted_at: string;
  applicants?: number;
  description?: string;
  company?: string;
  service_type?: string;
  salary?: string;
  availability?: any;
  type_paiement?: string;
  requirements?: string;
  contact_email?: string;
  contact_phone?: string;
  updated_at?: string;
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
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    company: '',
    location: '',
    service_type: '',
    salary: '',
    requirements: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    availability: '',
    type_paiement: 'jour',
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
    setApplications([]);
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
        // API returns { job, applicants }
        setSelectedJob(data.data.job || data.data);
        setApplications(data.data.applicants || []);
      } else {
        throw new Error(data.error || 'Données invalides');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('openDetailModal error:', message);
      setSelectedJob(null);
      setApplications([]);
    } finally {
      setDetailLoading(false);
    }
  };

  /**
   * Create new job offer
   */
  const createJob = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createFormData.title.trim() || !createFormData.location.trim()) {
      alert('Veuillez remplir les champs obligatoires (titre et localisation)');
      return;
    }

    setCreateLoading(true);
    setError(null);

    try {
      const token = getValidToken();
      if (!token) {
        router.push('/login');
        return;
      }

      // Validate basic field lengths and formats
      if (createFormData.title.trim().length > 255) {
        setError('Le titre ne doit pas dépasser 255 caractères');
        setCreateLoading(false);
        return;
      }
      if (createFormData.company.trim().length > 255) {
        setError('Le nom de l\'entreprise ne doit pas dépasser 255 caractères');
        setCreateLoading(false);
        return;
      }
      if (createFormData.service_type.trim().length > 255) {
        setError('Le type de service est trop long');
        setCreateLoading(false);
        return;
      }
      if (createFormData.salary.trim().length > 100) {
        setError('Le champ salaire est trop long');
        setCreateLoading(false);
        return;
      }

      // contact email basic validation
      const email = createFormData.contact_email.trim();
      if (email) {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(email)) {
          setError('Email de contact invalide');
          setCreateLoading(false);
          return;
        }
      }

      // contact phone basic validation (digits, +, spaces, - , parentheses)
      const phone = createFormData.contact_phone.trim();
      if (phone) {
        const phoneRe = /^[0-9+()\-\s]{6,30}$/;
        if (!phoneRe.test(phone)) {
          setError('Téléphone de contact invalide');
          setCreateLoading(false);
          return;
        }
      }

      // Validate availability: must be one of allowed enum values or empty
      let parsedAvailability: string | null = null;
      const availRaw = createFormData.availability?.trim();
      if (availRaw && availRaw !== '') {
        const allowed = [
          'Temps plein',
          'Temps partiel',
          'Mi-temps',
          'Temps flexible',
          'Horaires flexibles',
        ];
        if (!allowed.includes(availRaw)) {
          setError('Disponibilité invalide');
          setCreateLoading(false);
          return;
        }
        parsedAvailability = availRaw;
      }

      const res = await fetch(editingJobId ? `/api/employer/jobs/${editingJobId}` : '/api/employer/jobs', {
        method: editingJobId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: createFormData.title.trim(),
          company: createFormData.company.trim(),
          location: createFormData.location.trim(),
          service_type: createFormData.service_type.trim(),
          salary: createFormData.salary.trim(),
          requirements: createFormData.requirements.trim(),
          description: createFormData.description.trim(),
          contact_email: createFormData.contact_email.trim(),
          contact_phone: createFormData.contact_phone.trim(),
          availability: parsedAvailability,
          type_paiement: createFormData.type_paiement,
        }),
      });

      if (!res.ok) {
        let errorMsg = 'Erreur lors de la création de l\'offre';
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

      // Reset form and close modal
      setCreateFormData({ 
        title: '', 
        company: '',
        location: '', 
        service_type: '',
        salary: '',
        requirements: '',
        description: '',
        contact_email: '',
        contact_phone: '',
        availability: '',
        type_paiement: 'jour',
      });
      setEditingJobId(null);
      setShowCreateModal(false);
      
      // Refresh jobs list
      await fetchJobs(1);
      
      alert(editingJobId ? 'Offre mise à jour avec succès !' : 'Offre créée avec succès !');
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('createJob error:', message);
      setError(message);
    } finally {
      setCreateLoading(false);
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

  /**
   * Delete job
   */
  const deleteJob = async (jobId: number) => {
    if (!confirm('Êtes-vous sûr ? Cette action est irréversible.')) {
      return;
    }

    try {
      const token = getValidToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/employer/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let errorMsg = 'Erreur lors de la suppression';

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

      setShowDetailModal(false);
      setSelectedJob(null);
      await fetchJobs(page);
      alert('Offre supprimée avec succès !');
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('deleteJob error:', message);
      alert(`Erreur : ${message}`);
    }
  };

  /**
   * Start editing a job (populate form with current values)
   */
  const startEditJob = (job: Job) => {
    setEditingJobId(job.id);
    setCreateFormData({
      title: job.title,
      company: job.company || '',
      location: job.location,
      service_type: job.service_type || '',
      salary: job.salary || '',
      requirements: job.requirements || '',
      description: job.description || '',
      contact_email: job.contact_email || '',
      contact_phone: job.contact_phone || '',
      availability: job.availability || '',
      type_paiement: job.type_paiement || 'jour',
    });
    setShowDetailModal(false);
    setShowCreateModal(true);
  };

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mes offres d'emploi</h1>
          <p className="text-slate-600 mt-2">Gérez vos offres et candidatures</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Créer une offre
        </Button>
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
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Créer votre première offre
            </Button>
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
                  <div className="mt-2 text-sm text-slate-600">Entreprise: {selectedJob.company || '-'}</div>
                  <div className="mt-2 text-sm text-slate-600">Type: {selectedJob.service_type || '-'}</div>
                  <div className="mt-2 text-sm text-slate-600">Salaire: {selectedJob.salary || '-'}</div>
                  <div className="mt-2 text-sm text-slate-600">Disponibilité: {selectedJob.availability || '-'}</div>
                  <div className="mt-2 text-sm text-slate-600">Mode de paiement: {selectedJob.type_paiement || '-'}</div>
                  {selectedJob.requirements && (
                    <div className="mt-4">
                      <div className="text-sm font-medium text-slate-700">Compétences requises:</div>
                      <div className="mt-1 text-slate-800 whitespace-pre-wrap">{selectedJob.requirements}</div>
                    </div>
                  )}
                  {selectedJob.description && (
                    <div className="mt-4">
                      <div className="text-sm font-medium text-slate-700">Description:</div>
                      <div className="mt-1 text-slate-800 whitespace-pre-wrap">{selectedJob.description}</div>
                    </div>
                  )}
                  <div className="mt-4 text-sm text-slate-600">Contact: {selectedJob.contact_email || '-'} {selectedJob.contact_phone ? `• ${selectedJob.contact_phone}` : ''}</div>
                  <div className="mt-2 text-sm text-slate-600">Posté le: {selectedJob.posted_at}</div>
                </div>

                {/* Applications Section */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Candidatures ({applications.length})</h4>
                  {applications.length === 0 ? (
                    <p className="text-sm text-slate-600">Aucune candidature pour cette offre.</p>
                  ) : (
                    <div className="space-y-3">
                      {applications.map((app: any) => (
                        <div key={app.id} className="border border-slate-200 rounded p-3 bg-slate-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-slate-900">
                                {app.first_name} {app.last_name}
                              </div>
                              <div className="text-sm text-slate-600">{app.user_email}</div>
                              <div className="text-xs text-slate-500 mt-1">
                                Postuée le: {new Date(app.applied_at).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                  app.status === 'ACCEPTED'
                                    ? 'bg-green-100 text-green-800'
                                    : app.status === 'REJECTED'
                                    ? 'bg-red-100 text-red-800'
                                    : app.status === 'INTERVIEW'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {app.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-6 border-t">
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
                  <Button
                    variant="outline"
                    onClick={() => selectedJob && startEditJob(selectedJob)}
                    className="flex-1"
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => selectedJob && deleteJob(selectedJob.id)}
                    className="flex-1 text-red-600 hover:bg-red-50"
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingJobId ? 'Modifier l\'offre' : 'Créer une nouvelle offre'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingJobId(null);
                  setCreateFormData({ 
                    title: '', 
                    company: '',
                    location: '', 
                    service_type: '',
                    salary: '',
                    requirements: '',
                    description: '',
                    contact_email: '',
                    contact_phone: '',
                    availability: '',
                    type_paiement: 'jour',
                  });
                  setError(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={createJob} className="space-y-6">
              {/* Row 1: Title & Company */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Titre de l'offre *
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Développeur React Senior"
                    value={createFormData.title}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, title: e.target.value })
                    }
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Nom de l'entreprise
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: TechCorp Inc"
                    value={createFormData.company}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, company: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {/* Row 2: Location & Service Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Localisation *
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Paris, France"
                    value={createFormData.location}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, location: e.target.value })
                    }
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Type de service
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Stage, CDI, Mission"
                    value={createFormData.service_type}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, service_type: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {/* Row 3: Salary & Availability */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Salaire
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: 2000-3000€/mois"
                    value={createFormData.salary}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, salary: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Disponibilité
                  </label>
                  <select
                    value={createFormData.availability}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, availability: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Sélectionner --</option>
                    <option value="Temps plein">Temps plein</option>
                    <option value="Temps partiel">Temps partiel</option>
                    <option value="Mi-temps">Mi-temps</option>
                    <option value="Temps flexible">Temps flexible</option>
                    <option value="Horaires flexibles">Horaires flexibles</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Choisissez la disponibilité.</p>
                </div>
              </div>

              {/* Row 3b: Type Paiement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Type de paiement</label>
                  <select
                    value={createFormData.type_paiement}
                    onChange={(e) => setCreateFormData({ ...createFormData, type_paiement: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  >
                    <option value="heure">heure</option>
                    <option value="jour">jour</option>
                    <option value="semaine">semaine</option>
                    <option value="mois">mois</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Contact Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Email de contact
                  </label>
                  <Input
                    type="email"
                    placeholder="contact@entreprise.fr"
                    value={createFormData.contact_email}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, contact_email: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Téléphone de contact
                  </label>
                  <Input
                    type="tel"
                    placeholder="+33 1 23 45 67 89"
                    value={createFormData.contact_phone}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, contact_phone: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Compétences requises
                </label>
                <textarea
                  placeholder="Listez les compétences requises pour le poste..."
                  value={createFormData.requirements}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, requirements: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Description complète
                </label>
                <textarea
                  placeholder="Décrivez l'offre, les responsabilités, l'environnement de travail..."
                  value={createFormData.description}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, description: e.target.value })
                  }
                  rows={6}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingJobId(null);
                    setCreateFormData({ 
                      title: '', 
                      company: '',
                      location: '', 
                      service_type: '',
                      salary: '',
                      requirements: '',
                      description: '',
                      contact_email: '',
                      contact_phone: '',
                      availability: '',
                      type_paiement: 'jour',
                    });
                    setError(null);
                  }}
                  className="flex-1"
                  disabled={createLoading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={createLoading}
                >
                  {createLoading ? (editingJobId ? 'Mise à jour...' : 'Création...') : (editingJobId ? 'Mettre à jour' : 'Créer l\'offre')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
