import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Calendar,
  MapPin,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  AlertTriangle,
  MessageCircle,
  User,
  Building,
  Award,
  FileText,
  Star,
} from "lucide-react";

type ApplicationDetailModalProps = {
  open: boolean;
  loading: boolean;
  application: any;
  onClose: () => void;
  onUpdateStatus: (
    appId: number,
    status: string,
    interview?: { date: string; time: string; location: string }
  ) => Promise<void>;
  onStartConversation?: (
    studentId: number,
    offerId: number
  ) => Promise<void>;
  conversationLoading?: boolean;
};

const statusConfig = {
  PENDING: { 
    color: "bg-amber-50 border-amber-200", 
    textColor: "text-amber-800", 
    icon: Clock, 
    label: "En attente",
    description: "Candidature en cours d'examen"
  },
  ACCEPTED: { 
    color: "bg-emerald-50 border-emerald-200", 
    textColor: "text-emerald-800", 
    icon: CheckCircle, 
    label: "Acceptée",
    description: "Candidature acceptée"
  },
  REJECTED: { 
    color: "bg-rose-50 border-rose-200", 
    textColor: "text-rose-800", 
    icon: XCircle, 
    label: "Rejetée",
    description: "Candidature rejetée"
  },
  INTERVIEW: { 
    color: "bg-blue-50 border-blue-200", 
    textColor: "text-blue-800", 
    icon: Briefcase, 
    label: "Entretien",
    description: "Entretien programmé"
  },
};

// Composant helper pour les items d'information
function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 card-hover form-input">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
        <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}

