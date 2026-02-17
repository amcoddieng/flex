"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Users,
  ArrowLeft,
  Send,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

type Job = {
  id: number;
  title: string;
  description: string;
  company: string;
  location: string;
  service_type: string;
  salary: string;
  type_paiement: string;
  availability: string;
  requirements: string;
  contact_email: string;
  contact_phone: string;
  posted_at: string;
  applicants: number;
  is_active: boolean;
  blocked: boolean;
};

type StudentProfile = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  university: string;
  department: string;
  year_of_study: number;
  phone: string;
};

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    message: "",
    availability: "",
    experience: "",
    start_date: "",
  });

  const hasCheckedAuth = useRef(false);

  const getValidToken = (): string | null => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("token");
    if (!token) return null;
    const decoded = decodeToken(token);
    if (!decoded) {
      localStorage.removeItem("token");
      return null;
    }
    return token;
  };

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const token = getValidToken();
    if (token) {
      const decoded = decodeToken(token);
      if (decoded?.role === "STUDENT") {
        setIsAuthed(true);
        fetchStudentProfile();
      }
    }

    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/job/${jobId}`);
      if (!res.ok) {
        throw new Error("Offre non trouvée");
      }

      const data = await res.json();
      setJob(data.data);

      // Check if student has already applied
      if (isAuthed) {
        checkApplicationStatus();
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement de l'offre");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentProfile = async () => {
    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch("/api/profile/student", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setStudent(data.data);
      }
    } catch (err) {
      console.error("Erreur chargement profil:", err);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch(`/api/job/${jobId}/application-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setHasApplied(data.hasApplied);
      }
    } catch (err) {
      console.error("Erreur vérification candidature:", err);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthed) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = getValidToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`/api/job/${jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de la candidature");
      }

      setSubmitSuccess(true);
      setHasApplied(true);
      setFormData({
        message: "",
        availability: "",
        experience: "",
        start_date: "",
      });
      setShowApplicationForm(false);

      // Hide success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Offre non trouvée</h1>
          <p className="text-muted-foreground mb-8">
            {error || "L'offre que vous recherchez n'existe pas ou a été supprimée."}
          </p>
          <Button onClick={() => router.push("/jobs")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour aux offres
          </Button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/jobs")}
            className="gap-2 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux offres
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold mb-4">{job.title}</h1>

              <div className="flex flex-wrap gap-3 mb-8">
                {job.company && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                    <Briefcase className="h-4 w-4" />
                    {job.company}
                  </div>
                )}
                {job.location && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </div>
                )}
                {job.salary && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
                    <DollarSign className="h-4 w-4" />
                    {job.salary}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-card border border-border rounded-lg p-8 mb-8">
                <h2 className="text-2xl font-bold mb-4">Description du poste</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div className="bg-card border border-border rounded-lg p-8 mb-8">
                  <h2 className="text-2xl font-bold mb-4">Compétences requises</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {job.requirements}
                  </p>
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                {job.type_paiement && (
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">Type de paiement</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{job.type_paiement}</p>
                  </div>
                )}
                {job.availability && (
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">Disponibilité</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{job.availability}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Job stats */}
              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{job.applicants || 0} candidatures</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Publié le{" "}
                  {new Date(job.posted_at).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Success message */}
              {submitSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-green-900">Candidature envoyée!</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Votre candidature a été reçue avec succès. Rendez-vous dans votre
                        espace étudiant pour suivre votre dossier.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Application form */}
              {!hasApplied && !submitSuccess ? (
                <>
                  {showApplicationForm ? (
                    <form onSubmit={handleSubmitApplication} className="space-y-4">
                      <div className="bg-card border border-border rounded-lg p-6">
                        <h3 className="font-bold mb-4">Votre candidature</h3>

                        {error && (
                          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm">
                            {error}
                          </div>
                        )}

                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium block mb-2">
                              Message (optionnel)
                            </label>
                            <Textarea
                              placeholder="Présentez-vous et expliquez pourquoi vous êtes intéressé par ce poste..."
                              value={formData.message}
                              onChange={(e) =>
                                setFormData({ ...formData, message: e.target.value })
                              }
                              className="min-h-24"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium block mb-2">
                              Votre expérience (optionnel)
                            </label>
                            <Textarea
                              placeholder="Décrivez votre expérience pertinente..."
                              value={formData.experience}
                              onChange={(e) =>
                                setFormData({ ...formData, experience: e.target.value })
                              }
                              className="min-h-20"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium block mb-2">
                                Date de début souhaitée
                              </label>
                              <Input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) =>
                                  setFormData({ ...formData, start_date: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium block mb-2">
                                Disponibilité (optionnel)
                              </label>
                              <Input
                                placeholder="Ex: Lundi à Vendredi"
                                value={formData.availability}
                                onChange={(e) =>
                                  setFormData({ ...formData, availability: e.target.value })
                                }
                              />
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <Button
                              type="submit"
                              disabled={submitting}
                              className="flex-1 gap-2"
                            >
                              <Send className="h-4 w-4" />
                              {submitting ? "Envoi..." : "Envoyer ma candidature"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowApplicationForm(false)}
                            >
                              Annuler
                            </Button>
                          </div>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <Button
                      onClick={() =>
                        isAuthed
                          ? setShowApplicationForm(true)
                          : router.push("/login")
                      }
                      size="lg"
                      className="w-full gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Postuler maintenant
                    </Button>
                  )}
                </>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-blue-900">Vous avez postulé</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Votre candidature est en attente de réponse du recruteur.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact info */}
              <div className="bg-muted rounded-lg p-6 mt-6">
                <h3 className="font-bold mb-4">Contact du recruteur</h3>
                {job.contact_email && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium">Email:</span> {job.contact_email}
                  </p>
                )}
                {job.contact_phone && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Téléphone:</span> {job.contact_phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
