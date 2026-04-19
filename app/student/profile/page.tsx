"use client";

// ========================================
// SECTION 1: IMPORTS ET DÉPENDANCES
// ========================================
// Imports React et hooks nécessaires
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  GraduationCap,
  Briefcase,
  FileText,
  Edit2,
  Save,
  X,
  Camera,
  Upload,
  Settings,
  Building,
  Award,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Download,
  CreditCard,
  BookOpen,
  AlertCircle
} from "lucide-react";

// ========================================
// SECTION 2: INTERFACE ET TYPES
// ========================================
// Définition du type pour les données du profil étudiant
interface StudentProfile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  phone?: string;
  email: string;
  university?: string;
  department?: string;
  year_of_study?: number;
  bio?: string;
  skills?: string[] | string;
  availability?: any;
  services?: any;
  hourly_rate?: number;
  profile_photo?: string;
  student_card_pdf?: string;
  validation_status?: 'PENDING' | 'VALIDATED' | 'REJECTED';
  rejection_reason?: string;
  created_at: string;
  updated_at?: string;
}

// ========================================
// SECTION 3: COMPOSANT PRINCIPAL - ÉTATS ET RÉFÉRENCES
// ========================================
export default function StudentProfilePage() {
  // États d'authentification et chargement
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // États du profil et formulaire
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<StudentProfile>>({});
  
  // Références et navigation
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  // ========================================
// SECTION 4: FONCTIONS UTILITAIRES ET AUTHENTIFICATION
// ========================================
// Validation et récupération du token JWT
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

// ========================================
// SECTION 5: EFFECTS ET CYCLE DE VIE
// ========================================
// Hook d'effet pour l'authentification au chargement
useEffect(() => {
  if (hasCheckedAuth.current) return;
  hasCheckedAuth.current = true;

  const token = getValidToken();
  if (!token) {
    router.push('/login');
    return;
  }
  setIsAuthed(true);
  fetchProfile();
}, [router]);

// ========================================
// SECTION 6: FONCTIONS API - RÉCUPÉRATION DES DONNÉES
// ========================================
// Récupération des données du profil depuis l'API
const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getValidToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/student/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error('Erreur lors de la récupération du profil');
      }

      const data = await res.json();
      if (data.success) {
        // Adapter les données de l'API au format attendu par le frontend
        const adaptedProfile = {
          id: data.student.id,
          user_id: data.student.userId,
          first_name: data.student.firstName,
          last_name: data.student.lastName,
          email: data.student.email,
          phone: data.student.phone,
          university: data.student.university,
          department: data.student.department,
          year_of_study: data.student.yearOfStudy,
          bio: data.student.bio,
          skills: data.student.skills,
          availability: data.student.availability,
          services: data.student.services,
          hourly_rate: data.student.hourlyRate,
          profile_photo: data.student.profilePhoto,
          student_card_pdf: data.student.studentCardPdf,
          validation_status: data.student.validationStatus,
          rejection_reason: data.student.rejectionReason,
          created_at: data.student.createdAt
        };
        
        setProfile(adaptedProfile);
        setFormData(adaptedProfile);
      } else {
        throw new Error(data.error || 'Réponse invalide');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('fetchProfile error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof StudentProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ========================================
// SECTION 7: FONCTIONS DE GESTION DU PROFIL
// ========================================
// Sauvegarde des modifications du profil
const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const token = getValidToken();
      if (!token) return;

      // Adapter les données pour l'API
      const apiData = {
        firstName: formData.first_name,
        lastName: formData.last_name,
        phone: formData.phone,
        university: formData.university,
        department: formData.department,
        yearOfStudy: formData.year_of_study,
        bio: formData.bio,
        skills: formData.skills,
        availability: formData.availability,
        services: formData.services,
        hourlyRate: formData.hourly_rate
      };

      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      
      if (!res.ok) {
        throw new Error('Erreur lors de la mise à jour du profil');
      }

      const data = await res.json();
      if (data.success) {
        setSuccess('Profil mis à jour avec succès');
        setEditMode(false);
        // Rafraîchir les données du profil
        fetchProfile();
      } else {
        throw new Error(data.error || 'Mise à jour échouée');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('handleSave error:', message);
      setError(message);
    } finally {
      setSaving(false);
    }
  };

// Annulation des modifications
const handleCancel = () => {
    setFormData(profile || {});
    setEditMode(false);
    setError(null);
    setSuccess(null);
  };

// ========================================
// SECTION 8: FONCTIONS D'UPLOAD DE FICHIERS
// ========================================
// Upload de la photo de profil
const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez uploader une image');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = getValidToken();
      if (!token) return;

      setSaving(true);
      const res = await fetch('/api/student/upload-profile-photo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, profile_photo: data.profilePhoto }));
        setSuccess('Photo de profil mise à jour avec succès');
        // Rafraîchir le profil pour obtenir la nouvelle photo
        fetchProfile();
      } else {
        throw new Error(data.error || 'Upload échoué');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleStudentCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Veuillez uploader une image ou un PDF');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = getValidToken();
      if (!token) return;

      setSaving(true);
      const res = await fetch('/api/student/upload-student-card', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, student_card_pdf: data.studentCardPdf }));
        setSuccess('Carte étudiante mise à jour avec succès');
        // Rafraîchir le profil pour obtenir la nouvelle carte
        fetchProfile();
      } else {
        throw new Error(data.error || 'Upload échoué');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Veuillez uploader un fichier PDF');
      return;
    }

    const formData = new FormData();
    formData.append('cv', file);

    try {
      const token = getValidToken();
      if (!token) return;

      setSaving(true);
      const res = await fetch('/api/student/upload-cv', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, cv_url: data.cv_url }));
        setSuccess('CV uploadé avec succès');
      } else {
        throw new Error(data.error || 'Upload échoué');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // ========================================
// SECTION 9: RENDU JSX - COMPOSANT PRINCIPAL
// ========================================
  // État de chargement - vérification authentification
  if (!isAuthed) {
    return <div className="p-8">Vérification...</div>;
  }

  // État de chargement - spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  // Rendu principal du composant
  return (
    <div className="">
      {/* ========================================
          SOUS-SECTION 9.1: HEADER DU PROFIL
          ======================================== */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">Mon Profil</h1>
            <p className="text-slate-600 text-sm mt-1">Gérez vos informations et préférences</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Settings className="h-3 w-3" />
              Paramètres
            </Button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-900 to-gray-900 flex items-center justify-center text-white text-sm font-semibold">
              {profile?.first_name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-gray-100 border border-gray-300 text-gray-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-gray-100 border border-gray-300 text-gray-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Modern Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Profile Photo */}
        <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Camera className="h-4 w-4 text-blue-600" />
              Photo de profil
            </h3>
            <span className="text-xs text-slate-500">JPEG, PNG</span>
          </div>
          <div className="space-y-4">
            <div className="relative group">
              {profile?.profile_photo ? (
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={profile.profile_photo}
                    alt="Profile"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center group hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200">
                  <Camera className="h-10 w-10 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  <p className="text-slate-600 mt-2 text-sm font-medium">Ajouter une photo</p>
                  <p className="text-xs text-slate-500 mt-1">Cliquez pour parcourir</p>
                </div>
              )}
              <input
                type="file"
                hidden
                id="upload-profile-photo"
                accept="image/*"
                onChange={handleProfilePhotoUpload}
              />
            </div>
            <Button 
              onClick={() => document.getElementById("upload-profile-photo")?.click()}
              className="w-full gap-2 text-sm"
              variant="outline"
              disabled={false}
            >
              <Upload className="h-4 w-4" />
              {profile?.profile_photo ? "Changer la photo" : "Ajouter une photo"}
            </Button>
          </div>
        </div>

        {/* Student Card */}
        <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-800" />
              Carte étudiante
            </h3>
            <span className="text-xs text-slate-500">PDF, JPEG</span>
          </div>
          <div className="space-y-4">
            <div className="relative group">
              {profile?.student_card_pdf ? (
                <div className="relative overflow-hidden rounded-xl">
                  {profile?.student_card_pdf.toLowerCase().endsWith('.pdf') ? (
                    // PDF - Afficher un aperçu avec lien
                    <div 
                      className="w-full h-48 bg-gradient-to-br from-red-50 to-orange-100 border-2 border-red-200 rounded-xl flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => window.open(profile.student_card_pdf, '_blank')}
                    >
                      <div className="text-center">
                        <FileText className="h-12 w-12 text-red-600 mx-auto mb-2" />
                        <p className="text-red-800 font-medium">Carte étudiante (PDF)</p>
                        <p className="text-red-600 text-xs">Cliquez pour ouvrir</p>
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="text-center text-white">
                          <FileText className="h-8 w-8 mx-auto mb-1" />
                          <p className="text-xs">Ouvrir dans un nouvel onglet</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Image - Afficher l'image directement
                    <div className="relative group">
                      <img
                        src={profile.student_card_pdf}
                        alt="Carte étudiante"
                        className="w-full h-48 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="text-center text-white">
                          <CreditCard className="h-8 w-8 mx-auto mb-1" />
                          <p className="text-xs">Cliquez pour agrandir</p>
                        </div>
                      </div>
                      <div 
                        className="absolute inset-0 cursor-pointer"
                        onClick={() => window.open(profile.student_card_pdf, '_blank')}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-48 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center group hover:border-gray-400 hover:bg-gray-50/30 transition-all duration-200">
                  <CreditCard className="h-10 w-10 text-slate-400 group-hover:text-gray-800 transition-colors" />
                  <p className="text-slate-600 mt-2 text-sm font-medium">Ajouter votre carte</p>
                  <p className="text-xs text-slate-500 mt-1">Carte d'identité étudiante</p>
                </div>
              )}
              <input
                type="file"
                hidden
                id="upload-student-card"
                accept="image/*,.pdf"
                onChange={handleStudentCardUpload}
              />
            </div>
            <Button 
              onClick={() => document.getElementById("upload-student-card")?.click()}
              className="w-full gap-2 text-sm text-gray-800 hover:text-gray-900 border-gray-300"
              variant="outline"
              disabled={false}
            >
              <Upload className="h-4 w-4 text-gray-800" />
              {profile?.student_card_pdf ? "Changer la carte" : "Ajouter une carte"}
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200/50 p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-gray-900 to-gray-900 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            Informations du profil
          </h3>
          {!editMode && (
            <Button 
              onClick={() => setEditMode(true)}
              className="gap-2 text-sm"
              variant="outline"
            >
              <Edit2 className="h-3 w-3" />
              Modifier
            </Button>
          )}
        </div>

        {/* ========================================
            SECTION STATUT DE VALIDATION DU PROFIL
            ======================================== */}
        <div className="mb-6 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {profile?.validation_status === 'VALIDATED' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Profil validé</span>
                </>
              ) : profile?.validation_status === 'PENDING' ? (
                <>
                  <Clock className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">Profil en attente de validation</span>
                </>
              ) : profile?.validation_status === 'REJECTED' ? (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-red-700">Profil rejeté</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Statut inconnu</span>
                </>
              )}
            </div>
          </div>
          
          {/* Message d'instructions selon le statut */}
          <div className="mt-3 text-sm text-gray-600">
            {profile?.validation_status === 'VALIDATED' ? (
              <p className="text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                ✅ Votre profil est validé ! Vous pouvez maintenant postuler aux offres d'emploi.
              </p>
            ) : profile?.validation_status === 'PENDING' ? (
              <p className="text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                ⏳ Votre profil est en cours de validation. Un administrateur examinera vos informations dans les plus brefs délais.
              </p>
            ) : profile?.validation_status === 'REJECTED' ? (
              <p className="text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                ❌ Votre profil a été rejeté. {profile?.rejection_reason ? `Raison : ${profile.rejection_reason}` : 'Veuillez contacter l\'administrateur pour plus d\'informations.'}
              </p>
            ) : (
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                ⚠️ Statut de validation non disponible. Veuillez actualiser la page.
              </p>
            )}
          </div>
        </div>

        {!editMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="group p-4 rounded-lg border border-slate-200/50 hover:border-gray-300 hover:bg-gray-50/30 transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-gray-800" />
                <span className="text-sm font-medium text-slate-700">Email</span>
              </div>
              <p className="text-slate-900 font-medium">{profile?.email}</p>
            </div>

            <div className="group p-4 rounded-lg border border-slate-200/50 hover:border-gray-300 hover:bg-gray-50/30 transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4 text-gray-800" />
                <span className="text-sm font-medium text-slate-700">Université</span>
              </div>
              <p className="text-slate-900 font-medium">{profile?.university || 'Non spécifié'}</p>
            </div>

            <div className="group p-4 rounded-lg border border-slate-200/50 hover:border-gray-300 hover:bg-gray-50/30 transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-800" />
                <span className="text-sm font-medium text-slate-700">Nom complet</span>
              </div>
              <p className="text-slate-900 font-medium">{profile?.first_name} {profile?.last_name}</p>
            </div>

            <div className="group p-4 rounded-lg border border-slate-200/50 hover:border-gray-300 hover:bg-gray-50/30 transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-gray-800" />
                <span className="text-sm font-medium text-slate-700">Téléphone</span>
              </div>
              <p className="text-slate-900 font-medium">{profile?.phone || 'Non spécifié'}</p>
            </div>

            <div className="group p-4 rounded-lg border border-slate-200/50 hover:border-gray-300 hover:bg-gray-50/30 transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-gray-800" />
                <span className="text-sm font-medium text-slate-700">Taux horaire</span>
              </div>
              <p className="text-slate-900 font-medium">{profile?.hourly_rate || 'Non spécifié'} $/heure</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Prénom
                </label>
                <Input
                  value={formData.first_name || ""}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Prénom"
                  className="rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Nom
                </label>
                <Input
                  value={formData.last_name || ""}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Nom"
                  className="rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  Email
                </label>
                <Input
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email"
                  className="rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  Téléphone
                </label>
                <Input
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Numéro de téléphone"
                  className="rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                onClick={() => setEditMode(false)}
                variant="outline"
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>)}