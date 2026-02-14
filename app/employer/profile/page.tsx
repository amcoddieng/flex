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
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Erreur mise à jour");

      setProfile(formData);
      setEditing(false);
      setSuccess("Profil mis à jour avec succès");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "img" | "identity"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading({ ...uploading, [type]: true });

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
      setSuccess("Image mise à jour et sauvegardée");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Erreur upload");
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  if (!isAuthed) return <div className="p-8">Vérification...</div>;
  if (!profile) return <div className="p-8">Chargement...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      <h1 className="text-3xl font-bold">Mon Profil Employeur</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded">
          {success}
        </div>
      )}

      {/* Upload Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          {profile.img && (
            <img
              src={profile.img}
              className="h-48 w-full object-cover rounded mb-4"
            />
          )}
          <input
            type="file"
            hidden
            id="upload-img"
            onChange={(e) => handleImageUpload(e, "img")}
          />
          <Button onClick={() => document.getElementById("upload-img")?.click()}>
            {uploading.img ? "Upload..." : "Changer Photo"}
          </Button>
        </div>

        <div>
          {profile.identity && (
            <img
              src={profile.identity}
              className="h-48 w-full object-cover rounded mb-4"
            />
          )}
          <input
            type="file"
            hidden
            id="upload-identity"
            onChange={(e) => handleImageUpload(e, "identity")}
          />
          <Button
            onClick={() => document.getElementById("upload-identity")?.click()}
          >
            {uploading.identity ? "Upload..." : "Changer Carte Identité"}
          </Button>
        </div>
      </div>

      {/* Profile Info */}
      {!editing ? (
        <div className="bg-white shadow p-8 rounded space-y-6">
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Entreprise:</strong> {profile.company_name}</p>
          <p><strong>Contact:</strong> {profile.contact_person}</p>
          <p><strong>Téléphone:</strong> {profile.phone}</p>
          <p><strong>Adresse:</strong> {profile.address}</p>
          <p><strong>Description:</strong> {profile.description}</p>

          <Button onClick={() => setEditing(true)}>
            Modifier le profil
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={formData.company_name || ""}
            onChange={(e) =>
              setFormData({ ...formData, company_name: e.target.value })
            }
            placeholder="Nom Entreprise"
          />
          <Input
            value={formData.contact_person || ""}
            onChange={(e) =>
              setFormData({ ...formData, contact_person: e.target.value })
            }
            placeholder="Contact"
          />
          <Input
            value={formData.phone || ""}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="Téléphone"
          />
          <Input
            value={formData.address || ""}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="Adresse"
          />
          <textarea
            className="w-full border p-2 rounded"
            rows={4}
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <div className="flex gap-4">
            <Button type="button" onClick={() => setEditing(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
