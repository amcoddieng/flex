"use client";

// ========================================
// SECTION 1: IMPORTS ET DÉPENDANCES
// ========================================
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Briefcase, 
  MapPin, 
  Banknote, 
  Clock, 
  Search,
  Filter,
  Heart,
  ExternalLink,
  Calendar,
  Building,
  Users,
  FileText,
  User,
  Mail,
  Phone,
  CheckCircle
} from "lucide-react";
import Link from "next/link";

// ========================================
// SECTION 2: INTERFACE ET TYPES
// ========================================
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
}

// ========================================
// SECTION 3: COMPOSANT PRINCIPAL - ÉTATS ET RÉFÉRENCES
// ========================================
export default function StudentJobsPage() {
  // États d'authentification et chargement
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // États des données
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set());
  const [appliedJobs, setAppliedJobs] = useState<Set<number>>(new Set());
  const [applyingJob, setApplyingJob] = useState<number | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  // États pour le formulaire de candidature
  const [applicationData, setApplicationData] = useState({
    message: '',
    availability: '',
    experience: '',
    start_date: '',
    interview_date: '',
    interview_time: '',
    interview_location: ''
  });
  const [applicationError, setApplicationError] = useState<string | null>(null);
  const [applicationSuccess, setApplicationSuccess] = useState<string | null>(null);
  
  // Références et navigation
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
// Hook d'effet pour l'authentification et chargement initial
useEffect(() => {
  if (hasCheckedAuth.current) return;
  hasCheckedAuth.current = true;

  const token = getValidToken();
  if (!token) {
    router.push('/login');
    return;
  }
  setIsAuthed(true);
  fetchJobs();
}, [router]);

