import { useState, useEffect } from "react";
import { 
  Building2, MapPin, Banknote, Briefcase, Clock, 
  Calendar, Mail, Phone, X, Send, CheckCircle,
  AlertCircle, User, FileText, Target, Award,
  Sparkles, ArrowRight, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import "@/styles/modal.css";

interface Job {
  id: number;
  title: string;
  description: string;
  company: string;
  location: string;
  service_type: string;
  salary: string;
  type_paiement: string;
  availability: string;
  requirements: string;
  contact_email: string;
  contact_phone: string;
  posted_at: string;
  applicants: number;
  is_active: boolean;
  blocked: boolean;
}

interface JobModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (jobId: number, applicationData: ApplicationData) => Promise<{ success: boolean; message?: string; error?: string }>;
  hasApplied: boolean;
  applicationStatus?: string;
}

interface ApplicationData {
  message: string;
  availability: string;
  experience: string;
  start_date: string;
}

export function JobModal({ job, isOpen, onClose, onApply, hasApplied, applicationStatus }: JobModalProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    message: "",
    availability: "",
    experience: "",
    start_date: ""
  });
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setShowApplicationForm(false);
      setApplicationData({
        message: "",
        availability: "",
        experience: "",
        start_date: ""
      });
    }, 300);
  };

  const handleApply = async () => {
    if (!applicationData.message.trim() || !job) {
      return;
    }

    setIsApplying(true);
    try {
      const result = await onApply(job.id, applicationData);
      if (result.success) {
        setTimeout(() => {
          setShowApplicationForm(false);
          setApplicationData({
            message: "",
            availability: "",
            experience: "",
            start_date: ""
          });
        }, 500);
      }
    } catch (error) {
      console.error('Erreur lors de la candidature:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "REJECTED": return "text-red-600 bg-red-50 border-red-200";
      case "INTERVIEW": return "text-violet-600 bg-violet-50 border-violet-200";
      default: return "text-amber-600 bg-amber-50 border-amber-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACCEPTED": return "Acceptée";
      case "REJECTED": return "Refusée";
      case "INTERVIEW": return "Entretien";
      default: return "En attente";
    }
  };

  if (!isOpen || !job) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-[9999] transition-all duration-300",
          isOpen && !isClosing ? "bg-black/60 backdrop-blur-sm" : "bg-black/0 backdrop-blur-none"
        )}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={cn(
          "fixed inset-0 z-[10000] overflow-y-auto",
          isOpen && !isClosing ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div 
          className={cn(
            "bg-white rounded-3xl shadow-2xl transition-all duration-300",
            isOpen && !isClosing ? "scale-100 opacity-100" : "scale-95 opacity-0"
          )}
          style={{
            position: 'fixed',
            top: '45vh',
            left: '50vw',
            transform: isOpen && !isClosing ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.95)',
            width: 'min(90vw, 1200px)',
            maxHeight: '85vh',
            maxWidth: '1200px',
            zIndex: 10001
          }}
          onClick={(e) => e.stopPropagation()}
        >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 opacity-50" />
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary via-violet-600 to-indigo-600 p-8 text-white overflow-hidden">
          {/* Animated decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full" />
          
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110 group btn-hover-lift"
          >
            <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
          
          <div className="relative z-10 flex items-start gap-6">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
              <Building2 className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                {job.title}
              </h2>
              <div className="flex items-center gap-6 text-white/90">
                <span className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5" />
                  {job.company}
                </span>
                <span className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5" />
                  {job.location}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative p-8 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          {/* Status Badge */}
          {hasApplied && (
            <div className="mb-8">
              <div className={cn(
                "inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-semibold border-2 shadow-lg",
                getStatusColor(applicationStatus || "PENDING")
              )}>
                <CheckCircle className="h-5 w-5" />
                Candidature {getStatusText(applicationStatus || "PENDING")}
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
          )}

          {/* Job Details Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-3 text-lg">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  Détails du poste
                </h3>
                <div className="space-y-4">
                  <div className="bg-white/50 rounded-2xl p-4 form-input">
                    <p className="text-sm text-slate-600 mb-1 font-medium">Type de service</p>
                    <p className="font-semibold text-slate-800">{job.service_type || "Non spécifié"}</p>
                  </div>
                  <div className="bg-white/50 rounded-2xl p-4 form-input">
                    <p className="text-sm text-slate-600 mb-1 font-medium">Type de paiement</p>
                    <p className="font-semibold text-slate-800">{job.type_paiement || "Non spécifié"}</p>
                  </div>
                  <div className="bg-white/50 rounded-2xl p-4 form-input">
                    <p className="text-sm text-slate-600 mb-1 font-medium">Disponibilité</p>
                    <p className="font-semibold text-slate-800">{job.availability || "Non spécifiée"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl p-6 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-3 text-lg">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <Banknote className="h-6 w-6 text-white" />
                  </div>
                  Rémunération
                </h3>
                <p className="font-bold text-emerald-700 text-2xl">{job.salary || "Non spécifiée"}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-3 text-lg">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  Contact
                </h3>
                <div className="space-y-4">
                  {job.contact_email && (
                    <div className="bg-white/50 rounded-2xl p-4 flex items-center gap-3 hover:bg-white/70 transition-colors form-input">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <span className="text-slate-700 font-medium">{job.contact_email}</span>
                    </div>
                  )}
                  {job.contact_phone && (
                    <div className="bg-white/50 rounded-2xl p-4 flex items-center gap-3 hover:bg-white/70 transition-colors form-input">
                      <Phone className="h-5 w-5 text-blue-500" />
                      <span className="text-slate-700 font-medium">{job.contact_phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-3xl p-6 border border-violet-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-3 text-lg">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  Statistiques
                </h3>
                <div className="space-y-3">
                  <div className="bg-white/50 rounded-2xl p-4 flex justify-between items-center hover:bg-white/70 transition-colors form-input">
                    <span className="text-sm text-slate-600 font-medium">Candidats</span>
                    <span className="font-bold text-slate-800 text-lg">{job.applicants || 0}</span>
                  </div>
                  <div className="bg-white/50 rounded-2xl p-4 flex justify-between items-center hover:bg-white/70 transition-colors form-input">
                    <span className="text-sm text-slate-600 font-medium">Posté le</span>
                    <span className="font-bold text-slate-800">
                      {new Date(job.posted_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-10">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-3 text-xl">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              Description
            </h3>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-6 border border-slate-200/50 shadow-lg">
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {job.description || "Aucune description disponible"}
              </p>
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div className="mb-10">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-3 text-xl">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <Award className="h-6 w-6 text-white" />
                </div>
                Exigences
              </h3>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-6 border border-amber-200/50 shadow-lg">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {job.requirements}
                </p>
              </div>
            </div>
          )}

          {/* Application Form */}
          {!hasApplied && (
            <div className="border-t-2 border-slate-200 pt-10">
              {!showApplicationForm ? (
                <div className="text-center">
                  <div className="inline-flex flex-col items-center">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center mb-6">
                      <Send className="h-8 w-8 text-white" />
                    </div>
                    <button
                      onClick={() => setShowApplicationForm(true)}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary via-violet-600 to-indigo-600 text-white rounded-3xl font-bold text-lg hover:from-primary/90 hover:via-violet-600/90 hover:to-indigo-600/90 transition-all duration-300 shadow-2xl shadow-primary/25 hover:shadow-3xl hover:shadow-primary/30 hover:-translate-y-2 group btn-hover-lift"
                    >
                      <span className="flex items-center gap-3">
                        <Send className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                        Postuler à cette offre
                        <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                      </span>
                    </button>
                    <p className="text-slate-500 mt-4 text-sm">Cliquez pour remplir le formulaire de candidature</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <h3 className="font-bold text-slate-800 flex items-center gap-3 text-xl">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    Votre candidature
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Message de motivation *
                        </label>
                        <textarea
                          value={applicationData.message}
                          onChange={(e) => setApplicationData({ ...applicationData, message: e.target.value })}
                          className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/50 resize-none transition-all duration-300"
                          rows={6}
                          placeholder="Présentez-vous et expliquez pourquoi vous êtes intéressé par cette offre..."
                        />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          Disponibilité
                        </label>
                        <input
                          type="text"
                          value={applicationData.availability}
                          onChange={(e) => setApplicationData({ ...applicationData, availability: e.target.value })}
                          className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 form-input"
                          placeholder="Ex: Week-ends, Soirs..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary" />
                          Expérience pertinente
                        </label>
                        <input
                          type="text"
                          value={applicationData.experience}
                          onChange={(e) => setApplicationData({ ...applicationData, experience: e.target.value })}
                          className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 form-input"
                          placeholder="Ex: 6 mois en restauration..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          Date de début souhaitée
                        </label>
                        <input
                          type="date"
                          value={applicationData.start_date}
                          onChange={(e) => setApplicationData({ ...applicationData, start_date: e.target.value })}
                          className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 form-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end">
                    <button
                      onClick={() => setShowApplicationForm(false)}
                      className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all duration-300 hover:-translate-y-1 btn-hover-lift"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleApply}
                      disabled={isApplying || !applicationData.message.trim()}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary via-violet-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-primary/90 hover:via-violet-600/90 hover:to-indigo-600/90 transition-all duration-300 shadow-2xl shadow-primary/25 hover:shadow-3xl hover:shadow-primary/30 hover:-translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none btn-hover-lift"
                    >
                      {isApplying ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="h-6 w-6" />
                          Envoyer la candidature
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
