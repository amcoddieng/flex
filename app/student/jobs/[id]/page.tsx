"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Briefcase, 
  MapPin, 
  Banknote, 
  Clock,
  Calendar,
  Building,
  Users,
  FileText,
  Mail,
  Phone,
  User,
  ArrowLeft,
  Send,
  Loader2
} from "lucide-react";
import Link from "next/link";

interface Job {
  id: number;
  title: string;
  company: string;
  employer_company?: string;
  location: string;
  job_type: string;
  salary?: string;
  description: string;
  requirements?: string;
  posted_at: string;
  is_active: boolean;
  employer_id: number;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  applicants_count?: number;
  employer_description?: string;
}

export default function JobDetailPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const hasCheckedAuth = useRef(false);

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
    
    if (params.id) {
      fetchJob(params.id as string);
    }
  }, [router, params.id]);

  const fetchJob = async (jobId: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = getValidToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/jobs/${jobId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Offre d\'emploi non trouvée');
        }
        throw new Error('Erreur lors de la récupération de l\'offre');
      }

      const data = await res.json();
      if (data.success) {
        setJob(data.data);
      } else {
        throw new Error(data.error || 'Réponse invalide');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('fetchJob error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const applyToJob = async () => {
    if (!job) return;

    setApplying(true);
    setError(null);
    setSuccess(null);
    
    try {
      const token = getValidToken();
      if (!token) {
        setError('Vous devez être connecté pour postuler');
        return;
      }

      // Vérifier le statut de validation du profil étudiant
      const profileRes = await fetch('/api/student/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const profileData = await profileRes.json();
      
      if (profileData.student && profileData.student.validation_status !== 'VALIDATED') {
        if (profileData.student.validation_status === 'PENDING') {
          setError('Votre profil est en attente de validation. Vous ne pouvez postuler qu\'une fois votre profil validé.');
        } else if (profileData.student.validation_status === 'REJECTED') {
          setError('Votre profil a été rejeté. Veuillez contacter l\'administrateur pour plus d\'informations.');
        } else {
          setError('Votre profil n\'est pas validé. Veuillez compléter votre profil et attendre la validation.');
        }
        return;
      }
      
      console.log('Token trouvé:', token ? 'oui' : 'non');

      const res = await fetch('/api/student/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job_id: job.id }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la candidature');
      }

      if (data.success) {
        setSuccess('Candidature envoyée avec succès!');
        // Redirect to applications after a short delay
        setTimeout(() => {
          router.push('/student/applications');
        }, 2000);
      } else {
        throw new Error(data.error || 'Candidature échouée');
      }
    } catch (err: any) {
      console.error('applyToJob error:', err);
      setError(err.message || 'Erreur lors de la candidature');
    } finally {
      setApplying(false);
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
          <p className="text-slate-600">Chargement de l'offre...</p>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
        <Link href="/student/jobs">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour aux offres
          </Button>
        </Link>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-20">
          <Briefcase className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Offre non trouvée</h3>
          <p className="text-slate-600 mb-6">Cette offre d'emploi n'existe pas ou n'est plus disponible</p>
          <Link href="/student/jobs">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour aux offres
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/student/jobs">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
          <p className="text-slate-600">
            {job.employer_company || job.company} · {job.location}
          </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Details */}
          <div className="bg-white rounded-xl border border-slate-200/50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Description du poste</h2>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                {job.description || 'Aucune description disponible'}
              </div>
            </div>

            {job.requirements && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Exigences</h3>
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {job.requirements}
                </div>
              </div>
            )}
          </div>

          {/* Company Information */}
          {job.employer_description && (
            <div className="bg-white rounded-xl border border-slate-200/50 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">À propos de l'entreprise</h2>
              <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                {job.employer_description}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Summary */}
          <div className="bg-white rounded-xl border border-slate-200/50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Détails de l'offre</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600">Entreprise</p>
                  <p className="font-medium text-slate-900">{job.employer_company || job.company}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600">Localisation</p>
                  <p className="font-medium text-slate-900">{job.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600">Type de contrat</p>
                  <p className="font-medium text-slate-900 capitalize">{job.job_type}</p>
                </div>
              </div>

              {job.salary && (
                <div className="flex items-center gap-3">
                  <Banknote className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-600">Salaire</p>
                    <p className="font-medium text-slate-900">{job.salary}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600">Date de publication</p>
                  <p className="font-medium text-slate-900">
                    {new Date(job.posted_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {job.applicants_count !== undefined && (
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-600">Candidats</p>
                    <p className="font-medium text-slate-900">{job.applicants_count} personne{job.applicants_count > 1 ? 's' : ''}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {(job.contact_person || job.contact_email || job.contact_phone) && (
            <div className="bg-white rounded-xl border border-slate-200/50 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact</h2>
              <div className="space-y-3">
                {job.contact_person && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-700">{job.contact_person}</span>
                  </div>
                )}
                {job.contact_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-slate-400" />
                    <a 
                      href={`mailto:${job.contact_email}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {job.contact_email}
                    </a>
                  </div>
                )}
                {job.contact_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-slate-400" />
                    <a 
                      href={`tel:${job.contact_phone}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {job.contact_phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Apply Button */}
          <Button
            onClick={applyToJob}
            disabled={applying || success !== null}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            {applying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Envoi en cours...
              </>
            ) : success ? (
              <>
                <Send className="h-4 w-4 mr-2" />
                Candidature envoyée!
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Postuler maintenant
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
