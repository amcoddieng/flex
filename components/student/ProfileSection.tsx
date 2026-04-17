import { useState } from "react";
import { UserInfo, Application } from "@/types/student";
import { 
  User, Mail, Phone, MapPin, GraduationCap, Calendar, 
  Award, Target, Briefcase, FileText, Edit2, Camera, 
  Download, Upload, Shield, Bell, Settings, LogOut,
  CheckCircle, Clock, Star, TrendingUp, Users, BookOpen,
  Heart, MessageSquare, ThumbsUp, Eye, DollarSign,
  Award as Trophy, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";

interface StudentProfileData {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  university: string;
  department: string;
  yearOfStudy: number;
  bio: string;
  skills: any[];
  availability: any;
  services: any[];
  hourlyRate: number;
  profilePhoto: string;
  studentCardPdf: string;
  validationStatus: string;
  rejectionReason: string;
  createdAt: string;
  accountCreatedAt: string;
  statistics: {
    applications: {
      total: number;
      accepted: number;
      pending: number;
      interview: number;
      rejected: number;
      successRate: number;
      responseRate: number;
      lastApplicationDate: string;
    };
    forum: {
      topicsCreated: number;
      repliesGiven: number;
      totalTopicLikes: number;
      totalReplyLikes: number;
    };
    notifications: {
      unreadCount: number;
    };
  };
  recentApplications: Array<{
    id: number;
    status: string;
    appliedAt: string;
    jobTitle: string;
    company: string;
  }>;
}

interface ProfileSectionProps {
  user: UserInfo;
  applications: Application[];
  profileData: StudentProfileData | null;
  loading: boolean;
  onUpdateProfile: (data: Partial<StudentProfileData>) => Promise<{ success: boolean; message?: string; error?: string }>;
  onLogout: () => void;
}

export function ProfileSection({ user, applications, profileData, loading, onUpdateProfile, onLogout }: ProfileSectionProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<StudentProfileData>>({});
  
  // États locaux pour les champs temporaires
  const [newSkill, setNewSkill] = useState("");
  const [newService, setNewService] = useState("");
  const [tempSkills, setTempSkills] = useState<string[]>([]);
  const [tempServices, setTempServices] = useState<string[]>([]);
  const [tempAvailability, setTempAvailability] = useState({
    weekdays: [] as string[],
    weekends: [] as string[]
  });

  // Use profile data if available, otherwise fall back to basic user info
  const profile = profileData || {
    firstName: user.name?.split(' ')[0] || '',
    lastName: user.name?.split(' ').slice(1).join(' ') || '',
    fullName: user.name || '',
    email: user.email || '',
    phone: '',
    university: '',
    department: '',
    yearOfStudy: 0,
    bio: '',
    skills: [],
    availability: {},
    services: [],
    hourlyRate: 0,
    profilePhoto: '',
    studentCardPdf: '',
    validationStatus: '',
    accountCreatedAt: new Date().toISOString(),
    statistics: {
      applications: {
        total: applications.length,
        accepted: applications.filter(a => a.status === "ACCEPTED").length,
        pending: applications.filter(a => a.status === "PENDING").length,
        interview: applications.filter(a => a.status === "INTERVIEW").length,
        rejected: applications.filter(a => a.status === "REJECTED").length,
        successRate: applications.length > 0 ? Math.round((applications.filter(a => a.status === "ACCEPTED").length / applications.length) * 100) : 0,
        responseRate: applications.length > 0 ? Math.round(((applications.filter(a => a.status === "ACCEPTED").length + applications.filter(a => a.status === "INTERVIEW").length) / applications.length) * 100) : 0,
        lastApplicationDate: ''
      },
      forum: {
        topicsCreated: 0,
        repliesGiven: 0,
        totalTopicLikes: 0,
        totalReplyLikes: 0
      },
      notifications: {
        unreadCount: 0
      }
    },
    recentApplications: []
  };

  const userInitials = profile.firstName && profile.lastName
    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    : user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const handleSaveProfile = async () => {
    // Préparer les données complètes à sauvegarder
    const completeData = {
      ...editData,
      skills: tempSkills.length > 0 ? tempSkills : (profile.skills || []),
      services: tempServices.length > 0 ? tempServices : (profile.services || []),
      availability: tempAvailability
    };
    
    const result = await onUpdateProfile(completeData);
    if (result.success) {
      setIsEditing(false);
      // Réinitialiser les états temporaires
      setNewSkill("");
      setNewService("");
      setTempSkills([]);
      setTempServices([]);
      setTempAvailability({ weekdays: [], weekends: [] });
    }
  };

  // Initialiser les états temporaires quand on passe en mode édition
  const startEditing = () => {
    setIsEditing(true);
    setEditData(profile);
    setTempSkills((profile.skills || []).map((skill: any) => typeof skill === 'string' ? skill : skill.name || skill));
    setTempServices((profile.services || []).map((service: any) => typeof service === 'string' ? service : service.name || service));
    setTempAvailability(profile.availability || { weekdays: [], weekends: [] });
  };

  const tabs = [
    { id: "overview", label: "Aperçu", icon: User },
    { id: "personal", label: "Infos personnelles", icon: Mail },
    { id: "academic", label: "Infos académiques", icon: GraduationCap },
    { id: "statistics", label: "Statistiques", icon: TrendingUp },
    { id: "activity", label: "Activité", icon: Clock },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mon profil</h1>
          <p className="text-sm text-slate-500">Gérez vos informations et suivez votre progression</p>
        </div>
        <div className="flex gap-2">
          {profile.statistics.notifications.unreadCount > 0 && (
            <div className="relative">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors">
                <Bell className="h-4 w-4" />
                {profile.statistics.notifications.unreadCount} notification{profile.statistics.notifications.unreadCount > 1 ? "s" : ""}
              </button>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </div>
          )}
          <button
            onClick={() => isEditing ? handleSaveProfile() : startEditing()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            {isEditing ? "Enregistrer" : "Modifier"}
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-r from-primary to-violet-600 rounded-3xl p-8 text-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-start gap-6">
            {/* Avatar section */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold border-2 border-white/30">
                {profile.profilePhoto ? (
                  <img 
                    src={profile.profilePhoto} 
                    alt="Profile" 
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  userInitials
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white text-primary rounded-full flex items-center justify-center hover:bg-white/90 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* User info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={editData.firstName || profile.firstName || ""}
                      onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                      className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Prénom"
                    />
                    <input
                      type="text"
                      value={editData.lastName || profile.lastName || ""}
                      onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                      className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Nom"
                    />
                  </div>
                  <input
                    type="email"
                    value={editData.email || profile.email || ""}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Votre email"
                  />
                  <input
                    type="tel"
                    value={editData.phone || profile.phone || ""}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Téléphone"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={editData.university || profile.university || ""}
                      onChange={(e) => setEditData({ ...editData, university: e.target.value })}
                      className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Université"
                    />
                    <input
                      type="text"
                      value={editData.department || profile.department || ""}
                      onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                      className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Département"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={editData.yearOfStudy || profile.yearOfStudy || ""}
                      onChange={(e) => setEditData({ ...editData, yearOfStudy: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Année d'étude"
                      min="1"
                      max="10"
                    />
                    <input
                      type="number"
                      value={editData.hourlyRate || profile.hourlyRate || ""}
                      onChange={(e) => setEditData({ ...editData, hourlyRate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Taux horaire (FCFA)"
                      min="0"
                      step="100"
                    />
                  </div>
                  <textarea
                    value={editData.bio || profile.bio || ""}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                    placeholder="Parlez-vous en quelques mots..."
                    rows={3}
                  />
                  
                  {/* Skills Section */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Compétences</label>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {tempSkills.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-medium flex items-center gap-1">
                            {skill}
                            <button
                              type="button"
                              onClick={() => {
                                const newSkills = tempSkills.filter((_, i) => i !== index);
                                setTempSkills(newSkills);
                              }}
                              className="ml-1 text-white/60 hover:text-white"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newSkill.trim()) {
                            setTempSkills([...tempSkills, newSkill.trim()]);
                            setNewSkill("");
                          }
                        }}
                        className="w-full px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                        placeholder="Ajouter une compétence et appuyer sur Entrée"
                      />
                    </div>
                  </div>
                  
                  {/* Services Section */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Services proposés</label>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {tempServices.map((service, index) => (
                          <span key={index} className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-medium flex items-center gap-1">
                            {service}
                            <button
                              type="button"
                              onClick={() => {
                                const newServices = tempServices.filter((_, i) => i !== index);
                                setTempServices(newServices);
                              }}
                              className="ml-1 text-white/60 hover:text-white"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newService.trim()) {
                            setTempServices([...tempServices, newService.trim()]);
                            setNewService("");
                          }
                        }}
                        className="w-full px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                        placeholder="Ajouter un service et appuyer sur Entrée"
                      />
                    </div>
                  </div>
                  
                  {/* Availability Section */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Disponibilité</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 text-sm text-white/80">
                        <input
                          type="checkbox"
                          checked={tempAvailability.weekdays.includes('morning')}
                          onChange={(e) => {
                            const weekdays = tempAvailability.weekdays;
                            const newWeekdays = e.target.checked 
                              ? [...weekdays, 'morning'] 
                              : weekdays.filter((d) => d !== 'morning');
                            setTempAvailability({ 
                              ...tempAvailability, 
                              weekdays: newWeekdays 
                            });
                          }}
                          className="w-4 h-4 text-primary"
                        />
                        Matin semaine
                      </label>
                      <label className="flex items-center gap-2 text-sm text-white/80">
                        <input
                          type="checkbox"
                          checked={tempAvailability.weekdays.includes('afternoon')}
                          onChange={(e) => {
                            const weekdays = tempAvailability.weekdays;
                            const newWeekdays = e.target.checked 
                              ? [...weekdays, 'afternoon'] 
                              : weekdays.filter((d) => d !== 'afternoon');
                            setTempAvailability({ 
                              ...tempAvailability, 
                              weekdays: newWeekdays 
                            });
                          }}
                          className="w-4 h-4 text-primary"
                        />
                        Après-midi semaine
                      </label>
                      <label className="flex items-center gap-2 text-sm text-white/80">
                        <input
                          type="checkbox"
                          checked={tempAvailability.weekends.includes('morning')}
                          onChange={(e) => {
                            const weekends = tempAvailability.weekends;
                            const newWeekends = e.target.checked 
                              ? [...weekends, 'morning'] 
                              : weekends.filter((d) => d !== 'morning');
                            setTempAvailability({ 
                              ...tempAvailability, 
                              weekends: newWeekends 
                            });
                          }}
                          className="w-4 h-4 text-primary"
                        />
                        Matin week-end
                      </label>
                      <label className="flex items-center gap-2 text-sm text-white/80">
                        <input
                          type="checkbox"
                          checked={tempAvailability.weekends.includes('afternoon')}
                          onChange={(e) => {
                            const weekends = tempAvailability.weekends;
                            const newWeekends = e.target.checked 
                              ? [...weekends, 'afternoon'] 
                              : weekends.filter((d) => d !== 'afternoon');
                            setTempAvailability({ 
                              ...tempAvailability, 
                              weekends: newWeekends 
                            });
                          }}
                          className="w-4 h-4 text-primary"
                        />
                        Après-midi week-end
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-white text-primary rounded-xl text-sm font-medium hover:bg-white/90 transition-colors"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditData({});
                        setNewSkill("");
                        setNewService("");
                        setTempSkills([]);
                        setTempServices([]);
                        setTempAvailability({ weekdays: [], weekends: [] });
                      }}
                      className="px-4 py-2 bg-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/30 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-3xl font-bold mb-2">{profile.fullName || user.name}</h2>
                  <p className="text-white/80 mb-4">{profile.email}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {profile.university || "Étudiant"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Inscrit depuis {new Date(profile.accountCreatedAt).getFullYear()}
                    </span>
                    {profile.validationStatus === "VALIDATED" && (
                      <span className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        Profil vérifié
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <p className="text-2xl font-bold">{profile.statistics.applications.total}</p>
                <p className="text-xs text-white/70">Candidatures</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <p className="text-2xl font-bold">{profile.statistics.applications.successRate}%</p>
                <p className="text-xs text-white/70">Succès</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <p className="text-2xl font-bold">{profile.statistics.applications.responseRate}%</p>
                <p className="text-xs text-white/70">Réponses</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">Aperçu du profil</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-blue-900">Informations personnelles</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-800">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-800">{profile.phone || "Non renseigné"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-800">Dakar, Sénégal</span>
                  </div>
                </div>
              </div>

              {/* Academic Info Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-emerald-900">Informations académiques</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <BookOpen className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-800">{profile.university || "Non renseigné"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Award className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-800">{profile.department || "Non renseigné"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-800">{profile.yearOfStudy ? `${profile.yearOfStudy}ème année` : "Non renseigné"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills & Services */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-2xl p-6 border border-violet-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-violet-900">Compétences</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.map((skill: any, index: number) => (
                      <span key={index} className="px-3 py-1 bg-violet-200 text-violet-800 rounded-full text-xs font-medium">
                        {typeof skill === 'string' ? skill : skill.name || skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-violet-600 text-sm">Aucune compétence renseignée</span>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-amber-900">Services</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.services && profile.services.length > 0 ? (
                    profile.services.map((service: any, index: number) => (
                      <span key={index} className="px-3 py-1 bg-amber-200 text-amber-800 rounded-full text-xs font-medium">
                        {typeof service === 'string' ? service : service.name || service}
                      </span>
                    ))
                  ) : (
                    <span className="text-amber-600 text-sm">Aucun service proposé</span>
                  )}
                </div>
                {profile.hourlyRate && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-amber-600" />
                    <span className="font-semibold text-amber-800">{profile.hourlyRate}$/heure</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Personal Info Tab */}
        {activeTab === "personal" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">Informations personnelles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Prénom</label>
                  <input
                    type="text"
                    value={profile.firstName || ""}
                    disabled
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nom</label>
                  <input
                    type="text"
                    value={profile.lastName || ""}
                    disabled
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profile.email || ""}
                    disabled
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={profile.phone || ""}
                    disabled
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Adresse</label>
                  <input
                    type="text"
                    value="Dakar, Sénégal"
                    disabled
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value="linkedin.com/in/monprofil"
                    disabled
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Academic Tab */}
        {activeTab === "academic" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">Informations académiques</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Université</label>
                  <input
                    type="text"
                    value={profile.university || ""}
                    disabled
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Département</label>
                  <input
                    type="text"
                    value={profile.department || ""}
                    disabled
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Année d'étude</label>
                  <input
                    type="number"
                    value={profile.yearOfStudy || ""}
                    disabled
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Biographie</label>
                  <textarea
                    value={profile.bio || ""}
                    disabled
                    rows={4}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === "statistics" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">Statistiques détaillées</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-primary to-violet-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm font-medium">Total candidatures</span>
                </div>
                <p className="text-3xl font-bold">{profile.statistics.applications.total}</p>
                <p className="text-xs text-white/70 mt-1">Depuis le début</p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="h-6 w-6" />
                  <span className="text-sm font-medium">Acceptées</span>
                </div>
                <p className="text-3xl font-bold">{profile.statistics.applications.accepted}</p>
                <p className="text-xs text-white/70 mt-1">Offres obtenues</p>
              </div>
              
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-6 w-6" />
                  <span className="text-sm font-medium">En attente</span>
                </div>
                <p className="text-3xl font-bold">{profile.statistics.applications.pending}</p>
                <p className="text-xs text-white/70 mt-1">En cours</p>
              </div>
              
              <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="h-6 w-6" />
                  <span className="text-sm font-medium">Entretiens</span>
                </div>
                <p className="text-3xl font-bold">{profile.statistics.applications.interview}</p>
                <p className="text-xs text-white/70 mt-1">Programmés</p>
              </div>
            </div>

            {/* Success Metrics */}
            <div className="bg-slate-50 rounded-2xl p-6">
              <h4 className="font-semibold text-slate-800 mb-4">Métriques de performance</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Taux de succès</span>
                    <span className="font-medium text-slate-800">{profile.statistics.applications.successRate}%</span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000"
                      style={{ width: `${profile.statistics.applications.successRate}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Taux de réponse</span>
                    <span className="font-medium text-slate-800">{profile.statistics.applications.responseRate}%</span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
                      style={{ width: `${profile.statistics.applications.responseRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Forum Statistics */}
            <div className="bg-slate-50 rounded-2xl p-6">
              <h4 className="font-semibold text-slate-800 mb-4">Activité forum</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{profile.statistics.forum.topicsCreated}</p>
                  <p className="text-xs text-slate-500">Sujets créés</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{profile.statistics.forum.repliesGiven}</p>
                  <p className="text-xs text-slate-500">Réponses données</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{profile.statistics.forum.totalTopicLikes}</p>
                  <p className="text-xs text-slate-500">Likes sujets</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{profile.statistics.forum.totalReplyLikes}</p>
                  <p className="text-xs text-slate-500">Likes réponses</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">Historique d'activité</h3>
            
            <div className="space-y-4">
              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                
                {(profile.recentApplications || []).map((app: any, index: number) => (
                  <div key={app.id} className="relative flex items-start gap-4 pb-6">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center z-10",
                      app.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-600" :
                      app.status === "INTERVIEW" ? "bg-violet-100 text-violet-600" :
                      app.status === "REJECTED" ? "bg-red-100 text-red-600" :
                      "bg-amber-100 text-amber-600"
                    )}>
                      {app.status === "ACCEPTED" ? <CheckCircle className="h-4 w-4" /> :
                       app.status === "INTERVIEW" ? <Star className="h-4 w-4" /> :
                       app.status === "REJECTED" ? <Clock className="h-4 w-4" /> :
                       <FileText className="h-4 w-4" />}
                    </div>
                    
                    <div className="flex-1 bg-slate-50 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-slate-800">{app.jobTitle}</p>
                          <p className="text-sm text-slate-500">{app.company}</p>
                        </div>
                        <StatusBadge status={app.status as any} />
                      </div>
                      <p className="text-xs text-slate-400">
                        {new Date(app.appliedAt).toLocaleDateString("fr-FR", { 
                          day: "numeric", 
                          month: "long", 
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {(!profile.recentApplications || profile.recentApplications.length === 0) && (
                  <div className="text-center py-8 text-slate-400">
                    <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>Aucune activité récente</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">Paramètres du compte</h3>
            
            <div className="space-y-4">
              {/* Notification Settings */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <h4 className="font-medium text-slate-800 mb-4">Notifications</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Email pour nouvelles candidatures</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-primary" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Email pour les réponses</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-primary" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Notifications push</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-primary" />
                  </label>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <h4 className="font-medium text-slate-800 mb-4">Confidentialité</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Profil visible par les recruteurs</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-primary" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Partager les statistiques</span>
                    <input type="checkbox" className="w-4 h-4 text-primary" />
                  </label>
                </div>
              </div>

              {/* Account Actions */}
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" />
                  Exporter mes données
                </button>
                <button className="w-full px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" />
                  Changer le mot de passe
                </button>
                {profile.studentCardPdf && (
                  <button className="w-full px-4 py-3 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
                    <Upload className="h-4 w-4" />
                    Télécharger ma carte étudiante
                  </button>
                )}
                <button 
                  onClick={onLogout}
                  className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
