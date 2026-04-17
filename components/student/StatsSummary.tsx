import { Application } from "@/types/student";
import { BarChart3, ArrowRight } from "lucide-react";

interface StatsSummaryProps {
  applications: Application[];
  onNavigateToApplications: () => void;
}

export function StatsSummary({ applications, onNavigateToApplications }: StatsSummaryProps) {
  const acceptedCount = applications.filter((a) => a.status === "ACCEPTED").length;
  const interviewCount = applications.filter((a) => a.status === "INTERVIEW").length;
  const successRate = Math.round((acceptedCount / Math.max(applications.length, 1)) * 100);
  const responseRate = Math.round(((acceptedCount + interviewCount) / Math.max(applications.length, 1)) * 100);

  const monthlyApps = applications.filter(a => 
    new Date(a.applied_at).getMonth() === new Date().getMonth()
  ).length;

  const quickStats = [
    { label: "Ce mois", value: monthlyApps },
    { label: "Réponses", value: acceptedCount + interviewCount },
    { label: "En cours", value: applications.filter(a => a.status === "PENDING").length },
    { label: "Taux réponse", value: `${responseRate}%` }
  ];

  return (
    <div className="bg-gradient-to-r from-primary to-violet-600 rounded-3xl p-8 text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">📊 Résumé de vos candidatures</h2>
            <p className="text-white/80">
              {applications.length === 0 
                ? "Commencez à postuler pour voir vos statistiques évoluer"
                : `Vous avez postulé à ${applications.length} offre${applications.length > 1 ? "s" : ""} au total`
              }
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{successRate}%</p>
            <p className="text-sm text-white/70">Taux de succès</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map(({ label, value }) => (
            <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-white/80">{label}</p>
            </div>
          ))}
        </div>

        {/* Action button */}
        <div className="mt-6">
          <button
            onClick={onNavigateToApplications}
            className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-2xl font-semibold hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <BarChart3 className="h-5 w-5" />
            Voir toutes les candidatures
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