// Hook d'effet pour le filtrage des offres
useEffect(() => {
  let filtered = jobs;

  // Filter by search term
  if (searchTerm) {
    filtered = filtered.filter(job => 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.company && job.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.employer_company && job.employer_company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by job type
    if (selectedType !== "all") {
      filtered = filtered.filter(job => 
        job.job_type.toLowerCase().includes(selectedType.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, selectedType]);

  // Fetch jobs when filters change
  useEffect(() => {
    if (isAuthed) {
      fetchJobs();
    }
  }, [searchTerm, selectedType]);

  const fetchApplications = async () => {
    try {
      const token = getValidToken();
      if (!token) return;

      const res = await fetch('/api/student/applications', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const appliedJobIds = new Set(data.data.map((app: any) => app.job_id));
          setAppliedJobs(appliedJobIds);
        }
      }
    } catch (error) {
      console.error('fetchApplications error:', error);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getValidToken();
      if (!token) {
        router.push('/login');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedType && selectedType !== 'all') params.append('job_type', selectedType);

      const res = await fetch(`/api/jobs?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error('Erreur lors de la récupération des offres');
      }

      const data = await res.json();
      if (data.success) {
        setJobs(data.data);
        // After fetching jobs, fetch applications to check which jobs are already applied
        await fetchApplications();
      } else {
        throw new Error(data.error || 'Réponse invalide');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('fetchJobs error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveJob = (jobId: number) => {
    setSavedJobs(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  const openApplicationModal = (job: Job) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
    setApplicationError(null);
    setApplicationSuccess(null);
    // Reset form data
    setApplicationData({
      message: '',
      availability: '',
      experience: '',
      start_date: '',
      interview_date: '',
      interview_time: '',
      interview_location: ''
    });
  };

  const closeModal = () => {
    setShowApplicationModal(false);
    setSelectedJob(null);
    setApplicationError(null);
    setApplicationSuccess(null);
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setApplyingJob(selectedJob.id);
    setApplicationError(null);
    setApplicationSuccess(null);

    try {
      const token = getValidToken();
      if (!token) return;

      // Vérifier le statut de validation du profil étudiant
      const profileRes = await fetch('/api/student/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const profileData = await profileRes.json();
      // Accès direct (l'objet est à la racine)
// console.log('Validation status:', profileData.validationStatus);
// // Affichera: "VALIDATED"
//       console.log('Profile data:', profileData.student?.validation_status);
// console.log('Type de profileData:', typeof profileData);
// console.log('Contenu complet:', profileData);
// console.log('Clés de l\'objet:', Object.keys(profileData));
// console.log('Validation status:', profileData.student.validationStatus);
      if (profileData.student && profileData.student.validationStatus !== 'VALIDATED') {
        if (profileData.student.validationStatus === 'PENDING') {
          setApplicationError('Votre profil est en attente de validation. Vous ne pouvez postuler qu\'une fois votre profil validé.');
        } else if (profileData.student.validationStatus === 'REJECTED') {
          setApplicationError('Votre profil a été rejeté. Veuillez contacter l\'administrateur pour plus d\'informations.');
        } else {
          setApplicationError('Votre profil n\'est pas validé. Veuillez compléter votre profil et attendre la validation.');
        }
        return;
      }

      const res = await fetch('/api/student/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: selectedJob.id,
          message: applicationData.message,
          availability: applicationData.availability,
          experience: applicationData.experience,
          start_date: applicationData.start_date || null,
          interview_date: applicationData.interview_date || null,
          interview_time: applicationData.interview_time || null,
          interview_location: applicationData.interview_location || null
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la candidature');
      }

      if (data.success) {
        setApplicationSuccess('Candidature envoyée avec succès!');
        // Add the job to applied jobs set
        setAppliedJobs(prev => new Set([...prev, selectedJob.id]));
        // Close modal after success and redirect
        setTimeout(() => {
          closeModal();
          router.push('/student/applications');
        }, 2000);
      } else {
        throw new Error(data.error || 'Candidature échouée');
      }
    } catch (err: any) {
      console.error('applyToJob error:', err);
      setApplicationError(err.message || 'Erreur lors de la candidature');
    } finally {
      setApplyingJob(null);
    }
  };

  if (!isAuthed) {
    return <div className="p-8">Vérification...</div>;
  }

  const jobTypes = [
    { value: "all", label: "Tous les types" },
    { value: "internship", label: "Stage" },
    { value: "part-time", label: "Temps partiel" },
    { value: "full-time", label: "Temps plein" },
    { value: "freelance", label: "Freelance" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offres d'emploi</h1>
          <p className="text-gray-600">Découvrez les opportunités qui correspondent à votre profil</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            {filteredJobs.length} offre{filteredJobs.length > 1 ? 's' : ''} trouvée{filteredJobs.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par poste, entreprise, lieu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Job Type Filter */}
          <div className="flex gap-2 flex-wrap">
            {jobTypes.map((type) => (
              <Button
                key={type.value}
                variant={selectedType === type.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type.value)}
                // je veux comme le bacground des boutons actifs dans le top bar
                className={selectedType === type.value ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-600">Chargement des offres...</p>
          </div>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <div key={job.id} className="group bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors mb-2">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building className="h-4 w-4" />
                    <span>{job.employer_company || job.company}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSaveJob(job.id)}
                  className="shrink-0"
                >
                  <Heart 
                    className={`h-4 w-4 ${savedJobs.has(job.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                  />
                </Button>
              </div>

              {/* Job Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="h-4 w-4" />
                  <span className="capitalize">{job.job_type}</span>
                </div>
                {job.salary && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Banknote className="h-4 w-4" />
                    <span>{job.salary}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Posté {new Date(job.posted_at).toLocaleDateString('fr-FR')}</span>
                </div>
                {job.applicants_count !== undefined && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{job.applicants_count} candidat{job.applicants_count > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {job.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                {appliedJobs.has(job.id) ? (
                  <Button
                    onClick={() => router.push('/student/applications')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Déjà postulé
                  </Button>
                ) : (
                  <Button
                    onClick={() => openApplicationModal(job)}
                    disabled={applyingJob === job.id}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    {applyingJob === job.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Postulation...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Postuler
                      </>
                    )}
                  </Button>
                )}
                <Link href={`/student/jobs/${job.id}`}>
                  <Button variant="outline" size="sm">
                    Détails
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm || selectedType !== "all" ? "Aucune offre trouvée" : "Aucune offre disponible"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedType !== "all" 
              ? "Essayez de modifier vos critères de recherche" 
              : "Revenez plus tard pour découvrir de nouvelles opportunités"
            }
          </p>
          {(searchTerm || selectedType !== "all") && (
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedType("all");
              }}
              variant="outline"
            >
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      )}

      {/* Application Modal */}
      {showApplicationModal && selectedJob && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Postuler à : {selectedJob.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {selectedJob.employer_company || selectedJob.company}
                    <MapPin className="h-4 w-4 ml-2" />
                    {selectedJob.location}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg text-gray-400 hover:bg-white/60 hover:text-gray-600 transition-all duration-200 backdrop-blur-sm"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleApplicationSubmit} className="p-6 space-y-6">
              {applicationError && (
                <div className="mb-4 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl">
                  <p className="text-sm text-red-600">{applicationError}</p>
                </div>
              )}

              {applicationSuccess && (
                <div className="mb-4 p-4 bg-green-50/80 backdrop-blur-sm border border-green-200/50 rounded-xl">
                  <p className="text-sm text-green-600">{applicationSuccess}</p>
                </div>
              )}

              <div className="space-y-5">
                {/* Message de motivation */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    Message de motivation *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={applicationData.message}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200/50 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500 transition-all duration-200 placeholder-gray-400"
                    placeholder="Expliquez pourquoi vous êtes intéressé par cette offre..."
                  />
                </div>

                {/* Disponibilité */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    Disponibilité
                  </label>
                  <input
                    type="text"
                    value={applicationData.availability}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, availability: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200/50 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200 placeholder-gray-400"
                    placeholder="Ex: Disponible immédiatement, flexible..."
                  />
                </div>

                {/* Expérience */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-purple-500" />
                    Expérience pertinente
                  </label>
                  <textarea
                    rows={3}
                    value={applicationData.experience}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200/50 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200 placeholder-slate-400"
                    placeholder="Décrivez votre expérience pertinente..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date de début */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      Date de disponibilité
                    </label>
                    <input
                      type="date"
                      value={applicationData.start_date}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200/50 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
                    />
                  </div>

                  {/* Date d'entretien */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-indigo-500" />
                      Date d'entretien souhaitée
                    </label>
                    <input
                      type="date"
                      value={applicationData.interview_date}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, interview_date: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200/50 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Heure d'entretien */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-pink-500" />
                      Heure d'entretien souhaitée
                    </label>
                    <input
                      type="time"
                      value={applicationData.interview_time}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, interview_time: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200/50 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all duration-200"
                    />
                  </div>

                  {/* Lieu d'entretien */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-teal-500" />
                      Lieu d'entretien souhaité
                    </label>
                    <input
                      type="text"
                      value={applicationData.interview_location}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, interview_location: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200/50 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all duration-200 placeholder-slate-400"
                      placeholder="Ex: Bureau principal, Visioconférence..."
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-blue-50/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  disabled={applyingJob === selectedJob.id}
                  className="bg-white/60 backdrop-blur-sm border-slate-200/50 hover:bg-white/80 transition-all duration-200"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={applyingJob === selectedJob.id || !applicationData.message.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg backdrop-blur-sm transition-all duration-200 disabled:opacity-50"
                >
                  {applyingJob === selectedJob.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Envoyer la candidature
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
