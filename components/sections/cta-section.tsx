"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, CheckCircle } from "lucide-react";

const benefits = [
  "Inscription 100% gratuite",
  "Aucune carte bancaire requise",
  "Commencez en 2 minutes",
];

export function CTASection() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 30,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 30,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section ref={sectionRef} className="py-28">
      <div className="container mx-auto px-4">
        <div 
          className={`relative overflow-hidden rounded-[2.5rem] bg-primary p-12 md:p-20 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          {/* Animated Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Moving gradient orbs */}
            <div 
              className="absolute -top-20 -right-20 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl transition-transform duration-300 ease-out"
              style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
            />
            <div 
              className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl transition-transform duration-300 ease-out"
              style={{ transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)` }}
            />
            
            {/* Animated particles */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-primary-foreground/30 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `float-up ${5 + Math.random() * 10}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                  }}
                />
              ))}
            </div>
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff1_1px,transparent_1px),linear-gradient(to_bottom,#fff1_1px,transparent_1px)] bg-[size:50px_50px] opacity-20" />
          </div>

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div 
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-foreground/10 backdrop-blur-sm text-primary-foreground text-sm font-semibold mb-8 
                border border-primary-foreground/20 transition-all duration-700 delay-200 hover:scale-105 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <Sparkles className="h-4 w-4 animate-pulse" />
              Rejoignez-nous gratuitement
              <Zap className="h-4 w-4 animate-pulse" />
            </div>

            {/* Headline */}
            <h2 
              className={`text-4xl md:text-6xl font-bold text-primary-foreground mb-6 text-balance transition-all duration-700 delay-300 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Pret a commencer votre aventure ?
            </h2>

            {/* Description */}
            <p 
              className={`text-xl text-primary-foreground/80 mb-10 leading-relaxed transition-all duration-700 delay-400 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Rejoignez FlexJob des aujourd{"'"}hui et accedez a des centaines
              d{"'"}opportunites de jobs flexibles adaptes a votre emploi du
              temps.
            </p>

            {/* CTA Buttons */}
            <div 
              className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 transition-all duration-700 delay-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="group h-14 px-8 text-base font-semibold hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                <Link href="/register">
                  Creer mon compte gratuitement
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-14 px-8 text-base font-semibold bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50 hover:scale-105 transition-all duration-300"
              >
                <Link href="/login">J{"'"}ai deja un compte</Link>
              </Button>
            </div>

            {/* Benefits */}
            <div 
              className={`flex flex-wrap items-center justify-center gap-6 transition-all duration-700 delay-600 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 text-sm text-primary-foreground/70"
                >
                  <CheckCircle className="h-4 w-4 text-primary-foreground/50" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-6 left-6 w-3 h-3 rounded-full bg-primary-foreground/20 animate-ping" style={{ animationDuration: "2s" }} />
          <div className="absolute bottom-6 right-6 w-3 h-3 rounded-full bg-primary-foreground/20 animate-ping" style={{ animationDuration: "2.5s" }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes float-up {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-40px) translateX(20px);
            opacity: 0.8;
          }
        }
      `}</style>
    </section>
  );
}
