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
  Upload
} from "lucide-react";

interface StudentProfile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  location?: string;
  bio?: string;
  education?: string;
  experience?: string;
  skills?: string;
  cv_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  created_at: string;
  updated_at: string;
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
        setProfile(data.data);
        setFormData(data.data);
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

      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) {
        throw new Error('Erreur lors de la mise à jour du profil');
      }

      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setFormData(data.data);
        setEditMode(false);
        setSuccess('Profil mis à jour avec succès');
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
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mon profil</h1>
          <p className="text-slate-600">Gérez vos informations personnelles</p>
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

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200/50 shadow-sm">
        <div className="p-6">
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {profile?.first_name?.charAt(0).toUpperCase()}{profile?.last_name?.charAt(0).toUpperCase()}
              </div>
              {editMode && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {profile?.first_name} {profile?.last_name}
              </h2>
              <p className="text-slate-600">{profile?.email}</p>
              {profile?.location && (
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Informations personnelles</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.first_name || ''}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="h-4 w-4" />
                    <span>{profile?.first_name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.last_name || ''}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="h-4 w-4" />
                    <span>{profile?.last_name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                {editMode ? (
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="h-4 w-4" />
                    <span>{profile?.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                {editMode ? (
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-4 w-4" />
                    <span>{profile?.phone || 'Non renseigné'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date de naissance</label>
                {editMode ? (
                  <input
                    type="date"
                    value={formData.birth_date || ''}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>{profile?.birth_date ? new Date(profile.birth_date).toLocaleDateString('fr-FR') : 'Non renseignée'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Informations professionnelles</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Localisation</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4" />
                    <span>{profile?.location || 'Non renseignée'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Formation</label>
                {editMode ? (
                  <textarea
                    value={formData.education || ''}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-start gap-2 text-slate-600">
                    <GraduationCap className="h-4 w-4 mt-0.5" />
                    <span className="whitespace-pre-wrap">{profile?.education || 'Non renseignée'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expérience</label>
                {editMode ? (
                  <textarea
                    value={formData.experience || ''}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-start gap-2 text-slate-600">
                    <Briefcase className="h-4 w-4 mt-0.5" />
                    <span className="whitespace-pre-wrap">{profile?.experience || 'Non renseignée'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Compétences</label>
                {editMode ? (
                  <textarea
                    value={formData.skills || ''}
                    onChange={(e) => handleInputChange('skills', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-start gap-2 text-slate-600">
                    <FileText className="h-4 w-4 mt-0.5" />
                    <span className="whitespace-pre-wrap">{profile?.skills || 'Non renseignées'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
            {editMode ? (
              <textarea
                value={formData.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            ) : (
              <p className="text-slate-600 whitespace-pre-wrap">{profile?.bio || 'Aucune bio renseignée'}</p>
            )}
          </div>

          {/* Links */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CV</label>
              {editMode ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.cv_url || ''}
                    onChange={(e) => handleInputChange('cv_url', e.target.value)}
                    placeholder="URL du CV"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={saving}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              ) : (
                <div>
                  {profile?.cv_url ? (
                    <a
                      href={profile.cv_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4" />
                      Voir le CV
                    </a>
                  ) : (
                    <span className="text-slate-500 text-sm">Aucun CV uploadé</span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn</label>
              {editMode ? (
                <input
                  type="url"
                  value={formData.linkedin_url || ''}
                  onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                  placeholder="URL LinkedIn"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              ) : (
                <div>
                  {profile?.linkedin_url ? (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Voir LinkedIn
                    </a>
                  ) : (
                    <span className="text-slate-500 text-sm">Non renseigné</span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Portfolio</label>
              {editMode ? (
                <input
                  type="url"
                  value={formData.portfolio_url || ''}
                  onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                  placeholder="URL Portfolio"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              ) : (
                <div>
                  {profile?.portfolio_url ? (
                    <a
                      href={profile.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Voir Portfolio
                    </a>
                  ) : (
                    <span className="text-slate-500 text-sm">Non renseigné</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
