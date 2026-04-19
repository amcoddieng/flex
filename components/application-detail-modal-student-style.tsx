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
  Download,
  Eye,
  Shield,
  TrendingUp,
  Users,
  Target,
  Zap,
  Sparkles,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ThumbsUp,
  Share2,
  Bookmark,
  Filter,
  Search,
  Bell,
  Settings,
  HelpCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Heart,
  Flag,
  MoreHorizontal,
  Grid,
  List,
  Layout,
  Layers,
  Box,
  Package,
  Folder,
  FolderOpen,
  Archive,
  Trash,
  RefreshCw,
  Save,
  X,
  Menu,
  Home,
  BarChart,
  PieChart,
  Activity,
  DollarSign,
  CreditCard,
  Wallet,
  Receipt,
  File,
  Image,
  Video,
  Music,
  Headphones,
  Camera,
  Mic,
  Volume2,
  Wifi,
  Battery,
  Signal,
  Globe,
  Map,
  Navigation,
  Compass,
  Anchor,
  Anchor2,
  Sailboat,
  Plane,
  Car,
  Bus,
  Train,
  Bike,
  Truck,
  Ship,
  Rocket,
  Satellite,
  Telescope,
  Microscope,
  Beaker,
  Flask,
  TestTube,
  Dna,
  Atom,
  Magnet,
  Lightbulb,
  Lamp,
  Candle,
  Sun,
  Moon,
  Star2,
  Cloud,
  CloudRain,
  CloudSnow,
  Umbrella,
  Wind,
  Thermometer,
  Gauge,
  Timer,
  Stopwatch,
  Watch,
  AlarmClock,
  Clock1,
  Clock2,
  Clock3,
  Clock4,
  Clock5,
  Clock6,
  Clock7,
  Clock8,
  Clock9,
  Clock10,
  Clock11,
  Clock12,
  Hourglass,
  TimerReset,
  TimerOff,
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
    color: "bg-amber-100/80 text-amber-800 border-amber-200/50", 
    icon: Clock, 
    label: "En attente",
    description: "Candidature en cours d'examen",
    bgGradient: "from-amber-50/50 to-orange-50/50"
  },
  ACCEPTED: { 
    color: "bg-emerald-100/80 text-emerald-800 border-emerald-200/50", 
    icon: CheckCircle, 
    label: "Acceptée",
    description: "Candidature acceptée",
    bgGradient: "from-emerald-50/50 to-green-50/50"
  },
  REJECTED: { 
    color: "bg-rose-100/80 text-rose-800 border-rose-200/50", 
    icon: XCircle, 
    label: "Rejetée",
    description: "Candidature rejetée",
    bgGradient: "from-rose-50/50 to-red-50/50"
  },
  INTERVIEW: { 
    color: "bg-blue-100/80 text-blue-800 border-blue-200/50", 
    icon: Briefcase, 
    label: "Entretien",
    description: "Entretien programmé",
    bgGradient: "from-blue-50/50 to-indigo-50/50"
  },
};

