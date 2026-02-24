'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  Building, 
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  AlertCircle,
  FileText
} from 'lucide-react';

interface Application {
  id: number;
  job_id: number;
  student_id: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  applied_at: string;
  cover_letter: string;
  job: {
    id: number;
    title: string;
    description: string;
    location: string;
    job_type: string;
    salary: string;
    created_at: string;
    employer: {
      company_name: string;
      contact_person: string;
      email: string;
      phone: string;
    };
  };
}

const statusConfig = {
  PENDING: {
    label: 'En attente',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock
  },
  ACCEPTED: {
    label: 'Acceptée',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle
  },
  REJECTED: {
    label: 'Refusée',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle
  }
};

export default function StudentApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const getValidToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        localStorage.removeItem('token');
        return null;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < now) {
        localStorage.removeItem('token');
        return null;
      }
      
      return token;
    } catch (error) {
      localStorage.removeItem('token');
      return null;
    }
  };

  const fetchApplications = async () => {
    const token = getValidToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/student/applications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des candidatures');
      }

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error: any) {
      console.error('Erreur fetch applications:', error);
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const withdrawApplication = async (applicationId: number) => {
    const token = getValidToken();
    if (!token) {
      router.push('/login');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir retirer cette candidature ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/student/applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du retrait de la candidature');
      }

      await fetchApplications();
      setShowDetails(false);
      setSelectedApplication(null);
    } catch (error: any) {
      console.error('Erreur withdraw application:', error);
      setError(error.message || 'Une erreur est survenue');
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos candidatures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Candidatures</h1>
          <p className="text-gray-600">Suivez l'état de vos candidatures et gérez vos postulations</p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune candidature</h3>
              <p className="text-gray-600 mb-6">Vous n'avez pas encore postulé à des offres d'emploi</p>
              <Button onClick={() => router.push('/jobs')} className="bg-blue-600 hover:bg-blue-700">
                Parcourir les offres
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {applications.map((application) => {
              const StatusIcon = statusConfig[application.status].icon;
              return (
                <Card key={application.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{application.job.title}</CardTitle>
                      <Badge className={statusConfig[application.status].color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[application.status].label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="h-4 w-4 mr-2" />
                        <span className="truncate">{application.job.employer.company_name}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{application.job.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="h-4 w-4 mr-2" />
                        <span>{application.job.job_type}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Postulé le {new Date(application.applied_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowDetails(true);
                          }}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Détails
                        </Button>
                        {application.status === 'PENDING' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => withdrawApplication(application.id)}
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal Détails */}
        {showDetails && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedApplication.job.title}</CardTitle>
                    <p className="text-gray-600">{selectedApplication.job.employer.company_name}</p>
                  </div>
                  <Badge className={statusConfig[selectedApplication.status].color}>
                    {statusConfig[selectedApplication.status].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Description du poste</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {selectedApplication.job.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Type de contrat</h4>
                    <p className="text-gray-600">{selectedApplication.job.job_type}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Salaire</h4>
                    <p className="text-gray-600">{selectedApplication.job.salary || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Localisation</h4>
                    <p className="text-gray-600">{selectedApplication.job.location}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Date de candidature</h4>
                    <p className="text-gray-600">
                      {new Date(selectedApplication.applied_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Contact recruteur</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Contact:</span> {selectedApplication.job.employer.contact_person}</p>
                    <p><span className="font-medium">Email:</span> {selectedApplication.job.employer.email}</p>
                    <p><span className="font-medium">Téléphone:</span> {selectedApplication.job.employer.phone}</p>
                  </div>
                </div>

                {selectedApplication.cover_letter && (
                  <div>
                    <h4 className="font-medium mb-2">Lettre de motivation</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedApplication.cover_letter}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetails(false)}
                    className="flex-1"
                  >
                    Fermer
                  </Button>
                  {selectedApplication.status === 'PENDING' && (
                    <Button
                      variant="destructive"
                      onClick={() => withdrawApplication(selectedApplication.id)}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Retirer la candidature
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
