"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  FileText, 
  Calendar, 
  Building,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  User,
  Mail,
  Phone,
  X
} from "lucide-react";
import Link from "next/link";

interface Application {
  id: number;
  job_id: number;
  student_id: number;
  status: 'PENDING' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';
  applied_at: string;
  cover_letter?: string;
  interview_date?: string;
  interview_time?: string;
  interview_location?: string;
  updated_at?: string;
  job: {
    id: number;
    title: string;
    description: string;
    location: string;
    job_type: string;
    salary?: string;
    created_at: string;
    employer: {
      company_name: string;
      contact_person: string;
      email: string;
      phone: string;
    }
  };
}

export default function StudentApplicationsPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  const getValidToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = decodeToken(token);
    if (!decoded || decoded.role !== 'STUDENT') {
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
    fetchApplications();
  }, [router]);

  useEffect(() => {
    let filtered = applications;

    if (selectedStatus !== "all") {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }

    setFilteredApplications(filtered);
  }, [applications, selectedStatus]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getValidToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/student/applications', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error('Erreur lors de la récupération des candidatures');
      }

      const data = await res.json();
      if (data.success) {
        setApplications(data.data);
      } else {
        throw new Error(data.error || 'Réponse invalide');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('fetchApplications error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const withdrawApplication = async (applicationId: number) => {
    setWithdrawingId(applicationId);
    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch(`/api/student/applications/${applicationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Erreur lors du retrait de la candidature');
      }

      const data = await res.json();
      if (data.success) {
        setApplications(prev => prev.filter(app => app.id !== applicationId));
        setSelectedApplication(null);
      } else {
        throw new Error(data.error || 'Échec du retrait');
      }
    } catch (err: any) {
      console.error('withdrawApplication error:', err);
      alert(err.message || 'Erreur lors du retrait de la candidature');
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return {
          label: 'Acceptée',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          icon: CheckCircle
        };
      case 'INTERVIEW':
        return {
          label: 'Entretien',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
          icon: Clock
        };
      case 'REJECTED':
        return {
          label: 'Refusée',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          icon: XCircle
        };
      case 'PENDING':
      default:
        return {
          label: 'En attente',
          color: 'text-amber-600',
          bgColor: 'bg-amber-100',
          borderColor: 'border-amber-200',
          icon: AlertCircle
        };
    }
  };

  const statusFilters = [
    { value: "all", label: "Toutes les candidatures" },
    { value: "PENDING", label: "En attente" },
    { value: "INTERVIEW", label: "Entretien" },
    { value: "ACCEPTED", label: "Acceptées" },
    { value: "REJECTED", label: "Refusées" },
  ];

  if (!isAuthed) {
    return <div className="p-8">Vérification...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes candidatures</h1>
          <p className="text-slate-600">Suivez l'état de vos candidatures</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/student/jobs">
            <Button variant="outline" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Nouvelle candidature
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Filters */}
      <div className="bg-white rounded-xl border border-slate-200/50 p-4 shadow-sm">
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={selectedStatus === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus(filter.value)}
              className={selectedStatus === filter.value ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-600">Chargement des candidatures...</p>
          </div>
        </div>
      ) : filteredApplications.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredApplications.map((application) => {
            const statusConfig = getStatusConfig(application.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div key={application.id} className="group bg-white rounded-xl border border-slate-200/50 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                      {application.job?.title || 'Poste non spécifié'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Building className="h-4 w-4" />
                      <span>{application.job?.employer?.company_name || 'Entreprise non spécifiée'}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} border flex items-center gap-1`}>
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig.label}
                  </div>
                </div>

                {/* Job Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4" />
                    <span>{application.job?.location || 'Localisation non spécifiée'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Briefcase className="h-4 w-4" />
                    <span className="capitalize">{application.job?.job_type || 'Type non spécifié'}</span>
                  </div>
                  {application.job?.salary && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <DollarSign className="h-4 w-4" />
                      <span>{application.job.salary}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>Postulé le {new Date(application.applied_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="h-4 w-4" />
                    <span>Contact: {application.job?.employer?.contact_person || 'Non spécifié'}</span>
                  </div>
                </div>

                {/* Cover Letter Preview */}
                {application.cover_letter && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {application.cover_letter}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedApplication(application)}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Voir détails
                  </Button>
                  {application.status === 'PENDING' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => withdrawApplication(application.id)}
                      disabled={withdrawingId === application.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {withdrawingId === application.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {selectedStatus !== "all" ? "Aucune candidature trouvée" : "Aucune candidature"}
          </h3>
          <p className="text-slate-600 mb-6">
            {selectedStatus !== "all" 
              ? "Essayez de changer le filtre de statut" 
              : "Commencez par postuler aux offres qui vous intéressent"
            }
          </p>
          {selectedStatus !== "all" && (
            <Button 
              onClick={() => setSelectedStatus("all")}
              variant="outline"
            >
              Voir toutes les candidatures
            </Button>
          )}
          {selectedStatus === "all" && (
            <Link href="/student/jobs">
              <Button className="gap-2">
                <Briefcase className="h-4 w-4" />
                Explorer les offres
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-start justify-between">
              <div>
                <h2 className="font-bold text-slate-800 text-lg">{selectedApplication.job?.title || 'Poste non spécifié'}</h2>
                <p className="text-sm text-slate-500">{selectedApplication.job?.employer?.company_name || 'Entreprise non spécifiée'}</p>
              </div>
              <div className="flex items-center gap-3">
                {(() => {
                  const statusConfig = getStatusConfig(selectedApplication.status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} border flex items-center gap-1`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig.label}
                    </div>
                  );
                })()}
                <button onClick={() => setSelectedApplication(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Type de contrat", value: selectedApplication.job?.job_type || "Non spécifié", icon: Briefcase },
                  { label: "Localisation", value: selectedApplication.job?.location || "Non spécifiée", icon: MapPin },
                  { label: "Salaire", value: selectedApplication.job?.salary || "Non spécifié", icon: DollarSign },
                  { label: "Date de candidature", value: new Date(selectedApplication.applied_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }), icon: Calendar },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-3.5 w-3.5 text-slate-400" />
                      <p className="text-xs text-slate-400">{label}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">{value}</p>
                  </div>
                ))}
              </div>

              {/* Status Change Information */}
              {(selectedApplication.updated_at || selectedApplication.interview_date) && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Informations sur le statut
                  </h4>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    {selectedApplication.updated_at && (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>
                          Dernière mise à jour: {new Date(selectedApplication.updated_at).toLocaleDateString('fr-FR', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                    
                    {selectedApplication.status === 'INTERVIEW' && selectedApplication.interview_date && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-900">Entretien planifié</span>
                        </div>
                        <div className="space-y-1 text-sm text-blue-800">
                          {selectedApplication.interview_date && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              <span>Date: {new Date(selectedApplication.interview_date).toLocaleDateString('fr-FR', { 
                                weekday: 'long',
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric'
                              })}</span>
                            </div>
                          )}
                          {selectedApplication.interview_time && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              <span>Heure: {selectedApplication.interview_time}</span>
                            </div>
                          )}
                          {selectedApplication.interview_location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              <span>Lieu: {selectedApplication.interview_location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {selectedApplication.status === 'ACCEPTED' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-900">Candidature acceptée !</span>
                        </div>
                        <p className="text-sm text-green-800 mt-1">
                          Félicitations ! Votre candidature a été acceptée par l'employeur.
                        </p>
                      </div>
                    )}
                    
                    {selectedApplication.status === 'REJECTED' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="font-medium text-red-900">Candidature refusée</span>
                        </div>
                        <p className="text-sm text-red-800 mt-1">
                          Cette candidature n'a pas été retenue. Continuez vos recherches !
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedApplication.cover_letter && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Lettre de motivation</h4>
                  <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {selectedApplication.cover_letter}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {selectedApplication.job?.employer && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Informations de contact</h4>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    {selectedApplication.job.employer.contact_person && (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <User className="h-4 w-4 text-slate-400" />
                        <span>{selectedApplication.job.employer.contact_person}</span>
                      </div>
                    )}
                    {selectedApplication.job.employer.email && (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span>{selectedApplication.job.employer.email}</span>
                      </div>
                    )}
                    {selectedApplication.job.employer.phone && (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{selectedApplication.job.employer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Job Description */}
              {selectedApplication.job?.description && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Description du poste</h4>
                  <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed">
                    {selectedApplication.job.description}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setSelectedApplication(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
                  Fermer
                </button>
                {selectedApplication.status === 'PENDING' && (
                  <button
                    onClick={() => withdrawApplication(selectedApplication.id)}
                    disabled={withdrawingId === selectedApplication.id}
                    className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {withdrawingId === selectedApplication.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    Retirer la candidature
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
