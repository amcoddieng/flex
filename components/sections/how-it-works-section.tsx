"use client";

import { useEffect, useRef, useState } from "react";
import { UserPlus, Search, Briefcase, CheckCircle, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Creez votre compte",
    description:
      "Inscrivez-vous en quelques clics et telechargez votre carte etudiante pour verification.",
  },
  {
    icon: Search,
    step: "02",
    title: "Parcourez les offres",
    description:
      "Explorez des centaines d'offres filtrees par categorie, lieu et disponibilite.",
  },
  {
    icon: Briefcase,
    step: "03",
    title: "Postulez facilement",
    description:
      "Postulez en un clic et suivez l'etat de vos candidatures en temps reel.",
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Commencez a travailler",
    description:
      "Une fois accepte, commencez a travailler selon vos disponibilites et gagnez de l'argent.",
  },
];

export function HowItWorksSection() {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [activeStep, setActiveStep] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHeaderVisible(true);
      },
      { threshold: 0.3 }
    );

    if (headerRef.current) headerObserver.observe(headerRef.current);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          steps.forEach((_, index) => {
            setTimeout(() => {
              setVisibleItems((prev) => new Set([...prev, index]));
              setActiveStep(index);
            }, index * 300);
          });
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      headerObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  return (
    <section className="py-28 bg-muted/30 relative overflow-hidden" ref={sectionRef}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div 
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-20 transition-all duration-1000 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            <CheckCircle className="h-4 w-4" />
            Processus Simple
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Comment ca marche ?
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            En 4 etapes simples, trouvez le job ideal qui s{"'"}adapte a votre
            vie d{"'"}etudiant.
          </p>
        </div>

        {/* Steps */}
        <div className="relative max-w-6xl mx-auto">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-28 left-[12%] right-[12%] h-1 bg-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative transition-all duration-700 ease-out ${
                  visibleItems.has(index)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
              >
                {/* Card */}
                <div 
                  className={`relative bg-card rounded-3xl p-8 border transition-all duration-500 ${
                    activeStep >= index 
                      ? "border-primary/30 shadow-xl shadow-primary/5" 
                      : "border-border"
                  }`}
                >
                  {/* Step Number Circle */}
                  <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                    {/* Outer ring animation */}
                    <div
                      className={`absolute inset-0 rounded-full transition-all duration-700 ${
                        activeStep >= index
                          ? "bg-primary scale-100"
                          : "bg-muted scale-90"
                      }`}
                    />
                    {/* Pulse effect */}
                    {activeStep === index && (
                      <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" />
                    )}
                    {/* Orbiting dot */}
                    {activeStep >= index && (
                      <div 
                        className="absolute w-3 h-3 rounded-full bg-primary-foreground shadow-lg"
                        style={{
                          animation: "orbit 3s linear infinite",
                          transformOrigin: "40px 40px",
                        }}
                      />
                    )}
                    <step.icon
                      className={`relative z-10 h-9 w-9 transition-all duration-500 ${
                        activeStep >= index
                          ? "text-primary-foreground scale-100"
                          : "text-muted-foreground scale-90"
                      }`}
                    />
                  </div>

                  {/* Step Label */}
                  <div className={`text-xs font-bold mb-3 tracking-[0.2em] transition-colors duration-500 ${
                    activeStep >= index ? "text-primary" : "text-muted-foreground"
                  }`}>
                    ETAPE {step.step}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>

                  {/* Checkmark for completed steps */}
                  {activeStep > index && (
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </div>

                {/* Arrow connector - Mobile/Tablet */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center py-4">
                    <ArrowRight className={`w-6 h-6 transition-colors duration-500 ${
                      activeStep > index ? "text-primary" : "text-muted-foreground/30"
                    }`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes orbit {
          from {
            transform: rotate(0deg) translateX(32px) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(32px) rotate(-360deg);
          }
        }
      `}</style>
    </section>
  );
}
