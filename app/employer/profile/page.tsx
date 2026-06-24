"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmployerProtection } from "@/components/employer-protection";
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
    <EmployerProtection requireValidation={false}>
      <div className="min-h-screen">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs><pattern id="grid2" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/></pattern></defs>
              <rect width="100" height="100" fill="url(#grid2)"/>
            </svg>
          </div>
          <div className="relative px-6 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">Votre compte</p>
                <h1 className="text-2xl sm:text-3xl font-bold">Mon Profil</h1>
                <p className="text-slate-400 text-sm mt-1">Gérez vos informations et documents</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-400">{profile?.company_name || 'Employeur'}</p>
                  <p className="font-semibold text-sm">{profile?.email || ''}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-semibold shadow-lg ring-2 ring-white/20">
                  {profile?.company_name?.charAt(0)?.toUpperCase() || 'E'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6 space-y-6 max-w-7xl">
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

      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Profile Photo */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Camera className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Photo de profil</h3>
            </div>
            <span className="text-[11px] text-slate-400">JPEG, PNG • 5MB</span>
          </div>
          <div className="space-y-4">
            <div className="relative group cursor-pointer" onClick={() => document.getElementById("upload-img")?.click()}>
              {profile.img ? (
                <div className="relative overflow-hidden rounded-xl">
                  <img src={profile.img} alt="Profile" className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-full h-52 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center group-hover:border-blue-300 group-hover:bg-blue-50/20 transition-all">
                  <Camera className="h-10 w-10 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  <p className="text-slate-500 mt-2 text-sm font-medium">Ajouter une photo</p>
                </div>
              )}
              <input type="file" hidden id="upload-img" accept="image/*" onChange={(e) => handleImageUpload(e, "img")} />
            </div>
            <Button onClick={() => document.getElementById("upload-img")?.click()} variant="outline" className="w-full gap-2 text-sm" disabled={uploading.img}>
              {uploading.img ? (<><div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>Upload...</>) : (<><Upload className="h-4 w-4" />{profile.img ? "Changer" : "Ajouter"}</>)}
            </Button>
          </div>
        </div>

        {/* Identity Document */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <FileText className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Carte d'identité</h3>
            </div>
            <span className="text-[11px] text-slate-400">PDF, JPEG • 10MB</span>
          </div>
          <div className="space-y-4">
            <div className="relative group cursor-pointer" onClick={() => document.getElementById("upload-identity")?.click()}>
              {profile.identity ? (
                <div className="relative overflow-hidden rounded-xl">
                  <img src={profile.identity} alt="Identity" className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-full h-52 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center group-hover:border-green-300 group-hover:bg-green-50/20 transition-all">
                  <FileText className="h-10 w-10 text-slate-300 group-hover:text-green-500 transition-colors" />
                  <p className="text-slate-500 mt-2 text-sm font-medium">Ajouter un document</p>
                </div>
              )}
              <input type="file" hidden id="upload-identity" accept="image/*,.pdf" onChange={(e) => handleImageUpload(e, "identity")} />
            </div>
            <Button onClick={() => document.getElementById("upload-identity")?.click()} variant="outline" className="w-full gap-2 text-sm" disabled={uploading.identity}>
              {uploading.identity ? (<><div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>Upload...</>) : (<><Upload className="h-4 w-4" />{profile.identity ? "Changer" : "Ajouter"}</>)}
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Informations du profil</h3>
          </div>
          {!editing && (
            <Button onClick={() => setEditing(true)} variant="outline" size="sm" className="gap-1.5 text-xs">
              <Edit3 className="h-3 w-3" />
              Modifier
            </Button>
          )}
        </div>

        {!editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Email</span>
                </div>
                <p className="text-slate-900 text-sm font-medium">{profile.email}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Entreprise</span>
                </div>
                <p className="text-slate-900 text-sm font-medium">{profile.company_name || 'Non spécifié'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Contact</span>
                </div>
                <p className="text-slate-900 text-sm font-medium">{profile.contact_person || 'Non spécifié'}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Téléphone</span>
                </div>
                <p className="text-slate-900 text-sm font-medium">{profile.phone || 'Non spécifié'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Adresse</span>
                </div>
                <p className="text-slate-900 text-sm font-medium">{profile.address || 'Non spécifié'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Description</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Statistiques</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50/70">
                <span className="text-xs text-slate-500">Offres publiées</span>
                <span className="text-sm font-bold text-slate-900">12</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50/70">
                <span className="text-xs text-slate-500">Candidatures</span>
                <span className="text-sm font-bold text-slate-900">48</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50/70">
                <span className="text-xs text-slate-500">Taux de réponse</span>
                <span className="text-sm font-bold text-emerald-600">85%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Sécurité</h3>
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2 text-xs h-9 border-slate-200 hover:bg-slate-50">
                <Lock className="h-3.5 w-3.5 text-slate-500" />
                Changer le mot de passe
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-xs h-9 border-slate-200 hover:bg-slate-50">
                <Shield className="h-3.5 w-3.5 text-slate-500" />
                Authentification 2FA
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Settings className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Préférences</h3>
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2 text-xs h-9 border-slate-200 hover:bg-slate-50">
                <Bell className="h-3.5 w-3.5 text-slate-500" />
                Notifications
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-xs h-9 border-slate-200 hover:bg-slate-50">
                <Award className="h-3.5 w-3.5 text-slate-500" />
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
    </EmployerProtection>
  );
}