export function ApplicationDetailModalStudentStyle({
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
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header - Style étudiant */}
          <DialogHeader className="pb-6 border-b border-slate-200/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  {application.job_title}
                </DialogTitle>
                
                {/* Quick info */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    {new Date(application.applied_at).toLocaleDateString("fr-FR")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="h-4 w-4 text-purple-500" />
                    {student.first_name} {student.last_name}
                  </div>
                </div>
              </div>
              
              {/* Status badge */}
              <div className="flex flex-col items-end gap-2">
                <Badge className={`${config.color} backdrop-blur-sm px-4 py-2 text-sm font-semibold border`}>
                  <StatusIcon className="h-4 w-4 mr-2" />
                  {config.label}
                </Badge>
                <p className="text-xs text-slate-500">{config.description}</p>
              </div>
            </div>
          </DialogHeader>

          {/* Content scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Section Profil Candidat */}
                <section className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-slate-200/30 bg-gradient-to-r from-blue-50/30 to-purple-50/30">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      Profil du Candidat
                    </h3>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Profile card */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/30 p-4">
                      <div className="flex items-center gap-4 mb-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {student.first_name?.charAt(0).toUpperCase()}{student.last_name?.charAt(0).toUpperCase()}
                        </div>
                        
                        {/* Name and contact */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xl font-bold text-slate-900 truncate mb-2">
                            {student.first_name} {student.last_name}
                          </h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4 text-blue-500" />
                              <span className="truncate">{student.email}</span>
                            </div>
                            {student.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4 text-green-500" />
                                <span>{student.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="bg-white/60 backdrop-blur-sm border-slate-200/50 hover:bg-white/80">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="bg-white/60 backdrop-blur-sm border-slate-200/50 hover:bg-white/80">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Academic info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/30 p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium">Études</p>
                            <p className="text-sm font-semibold text-slate-900">
                              {student.year_of_study ? `Année ${student.year_of_study}` : "Non spécifié"}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/30 p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center">
                            <Building className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium">Université</p>
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {student.university || "Non spécifié"}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/30 p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center">
                            <Award className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium">Département</p>
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {student.department || "Non spécifié"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {student.bio && (
                      <div className="bg-gradient-to-br from-blue-50/30 to-indigo-50/30 backdrop-blur-sm rounded-xl border border-blue-200/30 p-4">
                        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          À propos
                        </h4>
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-blue-200/20">
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                            {student.bio}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {student.skills && student.skills.length > 0 && (
                      <div className="bg-gradient-to-br from-purple-50/30 to-pink-50/30 backdrop-blur-sm rounded-xl border border-purple-200/30 p-4">
                        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <Star className="h-4 w-4 text-purple-600" />
                          Compétences
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {student.skills.map((skill: string, idx: number) => (
                            <Badge 
                              key={idx} 
                              className="bg-purple-100/60 text-purple-700 border-purple-200/50 px-3 py-1 text-sm font-medium backdrop-blur-sm"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Section Détails de la candidature */}
                <section className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-slate-200/30 bg-gradient-to-r from-emerald-50/30 to-teal-50/30">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                        <Briefcase className="h-4 w-4 text-emerald-600" />
                      </div>
                      Détails de la Candidature
                    </h3>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Message */}
                    {application.message && (
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/30 p-4">
                        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                          Message du candidat
                        </h4>
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-slate-200/20">
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                            {application.message}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {application.experience && (
                      <div className="bg-gradient-to-br from-amber-50/30 to-orange-50/30 backdrop-blur-sm rounded-xl border border-amber-200/30 p-4">
                        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <Award className="h-4 w-4 text-amber-600" />
                          Expérience
                        </h4>
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-amber-200/20">
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                            {application.experience}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Date and availability */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {application.start_date && (
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/30 p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/10 flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 font-medium">Date de début</p>
                              <p className="text-sm font-semibold text-slate-900">
                                {new Date(application.start_date).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {application.availability && (
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/30 p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center">
                              <Clock className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 font-medium">Disponibilité</p>
                              <p className="text-sm font-semibold text-slate-900">
                                {application.availability}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Section Entretien - Si applicable */}
                {application.status === "INTERVIEW" && (
                  <section className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-slate-200/30 bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        Entretien Programmé
                      </h3>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      {application.interview_date && (
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/30 p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 font-medium">Date et heure</p>
                              <p className="text-sm font-semibold text-slate-900">
                                {new Date(application.interview_date).toLocaleDateString("fr-FR")}
                                {application.interview_time && ` à ${application.interview_time}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {application.interview_location && (
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/30 p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-teal-500/10 flex items-center justify-center">
                              <MapPin className="h-5 w-5 text-teal-600" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 font-medium">Lieu</p>
                              <p className="text-sm font-semibold text-slate-900">
                                {application.interview_location}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>

          {/* Footer - Style étudiant */}
          <div className="border-t border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-blue-50/50 px-6 py-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
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
                  className="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg backdrop-blur-sm transition-all duration-200"
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

// Composants pour les actions avec style étudiant
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg backdrop-blur-sm transition-all duration-200"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Accepter
          </Button>
          <Button 
            onClick={() => onUpdateStatus(application.id, "REJECTED")}
            className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg backdrop-blur-sm transition-all duration-200"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Rejeter
          </Button>
          <Button 
            onClick={() => setShowInterviewForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg backdrop-blur-sm transition-all duration-200"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Entretien
          </Button>
        </div>
      ) : (
        <div className="flex-1 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 backdrop-blur-sm rounded-xl border border-blue-200/30 p-4">
          <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            Programmer un entretien
          </h4>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                Date
              </label>
              <input 
                type="date" 
                className="w-full px-4 py-3 border border-slate-200/50 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-500" />
                Heure
              </label>
              <input 
                type="time" 
                className="w-full px-4 py-3 border border-slate-200/50 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200" 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-teal-500" />
                Lieu
              </label>
              <input 
                type="text" 
                className="w-full px-4 py-3 border border-slate-200/50 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all duration-200 placeholder-slate-400" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="Ex: Bureau, Zoom, Téléphone..." 
              />
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={handleInterviewConfirm}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg backdrop-blur-sm transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Confirmation...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmer
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowInterviewForm(false)}
                className="flex-1 bg-white/60 backdrop-blur-sm border-slate-200/50 hover:bg-white/80 transition-all duration-200"
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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
      <div className="flex-1 bg-gradient-to-br from-emerald-50/30 to-green-50/30 backdrop-blur-sm rounded-xl border border-emerald-200/30 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-sm font-bold text-emerald-800">Candidature acceptée</span>
            <p className="text-xs text-emerald-600 mt-1">Le candidat a été accepté pour ce poste</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => setShowCancelConfirm(true)}
          disabled={loading}
          className="w-full bg-white/60 backdrop-blur-sm border-amber-200/50 text-amber-700 hover:bg-amber-50/80 transition-all duration-200"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Annuler l'acceptation
        </Button>
      </div>

      {/* Confirmation dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 max-w-md w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100/50 to-amber-200/50 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Annuler l'acceptation</h3>
                <p className="text-sm text-slate-600 mt-1">Voulez-vous vraiment annuler cette acceptation ?</p>
              </div>
            </div>
            
            <div className="text-sm text-amber-700 bg-gradient-to-br from-amber-50/50 to-amber-100/50 p-4 rounded-xl mb-6 border border-amber-200/50">
              <p className="font-bold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Attention
              </p>
              <p>Cela remettra la candidature en statut "En attente" et le candidat sera notifié du changement.</p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 bg-white/60 backdrop-blur-sm border-slate-200/50 hover:bg-white/80 transition-all duration-200"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCancelAcceptance}
                disabled={loading}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white shadow-lg backdrop-blur-sm transition-all duration-200"
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
      <div className="flex-1 bg-gradient-to-br from-rose-50/30 to-red-50/30 backdrop-blur-sm rounded-xl border border-rose-200/30 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/20 to-red-500/20 flex items-center justify-center">
            <XCircle className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <span className="text-sm font-bold text-rose-800">Candidature rejetée</span>
            <p className="text-xs text-rose-600 mt-1">Le candidat a été refusé pour ce poste</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => setShowCancelConfirm(true)}
          disabled={loading}
          className="w-full bg-white/60 backdrop-blur-sm border-amber-200/50 text-amber-700 hover:bg-amber-50/80 transition-all duration-200"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Annuler le rejet
        </Button>
      </div>

      {/* Confirmation dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 max-w-md w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100/50 to-amber-200/50 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Annuler le rejet</h3>
                <p className="text-sm text-slate-600 mt-1">Voulez-vous vraiment annuler ce rejet ?</p>
              </div>
            </div>
            
            <div className="text-sm text-amber-700 bg-gradient-to-br from-amber-50/50 to-amber-100/50 p-4 rounded-xl mb-6 border border-amber-200/50">
              <p className="font-bold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Attention
              </p>
              <p>Cela remettra la candidature en statut "En attente" et vous pourrez la réévaluer.</p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 bg-white/60 backdrop-blur-sm border-slate-200/50 hover:bg-white/80 transition-all duration-200"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCancelRejection}
                disabled={loading}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white shadow-lg backdrop-blur-sm transition-all duration-200"
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
      <div className="flex-1 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 backdrop-blur-sm rounded-xl border border-blue-200/30 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <span className="text-sm font-bold text-blue-800">Entretien planifié</span>
            <p className="text-xs text-blue-600 mt-1">
              {application.interview_date && (
                <>
                  {new Date(application.interview_date).toLocaleDateString("fr-FR")}
                  {application.interview_time && ` à ${application.interview_time}`}
                </>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowRescheduleForm(true)}
            className="flex-1 bg-white/60 backdrop-blur-sm border-blue-200/50 text-blue-700 hover:bg-blue-50/80 transition-all duration-200"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reprogrammer
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowCancelConfirm(true)}
            className="flex-1 bg-white/60 backdrop-blur-sm border-red-200/50 text-red-700 hover:bg-red-50/80 transition-all duration-200"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Annuler
          </Button>
        </div>
      </div>

      {/* Reschedule form */}
      {showRescheduleForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 max-w-md w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100/50 to-indigo-100/50 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Reprogrammer l'entretien</h3>
                <p className="text-sm text-slate-600 mt-1">Modifiez les détails de l'entretien</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Date
                </label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 border border-slate-200/50 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  Heure
                </label>
                <input 
                  type="time" 
                  className="w-full px-4 py-3 border border-slate-200/50 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200" 
                  value={time} 
                  onChange={(e) => setTime(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-teal-500" />
                  Lieu
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-slate-200/50 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all duration-200 placeholder-slate-400" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  placeholder="Ex: Bureau, Zoom, Téléphone..." 
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowRescheduleForm(false)}
                className="flex-1 bg-white/60 backdrop-blur-sm border-slate-200/50 hover:bg-white/80 transition-all duration-200"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleReschedule}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg backdrop-blur-sm transition-all duration-200"
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

      {/* Cancel confirmation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 max-w-md w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100/50 to-rose-100/50 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Annuler l'entretien</h3>
                <p className="text-sm text-slate-600 mt-1">Voulez-vous vraiment annuler cet entretien ?</p>
              </div>
            </div>
            
            <div className="text-sm text-red-700 bg-gradient-to-br from-red-50/50 to-rose-50/50 p-4 rounded-xl mb-6 border border-red-200/50">
              <p className="font-bold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Attention
              </p>
              <p>Cela supprimera l'entretien planifié et remettra la candidature en statut "En attente".</p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 bg-white/60 backdrop-blur-sm border-slate-200/50 hover:bg-white/80 transition-all duration-200"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCancelInterview}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg backdrop-blur-sm transition-all duration-200"
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
