import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Download,
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
    color: "bg-amber-100 text-amber-800 border-amber-200", 
    icon: Clock, 
    label: "En attente"
  },
  ACCEPTED: { 
    color: "bg-emerald-100 text-emerald-800 border-emerald-200", 
    icon: CheckCircle, 
    label: "Acceptée"
  },
  REJECTED: { 
    color: "bg-rose-100 text-rose-800 border-rose-200", 
    icon: XCircle, 
    label: "Rejetée"
  },
  INTERVIEW: { 
    color: "bg-blue-100 text-blue-800 border-blue-200", 
    icon: Briefcase, 
    label: "Entretien"
  },
};

export function ApplicationDetailModalSimple({
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
      <DialogContent className="max-w-3xl w-[90vw] max-h-[85vh] overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header simple */}
          <DialogHeader className="pb-4 border-b border-slate-200/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-xl font-bold text-slate-900 mb-2">
                  {application.job_title}
                </DialogTitle>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(application.applied_at).toLocaleDateString("fr-FR")}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {student.first_name} {student.last_name}
                  </div>
                </div>
              </div>
              
              <Badge className={`${config.color} px-3 py-1 text-sm font-medium`}>
                <StatusIcon className="h-4 w-4 mr-1" />
                {config.label}
              </Badge>
            </div>
          </DialogHeader>

          {/* Content simple */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Profil candidat simple */}
                <section className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/30 p-5">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Profil du Candidat
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Nom et contact */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {student.first_name?.charAt(0).toUpperCase()}{student.last_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-slate-900">
                          {student.first_name} {student.last_name}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {student.email}
                          </div>
                          {student.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {student.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Info académique */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm">
                          <GraduationCap className="h-4 w-4 text-blue-500" />
                          <span className="text-slate-600">Études:</span>
                          <span className="font-medium text-slate-900">
                            {student.year_of_study ? `Année ${student.year_of_study}` : "Non spécifié"}
                          </span>
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="h-4 w-4 text-purple-500" />
                          <span className="text-slate-600">Université:</span>
                          <span className="font-medium text-slate-900 truncate">
                            {student.university || "Non spécifié"}
                          </span>
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="h-4 w-4 text-emerald-500" />
                          <span className="text-slate-600">Département:</span>
                          <span className="font-medium text-slate-900 truncate">
                            {student.department || "Non spécifié"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {student.bio && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h5 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          À propos
                        </h5>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {student.bio}
                        </p>
                      </div>
                    )}

                    {/* Compétences */}
                    {student.skills && student.skills.length > 0 && (
                      <div className="bg-purple-50 rounded-lg p-3">
                        <h5 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                          <Star className="h-4 w-4 text-purple-600" />
                          Compétences
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {student.skills.map((skill: string, idx: number) => (
                            <Badge 
                              key={idx} 
                              variant="secondary" 
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Détails candidature simple */}
                <section className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/30 p-5">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-emerald-600" />
                    Détails de la Candidature
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Message */}
                    {application.message && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <h5 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                          Message du candidat
                        </h5>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {application.message}
                        </p>
                      </div>
                    )}

                    {/* Expérience */}
                    {application.experience && (
                      <div className="bg-amber-50 rounded-lg p-3">
                        <h5 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                          <Award className="h-4 w-4 text-amber-600" />
                          Expérience
                        </h5>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {application.experience}
                        </p>
                      </div>
                    )}

                    {/* Date et disponibilité */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {application.start_date && (
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-orange-500" />
                            <span className="text-slate-600">Date de début:</span>
                            <span className="font-medium text-slate-900">
                              {new Date(application.start_date).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </div>
                      )}
                      {application.availability && (
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-green-500" />
                            <span className="text-slate-600">Disponibilité:</span>
                            <span className="font-medium text-slate-900">
                              {application.availability}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Entretien si applicable */}
                {application.status === "INTERVIEW" && (
                  <section className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/30 p-5">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Entretien Programmé
                    </h3>
                    
                    <div className="space-y-3">
                      {application.interview_date && (
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span className="text-slate-600">Date et heure:</span>
                            <span className="font-medium text-slate-900">
                              {new Date(application.interview_date).toLocaleDateString("fr-FR")}
                              {application.interview_time && ` à ${application.interview_time}`}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {application.interview_location && (
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-teal-500" />
                            <span className="text-slate-600">Lieu:</span>
                            <span className="font-medium text-slate-900">
                              {application.interview_location}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>

          {/* Footer simple */}
          <div className="border-t border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-blue-50/50 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {application.status === "PENDING" && (
                  <ActionButtonsPendingSimple
                    application={application}
                    onUpdateStatus={onUpdateStatus}
                  />
                )}
                {application.status === "ACCEPTED" && (
                  <ActionButtonsAcceptedSimple
                    application={application}
                    onUpdateStatus={onUpdateStatus}
                  />
                )}
                {application.status === "REJECTED" && (
                  <ActionButtonsRejectedSimple
                    application={application}
                    onUpdateStatus={onUpdateStatus}
                  />
                )}
                {application.status === "INTERVIEW" && (
                  <ActionButtonsInterviewSimple
                    application={application}
                    onUpdateStatus={onUpdateStatus}
                  />
                )}
              </div>
              
              {onStartConversation && (
                <Button
                  onClick={() => onStartConversation(application.student_id, application.job_id)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  disabled={conversationLoading}
                >
                  {conversationLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Ouverture...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contacter
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

// Composants d'actions simplifiés
function ActionButtonsPendingSimple({
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
        <div className="flex gap-2">
          <Button 
            onClick={() => onUpdateStatus(application.id, "ACCEPTED")}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Accepter
          </Button>
          <Button 
            onClick={() => onUpdateStatus(application.id, "REJECTED")}
            size="sm"
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Rejeter
          </Button>
          <Button 
            onClick={() => setShowInterviewForm(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Briefcase className="h-4 w-4 mr-1" />
            Entretien
          </Button>
        </div>
      ) : (
        <div className="bg-blue-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-slate-900">Programmer un entretien</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input 
              type="date" 
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
            <input 
              type="time" 
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
            />
            <input 
              type="text" 
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              placeholder="Lieu..." 
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleInterviewConfirm}
              disabled={loading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  Confirmation...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirmer
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowInterviewForm(false)}
              size="sm"
            >
              Annuler
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function ActionButtonsAcceptedSimple({
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
      <div className="bg-emerald-50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-800">Candidature acceptée</span>
        </div>
        <Button 
          variant="outline"
          onClick={() => setShowCancelConfirm(true)}
          disabled={loading}
          size="sm"
          className="text-amber-700 border-amber-300 hover:bg-amber-50"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Annuler
        </Button>
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Annuler l'acceptation</h3>
            <p className="text-sm text-slate-600 mb-4">Voulez-vous vraiment annuler cette acceptation ?</p>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCancelAcceptance}
                disabled={loading}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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

function ActionButtonsRejectedSimple({
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
      <div className="bg-rose-50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <XCircle className="h-4 w-4 text-rose-600" />
          <span className="text-sm font-medium text-rose-800">Candidature rejetée</span>
        </div>
        <Button 
          variant="outline"
          onClick={() => setShowCancelConfirm(true)}
          disabled={loading}
          size="sm"
          className="text-amber-700 border-amber-300 hover:bg-amber-50"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Annuler
        </Button>
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Annuler le rejet</h3>
            <p className="text-sm text-slate-600 mb-4">Voulez-vous vraiment annuler ce rejet ?</p>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCancelRejection}
                disabled={loading}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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

function ActionButtonsInterviewSimple({
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
      <div className="bg-blue-50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Entretien planifié</span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowRescheduleForm(true)}
            size="sm"
            className="text-blue-700 border-blue-300 hover:bg-blue-50"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reprogrammer
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowCancelConfirm(true)}
            size="sm"
            className="text-red-700 border-red-300 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Annuler
          </Button>
        </div>
      </div>

      {showRescheduleForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Reprogrammer l'entretien</h3>
            <div className="space-y-3 mb-4">
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
              />
              <input 
                type="time" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
              />
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="Lieu..." 
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowRescheduleForm(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleReschedule}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Annuler l'entretien</h3>
            <p className="text-sm text-slate-600 mb-4">Voulez-vous vraiment annuler cet entretien ?</p>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCancelInterview}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
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
