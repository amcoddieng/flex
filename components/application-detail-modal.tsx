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
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
      <Icon className="h-4 w-4 text-gray-400" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
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
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header avec statut */}
          <DialogHeader className="pb-4 border-b flex-shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-2 truncate">
                  {application.job_title}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Candidature du {new Date(application.applied_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <User className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate font-medium">{student.first_name} {student.last_name}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <Badge className={`${config.color} ${config.textColor} border px-3 py-1.5 text-sm font-medium whitespace-nowrap`}>
                  <StatusIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  {config.label}
                </Badge>
                <p className="text-xs text-gray-500 text-right">{config.description}</p>
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
                <section className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden flex-shrink-0">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <User className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">Profil du Candidat</span>
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Informations principales */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {student.first_name?.charAt(0).toUpperCase()}{student.last_name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 truncate">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-sm text-gray-600 truncate">{student.email}</p>
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
                <section className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden flex-shrink-0">
                  <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 py-3 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Briefcase className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">Détails de la Candidature</span>
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {application.message && (
                      <div className="bg-white rounded-lg border border-gray-100 p-4">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 flex-shrink-0" />
                          <span>Message du candidat</span>
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-3 rounded-md break-words max-h-40 overflow-y-auto">
                          {application.message}
                        </p>
                      </div>
                    )}

                    {application.experience && (
                      <div className="bg-white rounded-lg border border-gray-100 p-4">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Award className="h-4 w-4 flex-shrink-0" />
                          <span>Expérience</span>
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                          {application.experience}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {application.start_date && (
                        <div className="bg-white rounded-lg border border-gray-100 p-4">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate">Date de début souhaitée</p>
                              <p className="text-sm text-gray-600">
                                {new Date(application.start_date).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {application.availability && (
                        <div className="bg-white rounded-lg border border-gray-100 p-4">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate">Disponibilité</p>
                              <p className="text-sm text-gray-600 break-words">{application.availability}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Section Entretien si programmé */}
                {application.status === "INTERVIEW" && (
                  <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 overflow-hidden flex-shrink-0">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex-shrink-0">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Calendar className="h-5 w-5 flex-shrink-0" />
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
          <div className="border-t bg-gray-50 px-4 py-3 flex-shrink-0">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
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
                  className="gap-2 w-full lg:w-auto flex-shrink-0"
                  disabled={conversationLoading}
                >
                  {conversationLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Ouverture...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 flex-shrink-0" />
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
      <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">Candidature acceptée</span>
        </div>
        <p className="text-xs text-green-700 mb-3">Le candidat a été accepté pour ce poste</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
          onClick={() => setShowCancelConfirm(true)}
          disabled={loading}
        >
          <RotateCcw className="h-3 w-3 mr-2" />
          Annuler l'acceptation
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
                <h3 className="text-base font-semibold text-slate-900">Annuler l'acceptation</h3>
                <p className="text-xs text-slate-600 mt-1">Voulez-vous vraiment annuler cette acceptation ?</p>
              </div>
            </div>
            
            <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg mb-4">
              <p className="font-medium">⚠️ Attention</p>
              <p className="mt-1">Cela remettra la candidature en statut "En attente" et le candidat sera notifié du changement.</p>
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
                onClick={handleCancelAcceptance}
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
