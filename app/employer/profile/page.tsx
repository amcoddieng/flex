"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EmployerProfilePage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  /**
   * Helper: Get the current valid token from localStorage
   */
  const getValidToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = decodeToken(token);
    if (!decoded || decoded.role !== 'EMPLOYER') {
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

      const res = await fetch('/api/employer/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        let errorMsg = 'Erreur lors de la récupération du profil';
        try {
          const errorData = await res.json();
          if (errorData.error) {
            errorMsg = errorData.error;
          }
        } catch {
          if (res.status === 401 || res.status === 403) {
            errorMsg = 'Accès refusé';
            router.push('/login');
            return;
          }
        }
        throw new Error(errorMsg);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = getValidToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/employer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        let errorMsg = 'Erreur lors de la mise à jour du profil';
        try {
          const errorData = await res.json();
          if (errorData.error) {
            errorMsg = errorData.error;
          }
        } catch {
          if (res.status === 401 || res.status === 403) {
            errorMsg = 'Accès refusé';
            router.push('/login');
            return;
          }
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Erreur inconnue');
      }

      setProfile(formData);
      setEditing(false);
      alert('Profil mis à jour avec succès');
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('handleSubmit error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthed) {
    return <div className="p-8">Vérification...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mon profil</h1>
        <p className="text-slate-600 mt-2">Gérez vos informations professionnelles</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading && !editing ? (
        <div className="text-center py-12">
          <p className="text-slate-600">Chargement...</p>
        </div>
      ) : profile ? (
        <div className="bg-white rounded-lg shadow p-8">
          {!editing ? (
            <>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b-2 pb-2">
                    Informations Compte
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email
                      </label>
                      <p className="text-slate-900 font-semibold">{profile.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b-2 pb-2">
                    Profil Entreprise
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profile.company_name && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Nom Entreprise
                        </label>
                        <p className="text-slate-900">{profile.company_name}</p>
                      </div>
                    )}
                    {profile.contact_person && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Personne de Contact
                        </label>
                        <p className="text-slate-900">{profile.contact_person}</p>
                      </div>
                    )}
                    {profile.phone && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Téléphone
                        </label>
                        <p className="text-slate-900">{profile.phone}</p>
                      </div>
                    )}
                    {profile.address && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Adresse
                        </label>
                        <p className="text-slate-900">{profile.address}</p>
                      </div>
                    )}
                    {profile.description && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Description
                        </label>
                        <p className="text-slate-900 whitespace-pre-wrap">
                          {profile.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {profile.validation_status && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b-2 pb-2">
                      Statut
                    </h3>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        profile.validation_status === 'VALIDATED'
                          ? 'bg-green-100 text-green-800'
                          : profile.validation_status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {profile.validation_status}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <Button
                  onClick={() => {
                    setEditing(true);
                    setFormData(profile);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Modifier le profil
                </Button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b-2 pb-2">
                  Profil Entreprise
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nom Entreprise
                    </label>
                    <Input
                      type="text"
                      value={formData.company_name || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, company_name: e.target.value })
                      }
                      placeholder="Nom Entreprise"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Personne de Contact
                    </label>
                    <Input
                      type="text"
                      value={formData.contact_person || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, contact_person: e.target.value })
                      }
                      placeholder="Personne de Contact"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Téléphone
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="Téléphone"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Adresse
                    </label>
                    <Input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Adresse"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Description de votre entreprise"
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setFormData(profile);
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}
