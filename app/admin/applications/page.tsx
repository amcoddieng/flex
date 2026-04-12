"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminLayout } from "@/components/admin-layout";
import { ApplicationDetailsModal } from "@/components/admin/application-details-modal";
import { Search, Filter, Calendar, User, Building, Mail, Phone, FileText, Eye, CheckCircle, XCircle, Clock } from "lucide-react";

type Application = {
  id: number;
  job_id: number;
  student_id: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'INTERVIEW';
  message: string;
  applied_at: string;
  availability?: string;
  experience?: string;
  start_date?: string;
  interview_details?: string;
  job_title: string;
  company_name: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  student_university: string;
  student_department: string;
  student_year_of_study: number;
  employer_name: string;
};

type Filters = {
  search: string;
  status: string;
  company: string;
  university: string;
  date_range: string;
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: '',
    company: '',
    university: '',
    date_range: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchApplications();
  }, [filters, pagination.page]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Convertir les filtres "all" en chaînes vides pour l'API
      const apiFilters = {
        ...filters,
        search: filters.search || '',
        status: filters.status === 'all' ? '' : filters.status,
        company: filters.company === 'all' ? '' : filters.company,
        university: filters.university === 'all' ? '' : filters.university,
        date_range: filters.date_range === 'all' ? '' : filters.date_range
      };

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(apiFilters).filter(([_, value]) => value !== '')
        )
      });

      const response = await fetch(`/api/admin/applications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.data || []);
        setPagination(prev => ({
          ...prev,
          total: data.total || 0,
          totalPages: data.totalPages || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'INTERVIEW': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      case 'INTERVIEW': return <Clock className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'Accepté';
      case 'REJECTED': return 'Rejeté';
      case 'INTERVIEW': return 'Entretien';
      case 'PENDING': return 'En attente';
      default: return status;
    }
  };

  const handleStatusUpdate = async (applicationId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchApplications();
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedApplication(null);
    setIsModalOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Candidatures</h1>
            <p className="text-gray-600 mt-1">
              Gérez toutes les candidatures des étudiants aux offres d'emploi
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="h-4 w-4" />
            <span>{pagination.total} candidatures trouvées</span>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres et recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="ACCEPTED">Acceptées</SelectItem>
                  <SelectItem value="REJECTED">Rejetées</SelectItem>
                  <SelectItem value="INTERVIEW">Entretien</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.company} onValueChange={(value) => handleFilterChange('company', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Entreprise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les entreprises</SelectItem>
                  {/* Dynamiquement remplir avec les entreprises disponibles */}
                </SelectContent>
              </Select>

              <Select value={filters.university} onValueChange={(value) => handleFilterChange('university', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Université" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les universités</SelectItem>
                  {/* Dynamiquement remplir avec les universités disponibles */}
                </SelectContent>
              </Select>

              <Select value={filters.date_range} onValueChange={(value) => handleFilterChange('date_range', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les périodes</SelectItem>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des candidatures</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune candidature trouvée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <div key={application.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.job_title}
                          </h3>
                          <Badge className={getStatusColor(application.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(application.status)}
                              {getStatusText(application.status)}
                            </span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">Entreprise:</span>
                              <span className="font-medium">{application.company_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">Étudiant:</span>
                              <span className="font-medium">{application.student_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">Email:</span>
                              <span className="font-medium">{application.student_email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">Téléphone:</span>
                              <span className="font-medium">{application.student_phone}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">Université:</span>
                              <span className="font-medium">{application.student_university}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">Département:</span>
                              <span className="font-medium">{application.student_department}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">Candidaté le:</span>
                              <span className="font-medium">
                                {new Date(application.applied_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">Niveau:</span>
                              <span className="font-medium">{application.student_year_of_study}ème année</span>
                            </div>
                          </div>
                        </div>

                        {application.message && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Message:</span> {application.message}
                            </p>
                          </div>
                        )}

                        {(application.availability || application.experience || application.start_date) && (
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {application.availability && (
                              <div className="p-2 bg-blue-50 rounded">
                                <p className="text-xs text-blue-700 font-medium">Disponibilité</p>
                                <p className="text-sm text-blue-600">{application.availability}</p>
                              </div>
                            )}
                            {application.experience && (
                              <div className="p-2 bg-green-50 rounded">
                                <p className="text-xs text-green-700 font-medium">Expérience</p>
                                <p className="text-sm text-green-600">{application.experience}</p>
                              </div>
                            )}
                            {application.start_date && (
                              <div className="p-2 bg-purple-50 rounded">
                                <p className="text-xs text-purple-700 font-medium">Date de début</p>
                                <p className="text-sm text-purple-600">{application.start_date}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {application.interview_details && (
                          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-yellow-700">
                              <span className="font-medium">Détails entretien:</span> {application.interview_details}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {application.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(application.id, 'ACCEPTED')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accepter
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(application.id, 'INTERVIEW')}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Entretien
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatusUpdate(application.id, 'REJECTED')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeter
                            </Button>
                          </>
                        )}
                        
                        {application.status === 'INTERVIEW' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(application.id, 'ACCEPTED')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accepter
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatusUpdate(application.id, 'REJECTED')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeter
                            </Button>
                          </>
                        )}
                        
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(application)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Voir détails
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
            >
              Précédent
            </Button>
            
            <span className="text-sm text-gray-600">
              Page {pagination.page} sur {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>

      {/* Modal des détails de la candidature */}
      <ApplicationDetailsModal
        application={selectedApplication}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusUpdate={handleStatusUpdate}
      />
    </AdminLayout>
  );
}
