import { Application } from "@/types/student";
import { StatusBadge } from "./StatusBadge";
import { Skeleton } from "./Skeleton";
import { Building2, MapPin, Briefcase, Clock, Eye, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApplicationsListProps {
  applications: Application[];
  loading: boolean;
  error: string | null;
  onWithdrawApplication: (id: number) => void;
  onShowDetails: (app: Application) => void;
  withdrawingId: number | null;
  appStatusFilter: string;
}

export function ApplicationsList({ 
  applications, 
  loading, 
  error, 
  onWithdrawApplication, 
  onShowDetails, 
  withdrawingId,
  appStatusFilter 
}: ApplicationsListProps) {
  const filteredApps = applications.filter(
    (a) => appStatusFilter === "all" || a.status === appStatusFilter
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[1,2,3,4].map(i => (
          <Skeleton key={i} className="h-28 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500 animate-fade-in">
        <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Eye className="h-8 w-8 text-red-500" />
        </div>
        <p className="font-semibold text-red-600">Erreur: {error}</p>
      </div>
    );
  }

  if (filteredApps.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400 animate-fade-in">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-float">
          <Eye className="h-10 w-10 text-slate-400" />
        </div>
        <p className="text-lg font-medium text-slate-500">Aucune candidature dans cette catégorie</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredApps.map((app, index) => (
        <div
          key={app.id}
          className="bg-white rounded-3xl border-2 border-slate-200/50 p-6 hover:shadow-lg hover:border-slate-300/80 transition-all duration-300 hover:-translate-y-1 card-hover card-entrance"
          style={{animationDelay: `${index * 0.1}s`}}
        >
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center flex-shrink-0 animate-glow">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                <h3 className="font-bold text-slate-900 text-lg">{app.job.title}</h3>
                <div className="badge-entrance">
                  <StatusBadge status={app.status} />
                </div>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span className="font-medium">{app.job.employer.company_name}</span>
                </span>
                <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="font-medium">{app.job.location}</span>
                </span>
                <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                  <span className="font-medium">{app.job.job_type}</span>
                </span>
                <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="font-medium">Postulé le {new Date(app.applied_at).toLocaleDateString("fr-FR")}</span>
                </span>
              </div>
              {app.job.salary && (
                <div className="mt-3">
                  <p className="text-lg font-bold text-primary animate-fade-in">{app.job.salary}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={() => onShowDetails(app)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-2xl text-sm font-bold hover:from-slate-200 hover:to-slate-300 transition-all duration-300 hover:-translate-y-1 btn-hover-lift shadow-sm hover:shadow-md"
              >
                <Eye className="h-4 w-4" /> Détails
              </button>
              {app.status === "PENDING" && (
                <button
                  onClick={() => onWithdrawApplication(app.id)}
                  disabled={withdrawingId === app.id}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-2xl text-sm font-bold hover:from-red-100 hover:to-red-200 transition-all duration-300 hover:-translate-y-1 btn-hover-lift shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                >
                  {withdrawingId === app.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Retirer
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
