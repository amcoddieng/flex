"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, User, Building2, Phone, Mail, MapPin, FileText, Shield, Settings, Bell, Lock, Save, X, Edit3, Check, AlertCircle, TrendingUp, Award, Clock } from "lucide-react";

export default function EmployerProfilePage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<any>(null);
  const [showImageConfirmDialog, setShowImageConfirmDialog] = useState(false);
  const [pendingImageUpload, setPendingImageUpload] = useState<{ type: "img" | "identity"; file: File } | null>(null);
  const [uploading, setUploading] = useState<{ img?: boolean; identity?: boolean }>({});
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  const getValidToken = (): string | null => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("token");
    if (!token) return null;
    const decoded = decodeToken(token);
    if (!decoded || decoded.role !== "EMPLOYER") {
      localStorage.removeItem("token");
      return null;
    }
    return token;
  };

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const token = getValidToken();
    if (!token) {
      router.push("/login");
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
        router.push("/login");
        return;
      }

      const res = await fetch("/api/employer/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erreur lors de la récupération du profil");

      const data = await res.json();
      setProfile(data.data);
      setFormData(data.data);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getValidToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/employer/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pendingChanges),
      });

      if (!res.ok) throw new Error("Erreur mise à jour");

      setProfile(pendingChanges);
      setFormData(pendingChanges);
      setEditing(false);
      setShowConfirmDialog(false);
      setPendingChanges(null);
      setSuccess("Profil mis à jour avec succès");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPendingChanges(formData);
    setShowConfirmDialog(true);
  };

  const handleConfirmImageUpload = async () => {
    if (!pendingImageUpload) return;

    const { type, file } = pendingImageUpload;
    setUploading({ ...uploading, [type]: true });
    setError(null);
    setSuccess(null);

    try {
      const token = getValidToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("type", type);

      const res = await fetch("/api/employer/profile/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      });

      if (!res.ok) throw new Error("Erreur upload");

      const data = await res.json();
      const url = data.data.url;

      // Save the image URL to the database
      const updateRes = await fetch("/api/employer/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [type]: url }),
      });

      if (!updateRes.ok) throw new Error("Erreur sauvegarde en base de données");

      const updatedProfile = { ...profile, [type]: url };
      setProfile(updatedProfile);
      setFormData(updatedProfile);
      setSuccess(`${type === 'img' ? 'Photo de profil' : 'Carte d\'identité'} mise à jour et sauvegardée`);
      setShowImageConfirmDialog(false);
      setPendingImageUpload(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Erreur upload");
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "img" | "identity"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingImageUpload({ type, file });
    setShowImageConfirmDialog(true);
  };

  if (!isAuthed) return <div className="p-8">Vérification...</div>;
  if (!profile) return <div className="p-8">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">Mon Profil</h1>
              <p className="text-slate-600 text-sm mt-1">Gérez vos informations et préférences</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <Settings className="h-3 w-3" />
                Paramètres
              </Button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                {profile?.company_name?.charAt(0)?.toUpperCase() || 'E'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3">
            <Check className="h-5 w-5" />
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
            <span className="text-xs text-slate-500">JPEG, PNG • Max 5MB</span>
          </div>
          <div className="space-y-4">
            <div className="relative group">
              {profile.img ? (
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={profile.img}
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
                id="upload-img"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "img")}
              />
            </div>
            <Button 
              onClick={() => document.getElementById("upload-img")?.click()}
              className="w-full gap-2 text-sm"
              variant="outline"
              disabled={uploading.img}
            >
              {uploading.img ? (
                <>
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {profile.img ? "Changer la photo" : "Ajouter une photo"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Identity Document */}
        <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              Carte d'identité
            </h3>
            <span className="text-xs text-slate-500">PDF, JPEG • Max 10MB</span>
          </div>
          <div className="space-y-4">
            <div className="relative group">
              {profile.identity ? (
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={profile.identity}
                    alt="Identity"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center group hover:border-green-400 hover:bg-green-50/30 transition-all duration-200">
                  <FileText className="h-10 w-10 text-slate-400 group-hover:text-green-600 transition-colors" />
                  <p className="text-slate-600 mt-2 text-sm font-medium">Ajouter un document</p>
                  <p className="text-xs text-slate-500 mt-1">Carte d'identité ou passeport</p>
                </div>
              )}
              <input
                type="file"
                hidden
                id="upload-identity"
                accept="image/*,.pdf"
                onChange={(e) => handleImageUpload(e, "identity")}
              />
            </div>
            <Button 
              onClick={() => document.getElementById("upload-identity")?.click()}
              className="w-full gap-2 text-sm"
              variant="outline"
              disabled={uploading.identity}
            >
              {uploading.identity ? (
                <>
                  <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {profile.identity ? "Changer le document" : "Ajouter un document"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Information */}
        <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              Informations du profil
            </h3>
            {!editing && (
              <Button 
                onClick={() => setEditing(true)}
                className="gap-2 text-sm"
                variant="outline"
              >
                <Edit3 className="h-3 w-3" />
                Modifier
              </Button>
            )}
          </div>

          {!editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="group p-3 rounded-lg border border-slate-200/50 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-medium text-slate-700">Email</span>
                  </div>
                  <p className="text-slate-900 text-sm font-medium">{profile.email}</p>
                </div>

                <div className="group p-3 rounded-lg border border-slate-200/50 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-medium text-slate-700">Entreprise</span>
                  </div>
                  <p className="text-slate-900 text-sm font-medium">{profile.company_name || 'Non spécifié'}</p>
                </div>

                <div className="group p-3 rounded-lg border border-slate-200/50 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-medium text-slate-700">Contact</span>
                  </div>
                  <p className="text-slate-900 text-sm font-medium">{profile.contact_person || 'Non spécifié'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="group p-3 rounded-lg border border-slate-200/50 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-medium text-slate-700">Téléphone</span>
                  </div>
                  <p className="text-slate-900 text-sm font-medium">{profile.phone || 'Non spécifié'}</p>
                </div>

                <div className="group p-3 rounded-lg border border-slate-200/50 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-medium text-slate-700">Adresse</span>
                  </div>
                  <p className="text-slate-900 text-sm font-medium">{profile.address || 'Non spécifié'}</p>
                </div>

                <div className="group p-3 rounded-lg border border-slate-200/50 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-medium text-slate-700">Description</span>
                  </div>
                  <p className="text-slate-900 text-sm font-medium">{profile.description || 'Aucune description'}</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700 flex items-center gap-2">
                    <Building2 className="h-3 w-3" />
                    Nom de l'entreprise
                  </label>
                  <Input
                    value={formData.company_name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                    placeholder="Nom de l'entreprise"
                    className="rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700 flex items-center gap-2">
                    <User className="h-3 w-3" />
                    Personne de contact
                  </label>
                  <Input
                    value={formData.contact_person || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_person: e.target.value })
                    }
                    placeholder="Nom du contact"
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
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="Numéro de téléphone"
                    className="rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-medium text-slate-700 flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    Adresse
                  </label>
                  <Input
                    value={formData.address || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Adresse complète"
                    className="rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Description de l'entreprise
                </label>
                <textarea
                  className="w-full border border-slate-200 rounded-lg p-3 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 resize-none text-sm"
                  rows={3}
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Décrivez votre entreprise, vos valeurs, votre secteur d'activité..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  onClick={() => setEditing(false)}
                  variant="outline"
                  className="gap-2 text-sm"
                >
                  <X className="h-3 w-3" />
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="gap-2 text-sm"
                >
                  {loading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Account Stats */}
          <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Statistiques</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">Offres publiées</span>
                <span className="text-sm font-semibold text-slate-900">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">Candidatures reçues</span>
                <span className="text-sm font-semibold text-slate-900">48</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">Taux de réponse</span>
                <span className="text-sm font-semibold text-green-600">85%</span>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Sécurité</h3>
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2 text-xs">
                <Lock className="h-3 w-3" />
                Changer le mot de passe
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-xs">
                <Shield className="h-3 w-3" />
                Authentification 2FA
              </Button>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-slate-200/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                <Settings className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Préférences</h3>
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2 text-xs">
                <Bell className="h-3 w-3" />
                Notifications
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-xs">
                <Award className="h-3 w-3" />
                Paramètres avancés
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200/50 p-4 max-w-md w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Confirmer la modification</h3>
                <p className="text-xs text-slate-600 mt-1">Voulez-vous vraiment appliquer ces changements à votre profil ?</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              {pendingChanges?.company_name !== profile?.company_name && (
                <div className="flex items-center gap-2 text-xs">
                  <Building2 className="h-3 w-3 text-blue-600" />
                  <span className="text-slate-700">Entreprise: {profile?.company_name || 'Non spécifié'} → {pendingChanges?.company_name || 'Non spécifié'}</span>
                </div>
              )}
              {pendingChanges?.contact_person !== profile?.contact_person && (
                <div className="flex items-center gap-2 text-xs">
                  <User className="h-3 w-3 text-blue-600" />
                  <span className="text-slate-700">Contact: {profile?.contact_person || 'Non spécifié'} → {pendingChanges?.contact_person || 'Non spécifié'}</span>
                </div>
              )}
              {pendingChanges?.phone !== profile?.phone && (
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="h-3 w-3 text-blue-600" />
                  <span className="text-slate-700">Téléphone: {profile?.phone || 'Non spécifié'} → {pendingChanges?.phone || 'Non spécifié'}</span>
                </div>
              )}
              {pendingChanges?.address !== profile?.address && (
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="h-3 w-3 text-blue-600" />
                  <span className="text-slate-700">Adresse: {profile?.address || 'Non spécifié'} → {pendingChanges?.address || 'Non spécifié'}</span>
                </div>
              )}
              {pendingChanges?.description !== profile?.description && (
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="h-3 w-3 text-blue-600" />
                  <span className="text-slate-700">Description modifiée</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setShowConfirmDialog(false);
                  setPendingChanges(null);
                }}
                variant="outline"
                className="flex-1 gap-2 text-sm"
              >
                <X className="h-3 w-3" />
                Annuler
              </Button>
              <Button 
                onClick={handleConfirmSubmit}
                disabled={loading}
                className="flex-1 gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3" />
                    Confirmer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Confirmation Dialog */}
      {showImageConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200/50 p-4 max-w-md w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Camera className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Confirmer l'upload
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Voulez-vous vraiment {pendingImageUpload?.type === 'img' ? 'mettre à jour votre photo de profil' : 'télécharger votre carte d\'identité'} ?
                </p>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  {pendingImageUpload?.type === 'img' ? (
                    <Camera className="h-4 w-4 text-white" />
                  ) : (
                    <FileText className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {pendingImageUpload?.type === 'img' ? 'Photo de profil' : 'Carte d\'identité'}
                  </p>
                  <p className="text-xs text-slate-600">
                    {pendingImageUpload?.file.name} • {pendingImageUpload?.file.size ? `${(pendingImageUpload.file.size / 1024 / 1024).toFixed(2)} MB` : 'Taille inconnue'}
                  </p>
                </div>
              </div>
              
              <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
                <p className="font-medium">⚠️ Important</p>
                <p className="mt-1">
                  {pendingImageUpload?.type === 'img' 
                    ? 'Cette photo remplacera votre photo de profil actuelle.'
                    : 'Ce document sera utilisé pour vérifier votre identité.'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setShowImageConfirmDialog(false);
                  setPendingImageUpload(null);
                }}
                variant="outline"
                className="flex-1 gap-2 text-sm"
              >
                <X className="h-3 w-3" />
                Annuler
              </Button>
              <Button 
                onClick={handleConfirmImageUpload}
                disabled={uploading[pendingImageUpload?.type || 'img']}
                className="flex-1 gap-2 text-sm"
              >
                {uploading[pendingImageUpload?.type || 'img'] ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Upload...
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3" />
                    Confirmer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
