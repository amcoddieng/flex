"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Banknote,
  Building2,
  Heart,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: "full-time" | "part-time" | "freelance" | "internship";
  category: string;
  postedAt: string;
  description: string;
  urgent?: boolean;
}

interface JobCardProps {
  job: Job;
  index?: number;
  isVisible?: boolean;
}

const typeColors = {
  "full-time": "bg-blue-500/10 text-blue-600 border-blue-200",
  "part-time": "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  freelance: "bg-violet-500/10 text-violet-600 border-violet-200",
  internship: "bg-amber-500/10 text-amber-600 border-amber-200",
};

const typeLabels = {
  "full-time": "Temps plein",
  "part-time": "Temps partiel",
  freelance: "Freelance",
  internship: "Stage",
};

export function JobCard({ job, index = 0, isVisible = true }: JobCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border transition-all duration-500 cursor-pointer",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
        isHovered ? "border-primary/40 shadow-2xl shadow-primary/10 -translate-y-2" : "hover:shadow-xl"
      )}
      style={{ transitionDelay: `${index * 80}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 transition-opacity duration-500",
          isHovered ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Urgent indicator bar */}
      {job.urgent && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-destructive via-destructive to-destructive/50" />
      )}

      <CardContent className="p-6 relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            {/* Company Logo with animation */}
            <div 
              className={cn(
                "w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground transition-all duration-500",
                isHovered ? "bg-primary text-primary-foreground scale-110 rotate-3" : ""
              )}
            >
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h3 className={cn(
                "font-bold text-lg transition-colors duration-300",
                isHovered ? "text-primary" : ""
              )}>
                {job.title}
              </h3>
              <p className="text-sm text-muted-foreground">{job.company}</p>
            </div>
          </div>

          {/* Favorite Button with pulse animation */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className={cn(
              "p-2.5 rounded-full transition-all duration-300 hover:scale-110",
              isFavorite
                ? "bg-rose-500/10 text-rose-500"
                : "bg-muted text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
            )}
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-transform duration-300",
                isFavorite && "fill-current scale-110"
              )}
            />
          </button>
        </div>

        {/* Tags with stagger animation */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge
            variant="outline"
            className={cn(
              "border font-medium transition-all duration-300",
              typeColors[job.type],
              isHovered ? "scale-105" : ""
            )}
          >
            {typeLabels[job.type]}
          </Badge>
          <Badge 
            variant="secondary"
            className={cn(
              "transition-all duration-300",
              isHovered ? "scale-105" : ""
            )}
            style={{ transitionDelay: "50ms" }}
          >
            {job.category}
          </Badge>
          {job.urgent && (
            <Badge 
              className={cn(
                "bg-destructive/10 text-destructive border-destructive/20 transition-all duration-300",
                isHovered ? "scale-105 animate-pulse" : ""
              )}
              style={{ transitionDelay: "100ms" }}
            >
              <Zap className="h-3 w-3 mr-1" />
              Urgent
            </Badge>
          )}
        </div>

        {/* Details with icon animations */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className={cn(
            "flex items-center gap-2 text-muted-foreground transition-all duration-300",
            isHovered ? "translate-x-1" : ""
          )}>
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
          <div className={cn(
            "flex items-center gap-2 text-muted-foreground transition-all duration-300",
            isHovered ? "translate-x-1" : ""
          )} style={{ transitionDelay: "50ms" }}>
            <Clock className="h-4 w-4" />
            <span>{job.postedAt}</span>
          </div>
          <div className={cn(
            "flex items-center gap-2 col-span-2 font-semibold transition-all duration-300",
            isHovered ? "text-primary translate-x-1" : "text-foreground"
          )} style={{ transitionDelay: "100ms" }}>
            <Banknote className={cn("h-4 w-4 transition-transform duration-300", isHovered ? "scale-110" : "")} />
            <span>{job.salary}</span>
          </div>
        </div>

        {/* Description with fade effect */}
        <p className={cn(
          "text-sm text-muted-foreground line-clamp-2 mb-5 transition-all duration-300",
          isHovered ? "text-foreground/70" : ""
        )}>
          {job.description}
        </p>

        {/* CTA with glow effect */}
        <Button
          className={cn(
            "w-full group/btn transition-all duration-500",
            isHovered 
              ? "shadow-xl shadow-primary/30 scale-[1.02]" 
              : "shadow-lg shadow-primary/10"
          )}
        >
          Voir l{"'"}offre
          <ArrowRight className={cn(
            "ml-2 h-4 w-4 transition-all duration-300",
            isHovered ? "translate-x-1" : ""
          )} />
        </Button>
      </CardContent>

      {/* Corner decoration */}
      <div 
        className={cn(
          "absolute -bottom-8 -right-8 w-24 h-24 bg-primary/10 rounded-full transition-all duration-500",
          isHovered ? "scale-150 opacity-100" : "scale-100 opacity-0"
        )}
      />
    </Card>
  );
}
