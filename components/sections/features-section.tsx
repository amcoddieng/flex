"use client";

import { useEffect, useRef, useState } from "react";
import { Zap, MessageCircle, Shield, TrendingUp, Clock, Award, ArrowUpRight } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Jobs Flexibles",
    description:
      "Trouvez des jobs adaptes a votre emploi du temps d'etudiant avec des horaires personnalisables.",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600",
  },
  {
    icon: MessageCircle,
    title: "Communaute Active",
    description:
      "Echangez avec d'autres etudiants, partagez vos experiences et obtenez des conseils precieux.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-600",
  },
  {
    icon: Shield,
    title: "100% Securise",
    description:
      "Tous les profils et employeurs sont verifies par notre equipe pour votre securite.",
    color: "from-emerald-500 to-green-500",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-600",
  },
  {
    icon: TrendingUp,
    title: "Opportunites Croissantes",
    description:
      "Accedez a des centaines d'offres mises a jour quotidiennement dans tous les secteurs.",
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
    textColor: "text-violet-600",
  },
  {
    icon: Clock,
    title: "Postulez en 1 Clic",
    description:
      "Processus de candidature simplifie pour postuler rapidement aux offres qui vous interessent.",
    color: "from-rose-500 to-pink-500",
    bgColor: "bg-rose-500/10",
    textColor: "text-rose-600",
  },
  {
    icon: Award,
    title: "Gains Garantis",
    description:
      "Paiements securises et transparents avec suivi de vos revenus en temps reel.",
    color: "from-cyan-500 to-teal-500",
    bgColor: "bg-cyan-500/10",
    textColor: "text-cyan-600",
  },
];

export function FeaturesSection() {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHeaderVisible(true);
      },
      { threshold: 0.3 }
    );

    if (headerRef.current) headerObserver.observe(headerRef.current);

    const observers = itemRefs.current.map((ref, index) => {
      if (!ref) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, index]));
          }
        },
        { threshold: 0.2 }
      );
      observer.observe(ref);
      return observer;
    });

    return () => {
      headerObserver.disconnect();
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  return (
    <section id="features" className="py-28 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div 
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-20 transition-all duration-1000 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 hover:bg-primary/15 transition-colors duration-300">
            <Zap className="h-4 w-4" />
            Fonctionnalites
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Pourquoi choisir{" "}
            <span className="relative inline-block">
              <span className="text-primary">FlexJob</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" preserveAspectRatio="none">
                <path d="M0,6 Q50,0 100,6 T200,6" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary/30" />
              </svg>
            </span>{" "}
            ?
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Une plateforme complete concue specialement pour les etudiants
            senegalais, avec tout ce dont vous avez besoin pour trouver le job
            ideal.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => { itemRefs.current[index] = el }}
              className={`group relative p-8 rounded-3xl border border-border bg-card overflow-hidden cursor-default
                transition-all duration-700 ease-out
                ${visibleItems.has(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
                ${hoveredIndex === index ? "shadow-2xl shadow-primary/10 border-primary/20 -translate-y-2" : "hover:shadow-xl"}
              `}
              style={{ transitionDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Gradient overlay on hover */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-500 ${
                  hoveredIndex === index ? "opacity-5" : ""
                }`}
              />

              {/* Animated corner accent */}
              <div 
                className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${feature.color} rounded-full blur-2xl transition-all duration-700 ${
                  hoveredIndex === index ? "opacity-20 scale-150" : "opacity-0 scale-100"
                }`}
              />

              {/* Icon */}
              <div
                className={`relative inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.bgColor} ${feature.textColor} mb-6 
                  transition-all duration-500 ${hoveredIndex === index ? "scale-110 rotate-6" : ""}`}
              >
                <feature.icon className="h-8 w-8" />
                {/* Pulse ring */}
                <div 
                  className={`absolute inset-0 rounded-2xl ${feature.bgColor} transition-all duration-500 ${
                    hoveredIndex === index ? "animate-ping opacity-50" : "opacity-0"
                  }`}
                  style={{ animationDuration: "1.5s" }}
                />
              </div>

              {/* Content */}
              <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${
                hoveredIndex === index ? "text-primary" : ""
              }`}>
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Arrow */}
              <div 
                className={`absolute bottom-8 right-8 transition-all duration-500 ${
                  hoveredIndex === index ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                }`}
              >
                <div className={`w-10 h-10 rounded-full ${feature.bgColor} ${feature.textColor} flex items-center justify-center`}>
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>

              {/* Bottom line accent */}
              <div 
                className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.color} transition-all duration-500 ${
                  hoveredIndex === index ? "w-full" : "w-0"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
