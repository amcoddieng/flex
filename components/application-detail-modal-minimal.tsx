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
    color: "bg-yellow-100 text-yellow-800", 
    icon: Clock, 
    label: "En attente"
  },
  ACCEPTED: { 
    color: "bg-green-100 text-green-800", 
    icon: CheckCircle, 
    label: "Acceptée"
  },
  REJECTED: { 
    color: "bg-red-100 text-red-800", 
    icon: XCircle, 
    label: "Rejetée"
  },
  INTERVIEW: { 
    color: "bg-blue-100 text-blue-800", 
    icon: Briefcase, 
    label: "Entretien"
  },
};

export function ApplicationDetailModalMinimal({
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
      <DialogContent className="max-w-2xl w-[90vw] max-h-[90vh] bg-white rounded-lg shadow-lg">
        <div className="flex flex-col max-h-[90vh]">
          {/* Header minimal */}
          <DialogHeader className="pb-3 border-b">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <DialogTitle className="text-lg font-semibold text-gray-900 mb-1">
                  {application.job_title}
                </DialogTitle>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>{new Date(application.applied_at).toLocaleDateString("fr-FR")}</span>
                  <span>•</span>
                  <span>{student.first_name} {student.last_name}</span>
                </div>
              </div>
              
              <Badge className={`${config.color} px-2 py-1 text-xs font-medium`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
            </div>
          </DialogHeader>

          {/* Content minimal */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Profil candidat minimal */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Profil du Candidat</h3>
                  
                  <div className="bg-gray-50 rounded p-3 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">
                        {student.first_name?.charAt(0).toUpperCase()}{student.last_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {student.first_name} {student.last_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {student.email}
                        </div>
                        {student.phone && (
                          <div className="text-sm text-gray-600">
                            {student.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Études:</span>
                        <div className="font-medium">
                          {student.year_of_study ? `Année ${student.year_of_study}` : "Non spécifié"}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Université:</span>
                        <div className="font-medium truncate">
                          {student.university || "Non spécifié"}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Département:</span>
                        <div className="font-medium truncate">
                          {student.department || "Non spécifié"}
                        </div>
                      </div>
                    </div>

                    {student.bio && (
                      <div>
                        <span className="text-sm text-gray-500">À propos:</span>
                        <p className="text-sm text-gray-700 mt-1">
                          {student.bio}
                        </p>
                      </div>
                    )}

                    {student.skills && student.skills.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-500">Compétences:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
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
                </div>

                {/* Détails candidature minimal */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Détails de la Candidature</h3>
                  
                  <div className="bg-gray-50 rounded p-3 space-y-2">
                    {application.message && (
                      <div>
                        <span className="text-sm text-gray-500">Message:</span>
                        <p className="text-sm text-gray-700 mt-1">
                          {application.message}
                        </p>
                      </div>
                    )}

                    {application.experience && (
                      <div>
                        <span className="text-sm text-gray-500">Expérience:</span>
                        <p className="text-sm text-gray-700 mt-1">
                          {application.experience}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {application.start_date && (
                        <div>
                          <span className="text-gray-500">Date de début:</span>
                          <div className="font-medium">
                            {new Date(application.start_date).toLocaleDateString("fr-FR")}
                          </div>
                        </div>
                      )}
                      {application.availability && (
                        <div>
                          <span className="text-gray-500">Disponibilité:</span>
                          <div className="font-medium">
                            {application.availability}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Entretien si applicable */}
                {application.status === "INTERVIEW" && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Entretien Programmé</h3>
                    
                    <div className="bg-blue-50 rounded p-3 space-y-2">
                      {application.interview_date && (
                        <div className="text-sm">
                          <span className="text-gray-500">Date et heure:</span>
                          <div className="font-medium">
                            {new Date(application.interview_date).toLocaleDateString("fr-FR")}
                            {application.interview_time && ` à ${application.interview_time}`}
                          </div>
                        </div>
                      )}
                      
                      {application.interview_location && (
                        <div className="text-sm">
                          <span className="text-gray-500">Lieu:</span>
                          <div className="font-medium">
                            {application.interview_location}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer minimal */}
          <div className="border-t p-4 flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {application.status === "PENDING" && (
                  <ActionButtonsPendingMinimal
                    application={application}
                    onUpdateStatus={onUpdateStatus}
                  />
                )}
                {application.status === "ACCEPTED" && (
                  <ActionButtonsAcceptedMinimal
                    application={application}
                    onUpdateStatus={onUpdateStatus}
                  />
                )}
                {application.status === "REJECTED" && (
                  <ActionButtonsRejectedMinimal
                    application={application}
                    onUpdateStatus={onUpdateStatus}
                  />
                )}
                {application.status === "INTERVIEW" && (
                  <ActionButtonsInterviewMinimal
                    application={application}
                    onUpdateStatus={onUpdateStatus}
                  />
                )}
              </div>
              
              {onStartConversation && (
                <Button
                  onClick={() => onStartConversation(application.student_id, application.job_id)}
                  size="sm"
                  disabled={conversationLoading}
                >
                  {conversationLoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                      Ouverture...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-3 w-3 mr-1" />
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

// Composants d'actions minimalistes
function ActionButtonsPendingMinimal({
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
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepter
          </Button>
          <Button 
            onClick={() => onUpdateStatus(application.id, "REJECTED")}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Rejeter
          </Button>
          <Button 
            onClick={() => setShowInterviewForm(true)}
            size="sm"
            variant="outline"
          >
            <Briefcase className="h-3 w-3 mr-1" />
            Entretien
          </Button>
        </div>
      ) : (
        <div className="w-full space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <input 
              type="date" 
              className="px-2 py-1 border rounded text-sm" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
            <input 
              type="time" 
              className="px-2 py-1 border rounded text-sm" 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
            />
            <input 
              type="text" 
              className="px-2 py-1 border rounded text-sm" 
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
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  Confirmation...
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
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

function ActionButtonsAcceptedMinimal({
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
      <div className="bg-green-50 rounded p-2">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle className="h-3 w-3 text-green-600" />
          <span className="text-xs font-medium text-green-800">Acceptée</span>
        </div>
        <Button 
          variant="outline"
          onClick={() => setShowCancelConfirm(true)}
          disabled={loading}
          size="sm"
          className="text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Annuler
        </Button>
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded p-4 max-w-sm w-full">
            <h3 className="font-medium text-gray-900 mb-2">Annuler l'acceptation</h3>
            <p className="text-sm text-gray-600 mb-3">Voulez-vous vraiment annuler cette acceptation ?</p>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1"
                size="sm"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCancelAcceptance}
                disabled={loading}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                size="sm"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                    Confirmation...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-3 w-3 mr-1" />
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

function ActionButtonsRejectedMinimal({
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
      <div className="bg-red-50 rounded p-2">
        <div className="flex items-center gap-2 mb-1">
          <XCircle className="h-3 w-3 text-red-600" />
          <span className="text-xs font-medium text-red-800">Rejetée</span>
        </div>
        <Button 
          variant="outline"
          onClick={() => setShowCancelConfirm(true)}
          disabled={loading}
          size="sm"
          className="text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Annuler
        </Button>
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded p-4 max-w-sm w-full">
            <h3 className="font-medium text-gray-900 mb-2">Annuler le rejet</h3>
            <p className="text-sm text-gray-600 mb-3">Voulez-vous vraiment annuler ce rejet ?</p>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1"
                size="sm"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCancelRejection}
                disabled={loading}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                size="sm"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                    Confirmation...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-3 w-3 mr-1" />
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

function ActionButtonsInterviewMinimal({
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
      <div className="bg-blue-50 rounded p-2">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="h-3 w-3 text-blue-600" />
          <span className="text-xs font-medium text-blue-800">Entretien</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={() => onUpdateStatus(application.id, "ACCEPTED")}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white text-xs"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepter
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowRescheduleForm(true)}
            size="sm"
            className="text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reprogrammer
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowCancelConfirm(true)}
            size="sm"
            className="text-xs"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Annuler
          </Button>
        </div>
      </div>

      {showRescheduleForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded p-4 max-w-sm w-full">
            <h3 className="font-medium text-gray-900 mb-3">Reprogrammer l'entretien</h3>
            <div className="space-y-2 mb-3">
              <input 
                type="date" 
                className="w-full px-2 py-1 border rounded text-sm" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
              />
              <input 
                type="time" 
                className="w-full px-2 py-1 border rounded text-sm" 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
              />
              <input 
                type="text" 
                className="w-full px-2 py-1 border rounded text-sm" 
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
                size="sm"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleReschedule}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Confirmer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded p-4 max-w-sm w-full">
            <h3 className="font-medium text-gray-900 mb-2">Annuler l'entretien</h3>
            <p className="text-sm text-gray-600 mb-3">Voulez-vous vraiment annuler cet entretien ?</p>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1"
                size="sm"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCancelInterview}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
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
