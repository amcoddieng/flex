"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
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
  Building,
  Award,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Download,
  CreditCard,
  BookOpen
} from "lucide-react";

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

export default function StudentProfilePage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<StudentProfile>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const hasCheckedAuth = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleCancel = () => {
    setFormData(profile || {});
    setEditMode(false);
    setError(null);
    setSuccess(null);
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez uploader une image');
      return;
    }

    const formData = new FormData();
    formData.append('profile_photo', file);

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
        setFormData(prev => ({ ...prev, profile_photo: data.profile_photo }));
        setSuccess('Photo de profil mise à jour avec succès');
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

  if (!isAuthed) {
    return <div className="p-8">Vérification...</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
          <p className="text-gray-600">Gérez vos informations personnelles</p>
        </div>
        <div className="flex items-center gap-3">
          {editMode ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2"
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
            </>
          ) : (
            <Button
              onClick={() => setEditMode(true)}
              className="gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Modifier
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6">
          {/* Profile Header */}
          <div className="flex items-start gap-6 mb-8">
            <div className="relative">
              {profile?.profile_photo ? (
                <img 
                  src={profile.profile_photo} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                  {profile?.first_name?.charAt(0).toUpperCase()}{profile?.last_name?.charAt(0).toUpperCase()}
                </div>
              )}
              {editMode && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors border-2 border-white"
                >
                  <Camera className="h-5 w-5" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePhotoUpload}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  {profile?.first_name} {profile?.last_name}
                </h2>
                {profile?.validation_status && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile.validation_status === 'VALIDATED' 
                      ? 'bg-green-100 text-green-700' 
                      : profile.validation_status === 'REJECTED'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {profile.validation_status === 'VALIDATED' && (
                      <><CheckCircle className="h-4 w-4 inline mr-1" />Validé</>
                    )}
                    {profile.validation_status === 'REJECTED' && (
                      <><XCircle className="h-4 w-4 inline mr-1" />Rejeté</>
                    )}
                    {profile.validation_status === 'PENDING' && (
                      <><Clock className="h-4 w-4 inline mr-1" />En attente</>
                    )}
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-3">{profile?.email}</p>
              
              {/* University and Department */}
              {(profile?.university || profile?.department) && (
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  {profile?.university && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>{profile.university}</span>
                    </div>
                  )}
                  {profile?.department && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>{profile.department}</span>
                    </div>
                  )}
                  {profile?.year_of_study && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>{profile.year_of_study}ème année</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Contact Info */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {profile?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile?.hourly_rate && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>{profile.hourly_rate}/heure</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-8 w-8" />
                </div>
                {profile?.student_card_pdf ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => window.open(profile.student_card_pdf, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                ) : editMode ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                ) : (
                  <p className="text-blue-100 text-sm">Non uploadée</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Biographie</h3>
          {editMode ? (
            <textarea
              value={formData.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Parlez-vous en quelques mots..."
            />
          ) : (
            <p className="text-gray-600 leading-relaxed">
              {profile?.bio || 'Aucune biographie renseignée.'}
            </p>
          )}
        </div>

        {/* Skills Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compétences</h3>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(profile?.skills) 
              ? profile.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {skill}
                  </span>
                ))
              : typeof profile?.skills === 'string' && profile.skills.trim()
                ? profile.skills.split(',').map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {skill.trim()}
                    </span>
                  ))
                : (
                  <span className="text-gray-500 text-sm">Aucune compétence renseignée</span>
                )
            }
          </div>
        </div>

        {/* Edit Mode Form */}
        {editMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  value={formData.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations académiques</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Université</label>
                <input
                  type="text"
                  value={formData.university || ''}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                <input
                  type="text"
                  value={formData.department || ''}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Année d'étude</label>
                <select
                  value={formData.year_of_study || ''}
                  onChange={(e) => handleInputChange('year_of_study', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Sélectionner</option>
                  <option value="1">1ère année</option>
                  <option value="2">2ème année</option>
                  <option value="3">3ème année</option>
                  <option value="4">4ème année</option>
                  <option value="5">5ème année</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Taux horaire (MAD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.hourly_rate || ''}
                  onChange={(e) => handleInputChange('hourly_rate', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

            </div>

            {/* Bio */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Biographie</h3>
              <textarea
                value={formData.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Parlez-vous en quelques mots..."
              />
            </div>

            {/* Skills */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Compétences</h3>
              <textarea
                value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills || ''}
                onChange={(e) => handleInputChange('skills', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Séparez les compétences par des virgules..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
