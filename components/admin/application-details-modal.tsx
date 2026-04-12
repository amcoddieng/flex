"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminModal } from "@/components/ui/admin-modal";
import { 
  Calendar, 
  User, 
  Building, 
  Mail, 
  Phone, 
  FileText, 
  MapPin, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  Users,
  GraduationCap,
  Briefcase,
  MessageSquare
} from "lucide-react";

type ApplicationDetails = {
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
  job_description?: string;
  job_location?: string;
  job_salary?: string;
  job_service_type?: string;
  company_name: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  student_university: string;
  student_department: string;
  student_year_of_study: number;
  student_bio?: string;
  student_skills?: any;
  student_hourly_rate?: number;
  employer_name: string;
};

interface ApplicationDetailsModalProps {
  application: ApplicationDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (applicationId: number, newStatus: string) => void;
}

export function ApplicationDetailsModal({ 
  application, 
  isOpen, 
  onClose, 
  onStatusUpdate 
}: ApplicationDetailsModalProps) {
  const [loading, setLoading] = useState(false);

  if (!application) return null;

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

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true);
    try {
      await onStatusUpdate(application.id, newStatus);
      onClose();
    } catch (error) {
      console.error('Error updating application status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal 
      open={isOpen} 
      onOpenChange={onClose}
      title={`Détails de la candidature #${application.id}`}
      description="Informations complètes sur la candidature et actions disponibles"
      maxWidth="6xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <Badge className={getStatusColor(application.status)}>
          <span className="flex items-center gap-1">
            {getStatusIcon(application.status)}
            {getStatusText(application.status)}
          </span>
        </Badge>
      </div>

        <div className="space-y-6">
          {/* Informations de l'offre d'emploi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Offre d'emploi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {application.job_title}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Entreprise:</span>
                      <span className="font-medium">{application.company_name}</span>
                    </div>
                    {application.job_location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Lieu:</span>
                        <span className="font-medium">{application.job_location}</span>
                      </div>
                    )}
                    {application.job_salary && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Salaire:</span>
                        <span className="font-medium">{application.job_salary}</span>
                      </div>
                    )}
                    {application.job_service_type && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className="font-medium">{application.job_service_type}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  {application.job_description && (
                    <div>
                      <span className="text-sm text-gray-600">Description:</span>
                      <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {application.job_description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations de l'étudiant */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Informations de l'étudiant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Nom complet:</span>
                    <p className="font-medium">{application.student_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="font-medium">{application.student_email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Téléphone:</span>
                    <span className="font-medium">{application.student_phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Université:</span>
                    <span className="font-medium">{application.student_university}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Département:</span>
                    <p className="font-medium">{application.student_department}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Niveau:</span>
                    <span className="font-medium">{application.student_year_of_study}ème année</span>
                  </div>
                  {application.student_hourly_rate && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Taux horaire:</span>
                      <span className="font-medium">{application.student_hourly_rate}€/h</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Candidaté le:</span>
                    <span className="font-medium">
                      {new Date(application.applied_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>

              {application.student_bio && (
                <div>
                  <span className="text-sm text-gray-600">Biographie:</span>
                  <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {application.student_bio}
                  </p>
                </div>
              )}

              {application.student_skills && (
                <div>
                  <span className="text-sm text-gray-600">Compétences:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {Array.isArray(application.student_skills) 
                      ? application.student_skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))
                      : Object.values(application.student_skills).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))
                    }
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Détails de la candidature */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Détails de la candidature
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {application.message && (
                <div>
                  <span className="text-sm text-gray-600">Message de motivation:</span>
                  <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {application.message}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {application.availability && (
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-xs text-blue-700 font-medium mb-1">Disponibilité</p>
                    <p className="text-sm text-blue-600">{application.availability}</p>
                  </div>
                )}
                {application.experience && (
                  <div className="p-3 bg-green-50 rounded">
                    <p className="text-xs text-green-700 font-medium mb-1">Expérience</p>
                    <p className="text-sm text-green-600">{application.experience}</p>
                  </div>
                )}
                {application.start_date && (
                  <div className="p-3 bg-purple-50 rounded">
                    <p className="text-xs text-purple-700 font-medium mb-1">Date de début souhaitée</p>
                    <p className="text-sm text-purple-600">{application.start_date}</p>
                  </div>
                )}
              </div>

              {application.interview_details && (
                <div className="p-3 bg-yellow-50 rounded">
                  <p className="text-xs text-yellow-700 font-medium mb-1">Détails d'entretien</p>
                  <p className="text-sm text-yellow-600">{application.interview_details}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {application.status === 'PENDING' && (
                  <>
                    <Button
                      onClick={() => handleStatusUpdate('ACCEPTED')}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accepter la candidature
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate('INTERVIEW')}
                      variant="outline"
                      disabled={loading}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Planifier un entretien
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate('REJECTED')}
                      variant="destructive"
                      disabled={loading}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter la candidature
                    </Button>
                  </>
                )}
                
                {application.status === 'INTERVIEW' && (
                  <>
                    <Button
                      onClick={() => handleStatusUpdate('ACCEPTED')}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accepter après entretien
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate('REJECTED')}
                      variant="destructive"
                      disabled={loading}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter après entretien
                    </Button>
                  </>
                )}

                {application.status === 'ACCEPTED' && (
                  <Button
                    onClick={() => handleStatusUpdate('REJECTED')}
                    variant="destructive"
                    disabled={loading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Annuler l'acceptation
                  </Button>
                )}

                {application.status === 'REJECTED' && (
                  <Button
                    onClick={() => handleStatusUpdate('PENDING')}
                    variant="outline"
                    disabled={loading}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                      Remettre en attente
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
    </AdminModal>
  );
}
