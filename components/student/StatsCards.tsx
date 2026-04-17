import { Application } from "@/types/student";
import { FileText, Clock, CheckCircle, Star, TrendingUp, Minus, Eye, BarChart3, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  applications: Application[];
  loadingApps: boolean;
  onNavigateToApplications: () => void;
}

export function StatsCards({ applications, loadingApps, onNavigateToApplications }: StatsCardsProps) {
  const pendingCount = applications.filter((a) => a.status === "PENDING").length;
  const acceptedCount = applications.filter((a) => a.status === "ACCEPTED").length;
  const interviewCount = applications.filter((a) => a.status === "INTERVIEW").length;

  const stats = [
    { 
      label: "Total candidatures", 
      value: applications.length, 
      icon: FileText,  
      color: "from-blue-500 to-blue-600", 
      bg: "from-blue-50 to-blue-100", 
      border: "border-blue-200",
      trend: applications.length > 0 ? "up" : "neutral",
      percentage: applications.length > 0 ? "+12%" : "0%"
    },
    { 
      label: "En attente", 
      value: pendingCount,         
      icon: Clock,     
      color: "from-amber-500 to-amber-600", 
      bg: "from-amber-50 to-amber-100", 
      border: "border-amber-200",
      trend: pendingCount > 0 ? "up" : "neutral",
      percentage: pendingCount > 0 ? "+5%" : "0%"
    },
    { 
      label: "Acceptées", 
      value: acceptedCount,        
      icon: CheckCircle,
      color: "from-emerald-500 to-emerald-600",
      bg: "from-emerald-50 to-emerald-100",
      border: "border-emerald-200",
      trend: acceptedCount > 0 ? "up" : "neutral",
      percentage: acceptedCount > 0 ? "+18%" : "0%"
    },
    { 
      label: "Entretiens", 
      value: interviewCount,       
      icon: Star,      
      color: "from-violet-500 to-violet-600", 
      bg: "from-violet-50 to-violet-100",
      border: "border-violet-200",
      trend: interviewCount > 0 ? "up" : "neutral",
      percentage: interviewCount > 0 ? "+8%" : "0%"
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map(({ label, value, icon: Icon, color, bg, border, trend, percentage }) => (
        <div 
          key={label} 
          className={cn(
            "relative overflow-hidden rounded-3xl border backdrop-blur-md transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer group",
            border, "bg-white/80"
          )}
          onClick={onNavigateToApplications}
        >
          {/* Background gradient */}
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5", bg)} />
          
          {/* Animated decorative elements */}
          <div className={cn("absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700", color)} />
          <div className={cn("absolute -bottom-2 -left-2 w-12 h-12 bg-gradient-to-br opacity-15 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700", color)} />
          
          <div className="relative p-6">
            {/* Header with icon and trend */}
            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl",
                "bg-gradient-to-br", color, "text-white shadow-lg"
              )}>
                <Icon className="h-7 w-7" />
              </div>
              
              {/* Trend indicator */}
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
                trend === "up" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
              )}>
                {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                {percentage}
              </div>
            </div>

            {/* Main value */}
            <div className="mb-2">
              <p className="text-3xl font-bold text-slate-800 mb-1">
                {loadingApps ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    <span className="text-slate-400">...</span>
                  </div>
                ) : (
                  <span className="group-hover:scale-105 transition-transform duration-300">{value}</span>
                )}
              </p>
              <p className="text-sm text-slate-600 font-semibold">{label}</p>
            </div>
            
            {/* Progress indicator with animation */}
            {!loadingApps && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Progression</span>
                  <span>{Math.min(value * 10, 100)}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full bg-gradient-to-r rounded-full transition-all duration-1000 ease-out",
                      color
                    )} 
                    style={{ 
                      width: `${Math.min(value * 10, 100)}%`,
                      animation: value > 0 ? 'slideIn 1s ease-out' : 'none'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Hover action hint */}
            <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-xs text-primary font-medium flex items-center gap-1">
                <Eye className="h-3 w-3" /> Voir les détails
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
