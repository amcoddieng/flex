"use client";

import { useEffect, useRef, useState } from "react";
import { Users, Briefcase, Building2, Star } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: 500,
    suffix: "+",
    label: "Etudiants actifs",
    description: "sur la plateforme",
  },
  {
    icon: Briefcase,
    value: 200,
    suffix: "+",
    label: "Offres disponibles",
    description: "mises a jour quotidiennement",
  },
  {
    icon: Building2,
    value: 150,
    suffix: "+",
    label: "Employeurs verifies",
    description: "partenaires de confiance",
  },
  {
    icon: Star,
    value: 98,
    suffix: "%",
    label: "Taux de satisfaction",
    description: "des utilisateurs satisfaits",
  },
];

function AnimatedCounter({
  end,
  suffix,
  isVisible,
}: {
  end: number;
  suffix: string;
  isVisible: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2500;
    const steps = 80;
    const increment = end / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, end]);

  return (
    <span className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`group relative bg-card rounded-3xl p-8 border border-border overflow-hidden
                transition-all duration-700 ease-out cursor-default
                ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
                ${hoveredIndex === index ? "scale-105 shadow-2xl shadow-primary/10 border-primary/30" : "hover:shadow-xl"}
              `}
              style={{ transitionDelay: `${index * 150}ms` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Animated background gradient */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 transition-opacity duration-500 ${
                  hoveredIndex === index ? "opacity-100" : "opacity-0"
                }`}
              />
              
              {/* Ripple effect on hover */}
              <div 
                className={`absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full bg-primary/10 transition-transform duration-700 ${
                  hoveredIndex === index ? "scale-[3]" : "scale-0"
                }`}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div 
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 transition-all duration-500 ${
                    hoveredIndex === index 
                      ? "bg-primary text-primary-foreground scale-110 rotate-3" 
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <stat.icon className="h-7 w-7" />
                </div>

                {/* Value with scale animation */}
                <div 
                  className={`text-4xl md:text-5xl font-bold text-foreground mb-2 transition-transform duration-500 ${
                    hoveredIndex === index ? "scale-110" : ""
                  }`}
                >
                  <AnimatedCounter
                    end={stat.value}
                    suffix={stat.suffix}
                    isVisible={isVisible}
                  />
                </div>

                {/* Label */}
                <div className="text-base font-semibold text-foreground mb-1">
                  {stat.label}
                </div>

                {/* Description with slide up */}
                <div 
                  className={`text-sm text-muted-foreground transition-all duration-500 ${
                    hoveredIndex === index ? "opacity-100 translate-y-0" : "opacity-70 translate-y-1"
                  }`}
                >
                  {stat.description}
                </div>
              </div>

              {/* Corner decoration */}
              <div 
                className={`absolute top-0 right-0 w-20 h-20 transition-all duration-500 ${
                  hoveredIndex === index ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary animate-ping" />
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
