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
  MessageSquare,
  RotateCcw
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
      case 'ACCEPTED': return 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800 border-2 border-emerald-300';
      case 'REJECTED': return 'bg-gradient-to-br from-red-100 to-red-200 text-red-800 border-2 border-red-300';
      case 'INTERVIEW': return 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 border-2 border-blue-300';
      case 'PENDING': return 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 border-2 border-amber-300';
      default: return 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 border-2 border-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return <CheckCircle className="h-5 w-5 animate-pulse" />;
      case 'REJECTED': return <XCircle className="h-5 w-5 animate-pulse" />;
      case 'INTERVIEW': return <Clock className="h-5 w-5 animate-pulse" />;
      case 'PENDING': return <Clock className="h-5 w-5 animate-pulse" />;
      default: return <Clock className="h-5 w-5 animate-pulse" />;
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
      <div className="flex items-center gap-4 mb-8 animate-fade-in">
        <Badge className={`${getStatusColor(application.status)} px-4 py-2 text-sm font-bold shadow-lg badge-entrance`}>
          <span className="flex items-center gap-2">
            {getStatusIcon(application.status)}
            {getStatusText(application.status)}
          </span>
        </Badge>
      </div>

        <div className="space-y-8">
          {/* Informations de l'offre d'emploi */}
          <Card className="rounded-3xl border-2 border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 card-hover card-entrance">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50">
              <CardTitle className="flex items-center gap-4 text-xl font-bold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center animate-glow">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                Offre d'emploi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold text-xl text-slate-900 mb-3 animate-fade-in">
                    {application.job_title}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl animate-scale-in" style={{animationDelay: "0.1s"}}>
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                        <Building className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-medium">Entreprise</span>
                        <p className="font-semibold text-slate-800">{application.company_name}</p>
                      </div>
                    </div>
                    {application.job_location && (
                      <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl animate-scale-in" style={{animationDelay: "0.2s"}}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 font-medium">Lieu</span>
                          <p className="font-semibold text-slate-800">{application.job_location}</p>
                        </div>
                      </div>
                    )}
                    {application.job_salary && (
                      <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2.5 rounded-xl animate-scale-in" style={{animationDelay: "0.3s"}}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-200 to-emerald-300 flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 font-medium">Salaire</span>
                          <p className="font-semibold text-emerald-700">{application.job_salary}</p>
                        </div>
                      </div>
                    )}
                    {application.job_service_type && (
                      <div className="flex items-center gap-3 bg-violet-50 px-4 py-2.5 rounded-xl animate-scale-in" style={{animationDelay: "0.4s"}}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-200 to-violet-300 flex items-center justify-center">
                          <Briefcase className="h-4 w-4 text-violet-600" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 font-medium">Type</span>
                          <p className="font-semibold text-violet-700">{application.job_service_type}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  {application.job_description && (
                    <div>
                      <div className="animate-scale-in" style={{animationDelay: "0.5s"}}>
                        <span className="text-sm text-slate-500 font-medium">Description</span>
                        <div className="mt-2 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200/30">
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {application.job_description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations de l'étudiant */}
          <Card className="rounded-3xl border-2 border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 card-hover card-entrance" style={{animationDelay: "0.1s"}}>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200/50">
              <CardTitle className="flex items-center gap-4 text-xl font-bold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center animate-glow">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                Informations de l'étudiant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="animate-scale-in" style={{animationDelay: "0.2s"}}>
                    <span className="text-sm text-slate-500 font-medium">Nom complet</span>
                    <p className="font-bold text-lg text-slate-900">{application.student_name}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl animate-scale-in" style={{animationDelay: "0.3s"}}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-200 to-red-300 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium">Email</span>
                      <p className="font-semibold text-slate-800 text-sm">{application.student_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl animate-scale-in" style={{animationDelay: "0.4s"}}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-200 to-green-300 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium">Téléphone</span>
                      <p className="font-semibold text-slate-800 text-sm">{application.student_phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl animate-scale-in" style={{animationDelay: "0.5s"}}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center">
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium">Université</span>
                      <p className="font-semibold text-slate-800 text-sm">{application.student_university}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="animate-scale-in" style={{animationDelay: "0.6s"}}>
                    <span className="text-sm text-slate-500 font-medium">Département</span>
                    <p className="font-bold text-slate-900">{application.student_department}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl animate-scale-in" style={{animationDelay: "0.7s"}}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-200 to-purple-300 flex items-center justify-center">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium">Niveau</span>
                      <p className="font-semibold text-slate-800 text-sm">{application.student_year_of_study}ème année</p>
                    </div>
                  </div>
                  {application.student_hourly_rate && (
                    <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2.5 rounded-xl animate-scale-in" style={{animationDelay: "0.8s"}}>
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-200 to-emerald-300 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-medium">Taux horaire</span>
                        <p className="font-semibold text-emerald-700 text-sm">{application.student_hourly_rate}€/h</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl animate-scale-in" style={{animationDelay: "0.9s"}}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-200 to-amber-300 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium">Candidaté le</span>
                      <p className="font-semibold text-slate-800 text-sm">
                        {new Date(application.applied_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {application.student_bio && (
                <div className="animate-scale-in" style={{animationDelay: "1.0s"}}>
                  <span className="text-sm text-slate-500 font-medium">Biographie</span>
                  <div className="mt-2 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200/30">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {application.student_bio}
                    </p>
                  </div>
                </div>
              )}

              {application.student_skills && (
                <div className="animate-scale-in" style={{animationDelay: "1.1s"}}>
                  <span className="text-sm text-slate-500 font-medium">Compétences</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Array.isArray(application.student_skills) 
                      ? application.student_skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200 text-violet-700 px-3 py-1 rounded-xl badge-entrance" style={{animationDelay: `${1.2 + index * 0.05}s`}}>
                            {skill}
                          </Badge>
                        ))
                      : Object.values(application.student_skills).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200 text-violet-700 px-3 py-1 rounded-xl badge-entrance" style={{animationDelay: `${1.2 + index * 0.05}s`}}>
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
          <Card className="rounded-3xl border-2 border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 card-hover card-entrance" style={{animationDelay: "0.2s"}}>
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200/50">
              <CardTitle className="flex items-center gap-4 text-xl font-bold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center animate-glow">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                Détails de la candidature
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {application.message && (
                <div className="animate-scale-in" style={{animationDelay: "0.3s"}}>
                  <span className="text-sm text-slate-500 font-medium">Message de motivation</span>
                  <div className="mt-2 p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200/30">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {application.message}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {application.availability && (
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200/30 animate-scale-in" style={{animationDelay: "0.4s"}}>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <p className="text-xs text-blue-700 font-bold">Disponibilité</p>
                    </div>
                    <p className="text-sm text-blue-600 font-medium">{application.availability}</p>
                  </div>
                )}
                {application.experience && (
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200/30 animate-scale-in" style={{animationDelay: "0.5s"}}>
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-4 w-4 text-green-600" />
                      <p className="text-xs text-green-700 font-bold">Expérience</p>
                    </div>
                    <p className="text-sm text-green-600 font-medium">{application.experience}</p>
                  </div>
                )}
                {application.start_date && (
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200/30 animate-scale-in" style={{animationDelay: "0.6s"}}>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <p className="text-xs text-purple-700 font-bold">Date de début souhaitée</p>
                    </div>
                    <p className="text-sm text-purple-600 font-medium">{application.start_date}</p>
                  </div>
                )}
              </div>

              {application.interview_details && (
                <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl border border-amber-200/30 animate-scale-in" style={{animationDelay: "0.7s"}}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <p className="text-xs text-amber-700 font-bold">Détails d'entretien</p>
                  </div>
                  <p className="text-sm text-amber-600 font-medium">{application.interview_details}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="rounded-3xl border-2 border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 card-hover card-entrance" style={{animationDelay: "0.3s"}}>
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50">
              <CardTitle className="flex items-center gap-4 text-xl font-bold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center animate-glow">
                  <Users className="h-5 w-5 text-white" />
                </div>
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {application.status === 'PENDING' && (
                  <>
                    <Button
                      onClick={() => handleStatusUpdate('ACCEPTED')}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-6 py-3 rounded-2xl shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30 transition-all duration-300 hover:-translate-y-1 btn-hover-lift"
                      disabled={loading}
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Accepter la candidature
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate('INTERVIEW')}
                      variant="outline"
                      className="px-6 py-3 rounded-2xl border-2 border-blue-300 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300 hover:-translate-y-1 btn-hover-lift"
                      disabled={loading}
                    >
                      <Clock className="h-5 w-5 mr-2" />
                      Planifier un entretien
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate('REJECTED')}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-6 py-3 rounded-2xl shadow-lg shadow-red-600/25 hover:shadow-xl hover:shadow-red-600/30 transition-all duration-300 hover:-translate-y-1 btn-hover-lift"
                      disabled={loading}
                    >
                      <XCircle className="h-5 w-5 mr-2" />
                      Rejeter la candidature
                    </Button>
                  </>
                )}
                
                {application.status === 'INTERVIEW' && (
                  <>
                    <Button
                      onClick={() => handleStatusUpdate('ACCEPTED')}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-6 py-3 rounded-2xl shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30 transition-all duration-300 hover:-translate-y-1 btn-hover-lift"
                      disabled={loading}
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Accepter après entretien
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate('REJECTED')}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-6 py-3 rounded-2xl shadow-lg shadow-red-600/25 hover:shadow-xl hover:shadow-red-600/30 transition-all duration-300 hover:-translate-y-1 btn-hover-lift"
                      disabled={loading}
                    >
                      <XCircle className="h-5 w-5 mr-2" />
                      Rejeter après entretien
                    </Button>
                  </>
                )}

                {application.status === 'ACCEPTED' && (
                  <Button
                    onClick={() => handleStatusUpdate('REJECTED')}
                    className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 px-6 py-3 rounded-2xl shadow-lg shadow-amber-600/25 hover:shadow-xl hover:shadow-amber-600/30 transition-all duration-300 hover:-translate-y-1 btn-hover-lift"
                    disabled={loading}
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Annuler l'acceptation
                  </Button>
                )}

                {application.status === 'REJECTED' && (
                  <Button
                    onClick={() => handleStatusUpdate('PENDING')}
                    className="px-6 py-3 rounded-2xl border-2 border-amber-300 hover:bg-amber-50 hover:border-amber-400 transition-all duration-300 hover:-translate-y-1 btn-hover-lift"
                    disabled={loading}
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Réexaminer
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
    </AdminModal>
  );
}
