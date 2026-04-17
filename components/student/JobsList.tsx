import { useState, useEffect } from "react";
import { Job } from "@/types/student";
import { TypeBadge } from "./TypeBadge";
import { Skeleton } from "./Skeleton";
import { JobModal } from "./JobModal";
import { 
  Building2, MapPin, Banknote, Briefcase, Zap, Heart, ArrowRight, 
  Clock, Calendar, Users, CheckCircle, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JobsListProps {
  jobs: Job[];
  loading: boolean;
  jobSearch: string;
  jobTypeFilter: string;
  onJobSearchChange: (value: string) => void;
  onJobTypeFilterChange: (value: string) => void;
  savedJobs: Set<string | number>;
  onToggleSaveJob: (jobId: string | number) => void;
}

interface ApplicationStatus {
  [jobId: number]: {
    hasApplied: boolean;
    status?: string;
  };
}

export function JobsList({ 
  jobs, 
  loading, 
  jobSearch, 
  jobTypeFilter, 
  onJobSearchChange,
  onJobTypeFilterChange,
  savedJobs,
  onToggleSaveJob
}: JobsListProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>({});

  const filteredJobs = jobs.filter((j) => {
    const q = jobSearch.toLowerCase();
    const type = j.service_type || j.type || "";
    const company = j.company || j.employer?.company_name || "";
    return (
      (!q || j.title.toLowerCase().includes(q) || company.toLowerCase().includes(q)) &&
      (jobTypeFilter === "all" || type === jobTypeFilter || j.service_type === jobTypeFilter)
    );
  });

  const getJobType = (job: Job): string => {
    return job.service_type || job.type || "";
  };

  const getCompany = (job: Job): string => {
    return job.company || job.employer?.company_name || "";
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  const handleApply = async (jobId: number, applicationData: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token non trouvé');
      }

      const response = await fetch(`/api/job/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(applicationData)
      });

      const result = await response.json();
      
      if (result.success) {
        // Mettre à jour le statut de candidature
        setApplicationStatus(prev => ({
          ...prev,
          [jobId]: { hasApplied: true, status: 'PENDING' }
        }));
        
        // Mettre à jour le nombre de candidats
        if (selectedJob) {
          setSelectedJob({
            ...selectedJob,
            applicants: (selectedJob.applicants || 0) + 1
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('Erreur lors de la candidature:', error);
      return { success: false, error: 'Erreur lors de la candidature' };
    }
  };

  // Vérifier le statut de candidature pour chaque job
  useEffect(() => {
    const checkApplicationStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const statusPromises = jobs.map(async (job) => {
        try {
          const response = await fetch(`/api/job/${job.id}/application-status`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const result = await response.json();
          return {
            jobId: job.id,
            hasApplied: result.hasApplied || false,
            status: result.status
          };
        } catch (error) {
          return {
            jobId: job.id,
            hasApplied: false,
            status: null
          };
        }
      });

      const statuses = await Promise.all(statusPromises);
      const statusMap = statuses.reduce((acc, status) => {
        acc[status.jobId] = {
          hasApplied: status.hasApplied,
          status: status.status
        };
        return acc;
      }, {} as ApplicationStatus);

      setApplicationStatus(statusMap);
    };

    if (jobs.length > 0) {
      checkApplicationStatus();
    }
  }, [jobs]);

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-52" />)}
      </div>
    );
  }

  if (filteredJobs.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p>Aucune offre trouvée</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobs.map((job) => {
          const type = getJobType(job);
          const company = getCompany(job);
          const isSaved = savedJobs.has(job.id);
          const hasApplied = applicationStatus[job.id]?.hasApplied || false;
          const applicationStatusText = applicationStatus[job.id]?.status;
          
          return (
            <div
              key={job.id}
              className={cn(
                "group relative overflow-hidden rounded-3xl border backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer",
                "bg-white/80 border-slate-200/50 hover:border-primary/30"
              )}
              onClick={() => handleJobClick(job)}
            >
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Urgent indicator */}
              {job.urgent && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 via-orange-400 to-red-400 animate-pulse" />
              )}
              
              {/* Applied indicator */}
              {hasApplied && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
              )}
              
              <div className="relative p-6">
                {/* Header with icon and save button */}
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6",
                    "bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-primary/10 group-hover:to-primary/20"
                  )}>
                    <Building2 className="h-7 w-7 text-slate-600 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex gap-2">
                    {hasApplied && (
                      <div className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {applicationStatusText === "ACCEPTED" ? "Acceptée" : 
                         applicationStatusText === "INTERVIEW" ? "Entretien" : 
                         applicationStatusText === "REJECTED" ? "Refusée" : "Envoyée"}
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSaveJob(job.id);
                      }}
                      className={cn(
                        "p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110",
                        isSaved 
                          ? "bg-red-50 text-red-500 hover:bg-red-100" 
                          : "bg-slate-100 text-slate-400 hover:text-red-400 hover:bg-red-50"
                      )}
                    >
                      <Heart className={cn("h-5 w-5 transition-transform duration-300", isSaved && "fill-current scale-110")} />
                    </button>
                  </div>
                </div>

                {/* Job title and company */}
                <div className="mb-4">
                  <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                    {job.title}
                  </h3>
                  <p className="text-sm text-slate-600 font-medium flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary/40" />
                    {company}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {type && (
                    <span className={cn(
                      "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300",
                      "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 hover:border-blue-300"
                    )}>
                      {type}
                    </span>
                  )}
                  {job.type_paiement && (
                    <span className={cn(
                      "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300",
                      "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 hover:border-green-300"
                    )}>
                      {job.type_paiement}
                    </span>
                  )}
                  {job.urgent && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-red-600 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 animate-pulse">
                      <Zap className="h-3.5 w-3.5" /> Urgent
                    </span>
                  )}
                </div>

                {/* Job details */}
                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">{job.location}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center gap-3 text-sm">
                      <Banknote className="h-4 w-4 text-slate-400" />
                      <span className="font-bold text-primary">{job.salary}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">{job.applicants || 0} candidat{job.applicants !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">
                      {new Date(job.posted_at).toLocaleDateString("fr-FR", { 
                        month: "short", 
                        day: "numeric" 
                      })}
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <div
                  className={cn(
                    "block w-full text-center py-3 px-4 rounded-2xl text-sm font-bold transition-all duration-300",
                    hasApplied 
                      ? "bg-slate-100 text-slate-600 cursor-default"
                      : "bg-gradient-to-r from-primary to-violet-600 text-white hover:from-primary/90 hover:to-violet-600/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                  )}
                >
                  <span className="flex items-center justify-center gap-2">
                    {hasApplied ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Déjà postulé
                      </>
                    ) : (
                      <>
                        Voir l'offre
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Job Modal */}
      <JobModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onApply={handleApply}
        hasApplied={selectedJob ? (applicationStatus[selectedJob.id]?.hasApplied || false) : false}
        applicationStatus={selectedJob ? applicationStatus[selectedJob.id]?.status : undefined}
      />
    </>
  );
}
