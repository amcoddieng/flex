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
    color: "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200", 
    textColor: "text-amber-800", 
    icon: Clock, 
    label: "En attente",
    description: "Candidature en cours d'examen",
    bgGradient: "from-amber-400 to-orange-500"
  },
  ACCEPTED: { 
    color: "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200", 
    textColor: "text-emerald-800", 
    icon: CheckCircle, 
    label: "Acceptée",
    description: "Candidature acceptée",
    bgGradient: "from-emerald-400 to-green-500"
  },
  REJECTED: { 
    color: "bg-gradient-to-r from-rose-50 to-red-50 border-rose-200", 
    textColor: "text-rose-800", 
    icon: XCircle, 
    label: "Rejetée",
    description: "Candidature rejetée",
    bgGradient: "from-rose-400 to-red-500"
  },
  INTERVIEW: { 
    color: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200", 
    textColor: "text-blue-800", 
    icon: Briefcase, 
    label: "Entretien",
    description: "Entretien programmé",
    bgGradient: "from-blue-400 to-indigo-500"
  },
};

// Composant moderne pour les items d'information
function ModernInfoItem({ 
  icon: Icon, 
  label, 
  value, 
  variant = "default",
  trend,
  badge 
}: { 
  icon: any; 
  label: string; 
  value: string; 
  variant?: "default" | "compact" | "elevated";
  trend?: "up" | "down" | "neutral";
  badge?: string;
}) {
  const baseClasses = "group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl";
  
  const variantClasses = {
    default: "bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-4",
    compact: "bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-sm rounded-xl border border-white/10 shadow-md p-3",
    elevated: "bg-gradient-to-br from-white to-white/70 backdrop-blur-md rounded-3xl border border-white/30 shadow-2xl p-6"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-center gap-4">
        {/* Icon container with animation */}
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          {trend && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center">
              {trend === "up" && <ArrowUp className="h-2 w-2 text-green-500" />}
              {trend === "down" && <ArrowDown className="h-2 w-2 text-red-500" />}
              {trend === "neutral" && <Minus className="h-2 w-2 text-gray-500" />}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
            {badge && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary transition-colors duration-300">
            {value}
          </p>
        </div>

        {/* Hover effect indicator */}
        <div className="absolute inset-0 rounded-inherit border-2 border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </div>
  );
}

// Composant de statistique moderne
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = "blue",
  size = "default"
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: { value: number; label: string };
  color?: "blue" | "green" | "amber" | "purple" | "red";
  size?: "compact" | "default" | "large";
}) {
  const colorGradients = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    amber: "from-amber-500 to-orange-500",
    purple: "from-purple-500 to-pink-500",
    red: "from-red-500 to-rose-500"
  };

  const sizeClasses = {
    compact: "p-3",
    default: "p-4",
    large: "p-6"
  };

  return (
    <div className={`group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] ${sizeClasses[size]}`}>
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorGradients[color]} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorGradients[color]} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${
              trend.value > 0 ? 'text-green-600' : trend.value < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend.value > 0 && <ArrowUp className="h-3 w-3" />}
              {trend.value < 0 && <ArrowDown className="h-3 w-3" />}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        
        <div>
          <p className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300">
            {value}
          </p>
          <p className="text-sm text-gray-600 mt-1">{title}</p>
          {trend && (
            <p className="text-xs text-gray-500 mt-1">{trend.label}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ApplicationDetailModalRedesigned({
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
      <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-50 to-white border-0 shadow-2xl">
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header ultra-moderne */}
          <DialogHeader className="pb-8 border-b border-gray-200/20 flex-shrink-0 bg-gradient-to-br from-white via-white to-gray-50/50">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4 truncate">
                  {application.job_title}
                </DialogTitle>
                
                {/* Quick stats */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(application.applied_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Candidat</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {student.first_name} {student.last_name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status badge with animation */}
              <div className="flex flex-col items-end gap-3">
                <div className={`relative group`}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${config.bgGradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300`} />
                  <Badge className={`relative bg-gradient-to-r ${config.bgGradient} text-white border-0 px-6 py-3 text-sm font-bold shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}>
                    <StatusIcon className="h-5 w-5 mr-2 animate-pulse" />
                    {config.label}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 text-right">{config.description}</p>
              </div>
            </div>
          </DialogHeader>

          {/* Content scrollable avec design moderne */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 bg-gradient-to-b from-gray-50/50 to-white">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-primary/50 blur-xl opacity-50 animate-pulse" />
                </div>
              </div>
            ) : (
              <>
                {/* Section Profil Candidat - Design ultra-moderne */}
                <section className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-gray-50 rounded-3xl border border-gray-200/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01]">
                  {/* Background decoration */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Section header */}
                  <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 animate-pulse delay-300" />
                    
                    <h3 className="relative text-2xl font-bold text-white flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-float">
                        <User className="h-7 w-7 text-white" />
                      </div>
                      <span className="truncate">Profil du Candidat</span>
                    </h3>
                  </div>
                  
                  <div className="relative p-6 space-y-6">
                    {/* Profile card */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                      <div className="flex items-center gap-6 mb-6">
                        {/* Avatar */}
                        <div className="relative group">
                          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                            {student.first_name?.charAt(0).toUpperCase()}{student.last_name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                          <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-green-500 border-3 border-white shadow-lg" />
                        </div>
                        
                        {/* Name and title */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-2xl font-bold text-gray-900 truncate mb-2">
                            {student.first_name} {student.last_name}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              <span className="truncate">{student.email}</span>
                            </div>
                            {student.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                <span>{student.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="rounded-xl border-2 hover:bg-primary/5">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-xl border-2 hover:bg-primary/5">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <ModernInfoItem 
                        icon={GraduationCap} 
                        label="Études" 
                        value={student.year_of_study ? `Année ${student.year_of_study}` : "Non spécifié"} 
                        badge="Académique"
                      />
                      <ModernInfoItem 
                        icon={Building} 
                        label="Université" 
                        value={student.university || "Non spécifié"} 
                        badge="Institution"
                      />
                      <ModernInfoItem 
                        icon={Award} 
                        label="Département" 
                        value={student.department || "Non spécifié"} 
                        badge="Spécialité"
                      />
                    </div>

                    {/* Bio section */}
                    {student.bio && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/30 p-6">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                            <FileText className="h-4 w-4" />
                          </div>
                          <span>À propos</span>
                        </h4>
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-200/20">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {student.bio}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {student.skills && student.skills.length > 0 && (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200/30 p-6">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                            <Star className="h-4 w-4" />
                          </div>
                          <span>Compétences</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {student.skills.map((skill: string, idx: number) => (
                            <Badge 
                              key={idx} 
                              className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 border-purple-300/50 px-3 py-1.5 rounded-xl font-medium hover:scale-105 transition-transform duration-200"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Section Détails de la candidature - Design moderne */}
                <section className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-emerald-50 rounded-3xl border border-emerald-200/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01]">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
                    <h3 className="relative text-2xl font-bold text-white flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-float">
                        <Briefcase className="h-7 w-7 text-white" />
                      </div>
                      <span className="truncate">Détails de la Candidature</span>
                    </h3>
                  </div>
                  
                  <div className="relative p-6 space-y-6">
                    {/* Message */}
                    {application.message && (
                      <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl border border-emerald-200/30 p-6 shadow-lg">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          <span>Message du candidat</span>
                        </h4>
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/20">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {application.message}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {application.experience && (
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/30 p-6 shadow-lg">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                            <Award className="h-4 w-4" />
                          </div>
                          <span>Expérience</span>
                        </h4>
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-amber-200/20">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {application.experience}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Date and availability */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {application.start_date && (
                        <ModernInfoItem 
                          icon={Calendar} 
                          label="Date de début" 
                          value={new Date(application.start_date).toLocaleDateString("fr-FR")} 
                          variant="elevated"
                        />
                      )}
                      {application.availability && (
                        <ModernInfoItem 
                          icon={Clock} 
                          label="Disponibilité" 
                          value={application.availability} 
                          variant="elevated"
                        />
                      )}
                    </div>
                  </div>
                </section>

                {/* Section Entretien - Si applicable */}
                {application.status === "INTERVIEW" && (
                  <section className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-blue-50 rounded-3xl border border-blue-200/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01]">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 overflow-hidden">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
                      <h3 className="relative text-2xl font-bold text-white flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-float">
                          <Calendar className="h-7 w-7 text-white" />
                        </div>
                        <span className="truncate">Entretien Programmé</span>
                      </h3>
                    </div>
                    
                    <div className="relative p-6 space-y-4">
                      {application.interview_date && (
                        <ModernInfoItem 
                          icon={Calendar} 
                          label="Date et heure" 
                          value={`${new Date(application.interview_date).toLocaleDateString("fr-FR")}${application.interview_time ? ` à ${application.interview_time}` : ''}`} 
                        />
                      )}
                      {application.interview_location && (
                        <ModernInfoItem 
                          icon={MapPin} 
                          label="Lieu" 
                          value={application.interview_location} 
                        />
                      )}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>

          {/* Footer moderne avec actions */}
          <div className="border-t border-gray-200/20 bg-gradient-to-r from-gray-50 to-white px-6 py-6 flex-shrink-0">
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
                  className="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-3 rounded-2xl"
                  disabled={conversationLoading}
                >
                  {conversationLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      <span>Ouverture...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-5 w-5 mr-3" />
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

// Composants pour les actions (maintenir les mêmes mais avec style amélioré)
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
        <div className="flex gap-3">
          <Button 
            onClick={() => onUpdateStatus(application.id, "ACCEPTED")}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Accepter
          </Button>
          <Button 
            onClick={() => onUpdateStatus(application.id, "REJECTED")}
            className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Rejeter
          </Button>
          <Button 
            onClick={() => setShowInterviewForm(true)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Entretien
          </Button>
        </div>
      ) : (
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/30 p-6 shadow-lg">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
              <Calendar className="h-4 w-4" />
            </div>
            <span>Programmer un entretien</span>
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heure</label>
              <input 
                type="time" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lieu</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="Ex: Bureau, Zoom, Téléphone..." 
              />
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={handleInterviewConfirm}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl"
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
                className="flex-1 border-2 border-gray-300 hover:bg-gray-50 transition-all duration-300 hover:scale-105 rounded-2xl"
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

// Maintenir les autres composants ActionButtons avec le même style amélioré...
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
      <div className="flex-1 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200/30 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white animate-pulse">
            <CheckCircle className="h-5 w-5" />
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
          className="w-full border-2 border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 transition-all duration-300 hover:scale-105 rounded-2xl"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Annuler l'acceptation
        </Button>
      </div>

      {/* Confirmation dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/30 p-6 max-w-md w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center animate-pulse">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Annuler l'acceptation</h3>
                <p className="text-sm text-gray-600 mt-1">Voulez-vous vraiment annuler cette acceptation ?</p>
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
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 border-2 border-gray-300 hover:bg-gray-50 transition-all duration-300 hover:scale-105 rounded-2xl"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCancelAcceptance}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl"
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
      <div className="flex-1 bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl border border-rose-200/30 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center text-white">
            <XCircle className="h-5 w-5" />
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
          className="w-full border-2 border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 transition-all duration-300 hover:scale-105 rounded-2xl"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Annuler le rejet
        </Button>
      </div>

      {/* Confirmation dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/30 p-6 max-w-md w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center animate-pulse">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Annuler le rejet</h3>
                <p className="text-sm text-gray-600 mt-1">Voulez-vous vraiment annuler ce rejet ?</p>
              </div>
            </div>
            
            <div className="text-sm text-amber-700 bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-2xl mb-6 border border-amber-200">
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
                className="flex-1 border-2 border-gray-300 hover:bg-gray-50 transition-all duration-300 hover:scale-105 rounded-2xl"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCancelRejection}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl"
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
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/30 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white animate-pulse">
            <Briefcase className="h-5 w-5" />
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
            className="flex-1 border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300 hover:scale-105 rounded-2xl"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reprogrammer
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowCancelConfirm(true)}
            className="flex-1 border-2 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 transition-all duration-300 hover:scale-105 rounded-2xl"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Annuler
          </Button>
        </div>
      </div>

      {/* Reschedule form */}
      {showRescheduleForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/30 p-6 max-w-md w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Reprogrammer l'entretien</h3>
                <p className="text-sm text-gray-600 mt-1">Modifiez les détails de l'entretien</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heure</label>
                <input 
                  type="time" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                  value={time} 
                  onChange={(e) => setTime(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lieu</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
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
                className="flex-1 border-2 border-gray-300 hover:bg-gray-50 transition-all duration-300 hover:scale-105 rounded-2xl"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleReschedule}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/30 p-6 max-w-md w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Annuler l'entretien</h3>
                <p className="text-sm text-gray-600 mt-1">Voulez-vous vraiment annuler cet entretien ?</p>
              </div>
            </div>
            
            <div className="text-sm text-red-700 bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-2xl mb-6 border border-red-200">
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
                className="flex-1 border-2 border-gray-300 hover:bg-gray-50 transition-all duration-300 hover:scale-105 rounded-2xl"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCancelInterview}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl"
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
