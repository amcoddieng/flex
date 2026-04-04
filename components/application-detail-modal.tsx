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
};

const statusConfig = {
  PENDING: { color: "bg-yellow-100", textColor: "text-yellow-800", icon: Clock, label: "En attente" },
  ACCEPTED: { color: "bg-green-100", textColor: "text-green-800", icon: CheckCircle, label: "Acceptée" },
  REJECTED: { color: "bg-red-100", textColor: "text-red-800", icon: XCircle, label: "Rejetée" },
  INTERVIEW: { color: "bg-blue-100", textColor: "text-blue-800", icon: Briefcase, label: "Entretien" },
};

export function ApplicationDetailModal({
  open,
  loading,
  application,
  onClose,
  onUpdateStatus,
  onStartConversation,
}: ApplicationDetailModalProps) {
  if (!application) return null;

  const student = application.student;
  const config = statusConfig[application.status as keyof typeof statusConfig] || statusConfig.PENDING;
  const StatusIcon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détail de la candidature</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status and job title */}
            <div className="border-b pb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{application.job_title}</h2>
                <Badge className={`${config.color} ${config.textColor} border-0`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Candidature du {new Date(application.applied_at).toLocaleDateString("fr-FR")}
              </p>
            </div>

            {/* Student info */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-bold mb-4">Profil du candidat</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nom complet</p>
                  <p className="font-medium">
                    {student.first_name} {student.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Année d'études</p>
                  <p className="font-medium">
                    {student.year_of_study ? `Année ${student.year_of_study}` : "Non spécifié"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Université</p>
                  <p className="font-medium">{student.university || "Non spécifié"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Département</p>
                  <p className="font-medium">{student.department || "Non spécifié"}</p>
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className="space-y-3">
              <h3 className="font-bold">Coordonnées</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-sm">{student.email}</span>
                </div>
                {student.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-sm">{student.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio and skills */}
            {student.bio && (
              <div>
                <h3 className="font-bold mb-2">À propos</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {student.bio}
                </p>
              </div>
            )}

            {student.skills && student.skills.length > 0 && (
              <div>
                <h3 className="font-bold mb-2">Compétences</h3>
                <div className="flex flex-wrap gap-2">
                  {student.skills.map((skill: string, idx: number) => (
                    <Badge key={idx} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Application details */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-bold mb-3">Détails de la candidature</h3>
              <div className="space-y-3 text-sm">
                {application.message && (
                  <div>
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium mb-1">Message du candidat</p>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {application.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {application.experience && (
                  <div>
                    <p className="font-medium mb-1">Expérience</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {application.experience}
                    </p>
                  </div>
                )}

                {application.start_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <span className="font-medium">Date de début souhaitée:</span>{" "}
                      {new Date(application.start_date).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                )}

                {application.availability && (
                  <div>
                    <span className="font-medium">Disponibilité:</span> {application.availability}
                  </div>
                )}
              </div>
            </div>

            {/* Interview info if scheduled */}
            {application.status === "INTERVIEW" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold mb-3">Entretien programmé</h3>
                <div className="space-y-2 text-sm">
                  {application.interview_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>
                        {new Date(application.interview_date).toLocaleDateString("fr-FR")}
                        {application.interview_time && ` à ${application.interview_time}`}
                      </span>
                    </div>
                  )}
                  {application.interview_location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span>{application.interview_location}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="border-t pt-4 flex gap-3">
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
              
              {/* Bouton de conversation - disponible pour tous les statuts */}
              <Button
                variant="outline"
                className="gap-2 text-sm border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => onStartConversation?.(application.student_id, application.job_id)}
                disabled={!onStartConversation}
              >
                <MessageCircle className="h-4 w-4" />
                Contacter le candidat
              </Button>
            </div>
          </div>
        )}
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
