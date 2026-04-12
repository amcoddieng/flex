"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Briefcase, Building, MapPin, Calendar, Users, Eye, ToggleLeft, ToggleRight } from "lucide-react";
import { JobDetailsModal } from "@/components/admin/job-details-modal";

type Job = {
  id: number;
  employer_id: number;
  title: string;
  company: string;
  location: string;
  is_active: boolean;
  posted_at: string;
  applicants?: number;
};

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [isAuthed, setIsAuthed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    fetchJobs(token);
  }, [router]);

  const fetchJobs = async (token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `/api/admin/jobs?page=${page}&limit=${limit}`;
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      if (filterStatus) {
        url += `&status=${filterStatus}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la récupération des offres');
      }

      const data = await res.json();
      if (data.success) {
        setJobs(data.data || []);
        setTotal(data.pagination?.total || 0);
      } else {
        throw new Error(data.error || 'Données invalides');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('fetchJobs error:', message);
      setError(message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthed) {
      const token = getValidToken();
      if (token) {
        fetchJobs(token);
      }
    }
  }, [page, searchQuery, filterStatus, isAuthed]);

  const handleViewJob = (job: any) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
    setIsModalOpen(false);
  };

  const handleStatusChange = async (jobId: number, isActive: boolean) => {
    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch(`/api/employer/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: isActive }),
      });

      if (res.ok) {
        // Mettre à jour localement
        setJobs((prev: Job[]) => prev.map(job => 
          job.id === jobId ? { ...job, is_active: isActive } : job
        ));
        
        // Mettre à jour le job sélectionné si le modal est ouvert
        if (selectedJob && selectedJob.id === jobId) {
          setSelectedJob((prev: any) => prev ? { ...prev, is_active: isActive } : null);
        }
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('handleStatusChange error:', message);
      alert(`Erreur : ${message}`);
    }
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pages = Math.ceil(total / limit);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des Offres d'Emploi
          </h1>
          <p className="text-gray-600">
            Consultez et gérez toutes les offres d'emploi de la plateforme
          </p>
        </div>

        {/* Section Recherche et Filtres */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher par titre, entreprise, localisation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "" ? "default" : "outline"}
                  onClick={() => setFilterStatus("")}
                  size="sm"
                >
                  Toutes
                </Button>
                <Button
                  variant={filterStatus === "active" ? "default" : "outline"}
                  onClick={() => setFilterStatus("active")}
                  size="sm"
                >
                  Actives
                </Button>
                <Button
                  variant={filterStatus === "inactive" ? "default" : "outline"}
                  onClick={() => setFilterStatus("inactive")}
                  size="sm"
                >
                  Inactives
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Jobs List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des offres...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-8 text-center">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune offre trouvée
                </h3>
                <p className="text-gray-600">
                  {searchQuery || filterStatus
                    ? "Aucune offre ne correspond à vos critères de recherche."
                    : "Aucune offre n'est publiée sur la plateforme."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Offre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entreprise
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Localisation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {job.title}
                            </div>
                            {job.applicants !== undefined && (
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Users className="h-3 w-3" />
                                {job.applicants} candidat{job.applicants > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {job.company}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {job.location}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={
                              job.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {job.is_active ? (
                              <>
                                <ToggleRight className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="h-3 w-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(job.posted_at).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewJob(job)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Voir
                            </Button>
                            <Button
                              variant={job.is_active ? "outline" : "default"}
                              size="sm"
                              onClick={() => handleStatusChange(job.id, !job.is_active)}
                              className={job.is_active ? "text-red-600 hover:text-red-700" : ""}
                            >
                              {job.is_active ? (
                                <>
                                  <ToggleLeft className="h-3 w-3 mr-1" />
                                  Désactiver
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="h-3 w-3 mr-1" />
                                  Activer
                                </>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {jobs.length > 0 && pages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de {(page - 1) * limit + 1} à {Math.min(page * limit, total)} sur {total} offres
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {page} sur {pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === pages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Job Details Modal */}
      <JobDetailsModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusChange={handleStatusChange}
      />
    </AdminLayout>
  );
}
