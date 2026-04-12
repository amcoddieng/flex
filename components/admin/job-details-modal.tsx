"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminModal } from "@/components/ui/admin-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  X, 
  Briefcase, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Download,
  MessageSquare,
  ToggleLeft,
  ToggleRight,
  Building
} from "lucide-react";

type Job = {
  id: number;
  employer_id: number;
  title: string;
  location: string;
  description: string;
  requirements: string;
  salary: string;
  is_active: boolean;
  posted_at: string;
  company_name: string;
  contact_email: string;
  contact_phone: string;
  applicants?: number;
};

type Application = {
  id: number;
  job_id: number;
  student_id: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'INTERVIEW';
  message: string;
  availability: string;
  experience: string;
  start_date: string;
  applied_at: string;
  interview_date?: string;
  interview_time?: string;
  interview_location?: string;
  student?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    university: string;
    department: string;
    year_of_study: number;
  };
};

type JobDetailsModalProps = {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (jobId: number, isActive: boolean) => void;
};

export function JobDetailsModal({ job, isOpen, onClose, onStatusChange }: JobDetailsModalProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    if (job && isOpen) {
      fetchApplications();
    }
  }, [job, isOpen]);

  const fetchApplications = async () => {
    if (!job) return;
    
    setLoadingApplications(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/admin/jobs/${job.id}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setApplications(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoadingApplications(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Accepté</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800"><X className="h-3 w-3 mr-1" />Rejeté</Badge>;
      case 'INTERVIEW':
        return <Badge className="bg-blue-100 text-blue-800"><MessageSquare className="h-3 w-3 mr-1" />Entretien</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
    }
  };

  if (!job || !isOpen) return null;

  return (
    <AdminModal 
      open={isOpen} 
      onOpenChange={onClose}
      title="Détails de l'offre d'emploi"
      description="Informations complètes sur l'offre d'emploi et les candidatures associées"
      maxWidth="7xl"
    >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Job Details - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Informations sur l'offre
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {job.company_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Exigences</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{job.requirements}</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-sm text-gray-500">Salaire</span>
                      <p className="font-medium text-gray-900">{job.salary || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Statut</span>
                      <div>
                        {job.is_active ? (
                          <Badge className="bg-green-100 text-green-800">
                            <ToggleRight className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            <ToggleLeft className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Postée le {new Date(job.posted_at).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {job.applicants || 0} candidat{(job.applicants || 0) > 1 ? 's' : ''}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Applications Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Candidatures ({applications.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingApplications ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Chargement des candidatures...</p>
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Aucune candidature
                      </h3>
                      <p className="text-gray-600">
                        Cette offre n'a pas encore reçu de candidatures.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((application) => (
                        <div key={application.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium text-gray-900">
                                  {application.student?.first_name} {application.student?.last_name}
                                </h4>
                                {getStatusBadge(application.status)}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Email:</span>
                                  <p className="text-gray-900">{application.student?.email}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Téléphone:</span>
                                  <p className="text-gray-900">{application.student?.phone || 'Non spécifié'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Université:</span>
                                  <p className="text-gray-900">{application.student?.university}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Département:</span>
                                  <p className="text-gray-900">{application.student?.department}</p>
                                </div>
                              </div>

                              {application.message && (
                                <div className="mt-3">
                                  <span className="text-gray-500 text-sm">Message:</span>
                                  <p className="text-gray-700 bg-gray-50 p-3 rounded mt-1">
                                    {application.message}
                                  </p>
                                </div>
                              )}

                              {application.interview_date && (
                                <div className="mt-3 p-3 bg-blue-50 rounded">
                                  <span className="text-blue-800 font-medium">Entretien prévu:</span>
                                  <p className="text-blue-700">
                                    {new Date(application.interview_date).toLocaleDateString('fr-FR')} 
                                    {application.interview_time && ` à ${application.interview_time}`}
                                    {application.interview_location && ` - ${application.interview_location}`}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedApplication(application)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Voir
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Entreprise
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Nom</span>
                    <p className="font-medium text-gray-900">{job.company_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email</span>
                    <p className="text-gray-900">{job.contact_email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Téléphone</span>
                    <p className="text-gray-900">{job.contact_phone || 'Non spécifié'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant={job.is_active ? "outline" : "default"}
                    className="w-full"
                    onClick={() => onStatusChange(job.id, !job.is_active)}
                  >
                    {job.is_active ? (
                      <>
                        <ToggleLeft className="h-4 w-4 mr-2" />
                        Désactiver l'offre
                      </>
                    ) : (
                      <>
                        <ToggleRight className="h-4 w-4 mr-2" />
                        Activer l'offre
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // TODO: Export applications
                      console.log('Export applications for job:', job.id);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exporter les candidatures
                  </Button>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total candidatures</span>
                    <span className="font-medium">{applications.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">En attente</span>
                    <span className="font-medium">
                      {applications.filter(a => a.status === 'PENDING').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Acceptées</span>
                    <span className="font-medium">
                      {applications.filter(a => a.status === 'ACCEPTED').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Entretiens</span>
                    <span className="font-medium">
                      {applications.filter(a => a.status === 'INTERVIEW').length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
    </AdminModal>
  );
}