export function ApplicationDetailModal({
  open,
  loading,
  application,
  onClose,
  onUpdateStatus,
  onStartConversation,
  conversationLoading = false,
}: ApplicationDetailModalProps) {
  if (!application) return null;

  const student = application.student;
  const config = statusConfig[application.status as keyof typeof statusConfig] || statusConfig.PENDING;
  const StatusIcon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] overflow-hidden flex flex-col rounded-3xl modal-content">
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header avec statut */}
          <DialogHeader className="pb-6 border-b border-slate-200/50 flex-shrink-0 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-3xl font-bold text-slate-900 mb-3 truncate animate-fade-in">
                  {application.job_title}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 animate-slide-in">
                  <div className="flex items-center gap-2 flex-shrink-0 bg-white/50 px-4 py-2 rounded-2xl border border-slate-200/50">
                    <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="truncate font-medium">Candidature du {new Date(application.applied_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 bg-white/50 px-4 py-2 rounded-2xl border border-slate-200/50">
                    <User className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="truncate font-semibold">{student.first_name} {student.last_name}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3 flex-shrink-0 animate-scale-in">
                <Badge className={`${config.color} ${config.textColor} border-2 px-4 py-2 text-sm font-bold whitespace-nowrap shadow-lg badge-entrance`}>
                  <StatusIcon className="h-5 w-5 mr-2 flex-shrink-0 animate-pulse" />
                  {config.label}
                </Badge>
                <p className="text-xs text-slate-500 text-right animate-fade-in">{config.description}</p>
              </div>
            </div>
          </DialogHeader>

          {/* Content scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : (
              <>
                {/* Section Profil Candidat */}
                <section className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-200/50 overflow-hidden flex-shrink-0 shadow-lg hover:shadow-xl transition-all duration-300 card-hover card-entrance">
                  <div className="bg-gradient-to-r from-primary via-violet-600 to-indigo-600 px-6 py-4 flex-shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
                    <h3 className="text-xl font-bold text-white flex items-center gap-3 relative z-10">
                      <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-float">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <span className="truncate">Profil du Candidat</span>
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Informations principales */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 card-hover">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary to-violet-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 animate-glow">
                            {student.first_name?.charAt(0).toUpperCase()}{student.last_name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 truncate text-lg">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-sm text-slate-600 truncate">{student.email}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <InfoItem 
                            icon={GraduationCap} 
                            label="Année d'études" 
                            value={student.year_of_study ? `Année ${student.year_of_study}` : "Non spécifié"} 
                          />
                          <InfoItem 
                            icon={Building} 
                            label="Université" 
                            value={student.university || "Non spécifié"} 
                          />
                          <InfoItem 
                            icon={Award} 
                            label="Département" 
                            value={student.department || "Non spécifié"} 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg border border-gray-100 p-4">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span>Contact</span>
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-700 truncate">{student.email}</span>
                            </div>
                            {student.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="text-gray-700 truncate">{student.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {student.bio && (
                      <div className="bg-white rounded-lg border border-gray-100 p-4">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4 flex-shrink-0" />
                          <span>À propos</span>
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                          {student.bio}
                        </p>
                      </div>
                    )}

                    {/* Compétences */}
                    {student.skills && student.skills.length > 0 && (
                      <div className="bg-white rounded-lg border border-gray-100 p-4">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Star className="h-4 w-4 flex-shrink-0" />
                          <span>Compétences</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {student.skills.map((skill: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              <span className="truncate max-w-32">{skill}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Section Détails de la candidature */}
                <section className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl border border-emerald-200/50 overflow-hidden flex-shrink-0 shadow-lg hover:shadow-xl transition-all duration-300 card-hover card-entrance" style={{animationDelay: "0.1s"}}>
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex-shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
                    <h3 className="text-xl font-bold text-white flex items-center gap-3 relative z-10">
                      <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-float">
                        <Briefcase className="h-6 w-6 text-white" />
                      </div>
                      <span className="truncate">Détails de la Candidature</span>
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {application.message && (
                      <div className="bg-white rounded-2xl border border-slate-200/50 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 card-hover animate-scale-in" style={{animationDelay: "0.2s"}}>
                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-3 text-lg">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center">
                            <MessageSquare className="h-4 w-4 text-primary" />
                          </div>
                          <span>Message du candidat</span>
                        </h4>
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl border border-slate-200/30">
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                            {application.message}
                          </p>
                        </div>
                      </div>
                    )}

                    {application.experience && (
                      <div className="bg-white rounded-2xl border border-slate-200/50 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 card-hover animate-scale-in" style={{animationDelay: "0.3s"}}>
                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-3 text-lg">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/10 flex items-center justify-center">
                            <Award className="h-4 w-4 text-amber-600" />
                          </div>
                          <span>Expérience</span>
                        </h4>
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-2xl border border-amber-200/30">
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                            {application.experience}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {application.start_date && (
                        <div className="bg-white rounded-2xl border border-slate-200/50 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 card-hover animate-scale-in" style={{animationDelay: "0.4s"}}>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center animate-glow">
                              <Calendar className="h-5 w-5 text-white flex-shrink-0" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-900 truncate text-lg">Date de début souhaitée</p>
                              <p className="text-sm text-slate-600">
                                {new Date(application.start_date).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {application.availability && (
                        <div className="bg-white rounded-2xl border border-slate-200/50 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 card-hover animate-scale-in" style={{animationDelay: "0.5s"}}>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center animate-glow">
                              <Clock className="h-5 w-5 text-white flex-shrink-0" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-900 truncate text-lg">Disponibilité</p>
                              <p className="text-sm text-slate-600 break-words">{application.availability}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Section Entretien si programmé */}
                {application.status === "INTERVIEW" && (
                  <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-200/50 overflow-hidden flex-shrink-0 shadow-lg hover:shadow-xl transition-all duration-300 card-hover card-entrance" style={{animationDelay: "0.6s"}}>
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex-shrink-0 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
                      <h3 className="text-xl font-bold text-white flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-float">
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <span className="truncate">Entretien Programmé</span>
                      </h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {application.interview_date && (
                        <div className="flex items-center gap-3 bg-white rounded-lg p-4 border border-blue-100">
                          <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">Date et heure</p>
                            <p className="text-sm text-gray-600">
                              {new Date(application.interview_date).toLocaleDateString("fr-FR")}
                              {application.interview_time && ` à ${application.interview_time}`}
                            </p>
                          </div>
                        </div>
                      )}
                      {application.interview_location && (
                        <div className="flex items-center gap-3 bg-white rounded-lg p-4 border border-blue-100">
                          <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">Lieu</p>
                            <p className="text-sm text-gray-600 break-words">{application.interview_location}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>

          {/* Footer avec actions */}
          <div className="border-t border-slate-200/50 bg-gradient-to-r from-slate-50 to-white px-6 py-4 flex-shrink-0">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                {application.status === "PENDING" && (
                  <ActionButtonsPending
                    application={application}
                    onUpdateStatus={onUpdateStatus}
                  />
                )}
                {application.status === "ACCEPTED" && (
                  <ActionButtonsAccepted
                    application={application}
                    onUpdateStatus={onUpdateStatus}
                  />
                )}
                {application.status === "REJECTED" && (
                  <ActionButtonsRejected
                    application={application}
                    onUpdateStatus={onUpdateStatus}
                  />
                )}
                {application.status === "INTERVIEW" && (
                  <ActionButtonsInterview
                    application={application}
                    onUpdateStatus={onUpdateStatus}
                  />
                )}
              </div>
              
              {onStartConversation && (
                <Button
                  onClick={() => onStartConversation(application.student_id, application.job_id)}
                  variant="outline"
                  className="gap-3 w-full lg:w-auto flex-shrink-0 px-6 py-3 rounded-2xl border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 hover:-translate-y-1 btn-hover-lift"
                  disabled={conversationLoading}
                >
                  {conversationLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Ouverture...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-5 w-5 flex-shrink-0" />
                      <span>Contacter</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Composant pour les candidatures acceptées - permet d'annuler l'acceptation
function ActionButtonsAccepted({
  application,
  onUpdateStatus,
}: {
  application: any;
  onUpdateStatus: (
    appId: number,
    status: string,
    interview?: { date: string; time: string; location: string }
  ) => Promise<void>;
}) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancelAcceptance = async () => {
    setLoading(true);
    try {
      await onUpdateStatus(application.id, "PENDING");
      setShowCancelConfirm(false);
    } catch (err) {
      // parent handles errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex-1 bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 card-hover">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center animate-glow">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-emerald-800">Candidature acceptée</span>
        </div>
        <p className="text-xs text-emerald-700 mb-4 font-medium">Le candidat a été accepté pour ce poste</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full border-2 border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 rounded-xl transition-all duration-300 hover:-translate-y-1 btn-hover-lift"
          onClick={() => setShowCancelConfirm(true)}
          disabled={loading}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Annuler l'acceptation
        </Button>
      </div>

      {/* Confirmation dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200/50 p-4 max-w-sm w-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center animate-pulse">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Annuler l'acceptation</h3>
                <p className="text-sm text-slate-600 mt-1">Voulez-vous vraiment annuler cette acceptation ?</p>
              </div>
            </div>
            
            <div className="text-sm text-amber-700 bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-2xl mb-6 border border-amber-200">
              <p className="font-bold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Attention
              </p>
              <p>Cela remettra la candidature en statut "En attente" et le candidat sera notifié du changement.</p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 text-sm px-4 py-3 rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-all duration-300 hover:-translate-y-1 btn-hover-lift"
                onClick={() => setShowCancelConfirm(false)}
              >
                Annuler
              </Button>
              <Button 
                className="flex-1 text-sm px-4 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-amber-600/25 hover:shadow-xl hover:shadow-amber-600/30 btn-hover-lift"
                onClick={handleCancelAcceptance}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Confirmation...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Confirmer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Composant pour les candidatures rejetées - permet d'annuler le rejet
function ActionButtonsRejected({
  application,
  onUpdateStatus,
}: {
  application: any;
  onUpdateStatus: (
    appId: number,
    status: string,
    interview?: { date: string; time: string; location: string }
  ) => Promise<void>;
}) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancelRejection = async () => {
    setLoading(true);
    try {
      await onUpdateStatus(application.id, "PENDING");
      setShowCancelConfirm(false);
    } catch (err) {
      // parent handles errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <XCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium text-red-800">Candidature rejetée</span>
        </div>
        <p className="text-xs text-red-700 mb-3">Le candidat a été refusé pour ce poste</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
          onClick={() => setShowCancelConfirm(true)}
          disabled={loading}
        >
          <RotateCcw className="h-3 w-3 mr-2" />
          Annuler le rejet
        </Button>
      </div>

      {/* Confirmation dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200/50 p-4 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Annuler le rejet</h3>
                <p className="text-xs text-slate-600 mt-1">Voulez-vous vraiment annuler ce rejet ?</p>
              </div>
            </div>
            
            <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg mb-4">
              <p className="font-medium">⚠️ Attention</p>
              <p className="mt-1">Cela remettra la candidature en statut "En attente" et vous pourrez la réévaluer.</p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 text-sm"
                onClick={() => setShowCancelConfirm(false)}
              >
                Annuler
              </Button>
              <Button 
                className="flex-1 text-sm bg-amber-600 hover:bg-amber-700"
                onClick={handleCancelRejection}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Confirmation...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-3 w-3 mr-2" />
                    Confirmer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Composant pour les entretiens planifiés - permet d'annuler ou reprogrammer
function ActionButtonsInterview({
  application,
  onUpdateStatus,
}: {
  application: any;
  onUpdateStatus: (
    appId: number,
    status: string,
    interview?: { date: string; time: string; location: string }
  ) => Promise<void>;
}) {
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [date, setDate] = useState<string>(
    application.interview_date ? application.interview_date.split("T")[0] : ""
  );
  const [time, setTime] = useState<string>(application.interview_time || "");
  const [location, setLocation] = useState<string>(application.interview_location || "");
  const [loading, setLoading] = useState(false);

  const handleReschedule = async () => {
    setLoading(true);
    try {
      let interviewDate = null;
      if (date) {
        if (time) {
          interviewDate = `${date} ${time}:00`;
        } else {
          interviewDate = `${date} 00:00:00`;
        }
      }

      await onUpdateStatus(application.id, "INTERVIEW", {
        date: interviewDate || "",
        time: time || "",
        location: location || "",
      });
      setShowRescheduleForm(false);
    } catch (err) {
      // parent handles errors
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInterview = async () => {
    setLoading(true);
    try {
      await onUpdateStatus(application.id, "PENDING");
      setShowCancelConfirm(false);
    } catch (err) {
      // parent handles errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Entretien planifié</span>
        </div>
        
        {application.interview_date && (
          <div className="text-xs text-blue-700 mb-3">
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3" />
              {new Date(application.interview_date).toLocaleDateString("fr-FR")}
              {application.interview_time && ` à ${application.interview_time}`}
            </div>
            {application.interview_location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {application.interview_location}
              </div>
            )}
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => setShowRescheduleForm(true)}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reprogrammer
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
            onClick={() => setShowCancelConfirm(true)}
          >
            <XCircle className="h-3 w-3 mr-1" />
            Annuler
          </Button>
        </div>
      </div>

      {/* Reschedule form */}
      {showRescheduleForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200/50 p-4 max-w-md w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Reprogrammer l'entretien</h3>
                <p className="text-xs text-slate-600 mt-1">Modifiez les détails de l'entretien</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-medium text-slate-700">Date</label>
                <input 
                  type="date" 
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Heure</label>
                <input 
                  type="time" 
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm" 
                  value={time} 
                  onChange={(e) => setTime(e.target.value)} 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Lieu</label>
                <input 
                  type="text" 
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  placeholder="Ex: Bureau, Zoom, Téléphone..." 
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 text-sm"
                onClick={() => setShowRescheduleForm(false)}
              >
                Annuler
              </Button>
              <Button 
                className="flex-1 text-sm"
                onClick={handleReschedule}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 mr-2" />
                    Confirmer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel confirmation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200/50 p-4 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Annuler l'entretien</h3>
                <p className="text-xs text-slate-600 mt-1">Voulez-vous vraiment annuler cet entretien ?</p>
              </div>
            </div>
            
            <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg mb-4">
              <p className="font-medium">⚠️ Attention</p>
              <p className="mt-1">Cela supprimera l'entretien planifié et remettra la candidature en statut "En attente".</p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 text-sm"
                onClick={() => setShowCancelConfirm(false)}
              >
                Annuler
              </Button>
              <Button 
                className="flex-1 text-sm bg-red-600 hover:bg-red-700"
                onClick={handleCancelInterview}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Suppression...
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-2" />
                    Confirmer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ActionButtonsPending({
  application,
  onUpdateStatus,
}: {
  application: any;
  onUpdateStatus: (
    appId: number,
    status: string,
    interview?: { date: string; time: string; location: string }
  ) => Promise<void>;
}) {
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [date, setDate] = useState<string>(
    application.interview_date ? application.interview_date.split("T")[0] : ""
  );
  const [time, setTime] = useState<string>(application.interview_time || "");
  const [location, setLocation] = useState<string>(application.interview_location || "");
  const [loading, setLoading] = useState(false);

  const handleInterviewConfirm = async () => {
    setLoading(true);
    try {
      // Build interview_date as MySQL DATETIME string if date provided
      let interviewDate = null;
      if (date) {
        if (time) {
          interviewDate = `${date} ${time}:00`;
        } else {
          interviewDate = `${date} 00:00:00`;
        }
      }

      await onUpdateStatus(application.id, "INTERVIEW", {
        date: interviewDate || "",
        time: time || "",
        location: location || "",
      });
      setShowInterviewForm(false);
    } catch (err) {
      // parent handles errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!showInterviewForm ? (
        <>
          <Button className="flex-1" onClick={() => onUpdateStatus(application.id, "ACCEPTED")}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Accepter
          </Button>
          <Button className="flex-1" variant="destructive" onClick={() => onUpdateStatus(application.id, "REJECTED")}>
            <XCircle className="h-4 w-4 mr-2" />
            Rejeter
          </Button>
          <Button className="flex-1" variant="outline" onClick={() => setShowInterviewForm(true)}>
            <Briefcase className="h-4 w-4 mr-2" />
            Entretien
          </Button>
        </>
      ) : (
        <div className="flex-1 bg-muted/30 rounded p-3">
          <div className="grid grid-cols-1 gap-2">
            <label className="text-sm">Date</label>
            <input type="date" className="input w-full" value={date} onChange={(e) => setDate(e.target.value)} />
            <label className="text-sm">Heure</label>
            <input type="time" className="input w-full" value={time} onChange={(e) => setTime(e.target.value)} />
            <label className="text-sm">Lieu</label>
            <input type="text" className="input w-full" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex: Bureau, Zoom, Téléphone..." />
            <div className="flex gap-2 mt-2">
              <Button className="flex-1" onClick={handleInterviewConfirm} disabled={loading}>
                Confirmer
              </Button>
              <Button variant="ghost" className="flex-1" onClick={() => setShowInterviewForm(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
