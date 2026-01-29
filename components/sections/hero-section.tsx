"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Play, MousePointer2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);
  const [typedText, setTypedText] = useState("");
  const fullText = "jobs flexibles";

  useEffect(() => {
    setIsVisible(true);
    
    // Typing effect
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);
    
    return () => clearInterval(typingInterval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        {/* Floating orbs with parallax */}
        <div 
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl transition-transform duration-300 ease-out"
          style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` }}
        />
        <div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl transition-transform duration-300 ease-out"
          style={{ transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)` }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl transition-transform duration-300 ease-out"
          style={{ transform: `translate(calc(-50% + ${mousePosition.x * 0.2}px), calc(-50% + ${mousePosition.y * 0.2}px))` }}
        />
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float-particle ${5 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge with glow effect */}
          <div
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 transition-all duration-1000 hover:shadow-lg hover:shadow-primary/20 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="relative">
              La plateforme #1 des jobs etudiants au Senegal
              <span className="absolute inset-0 bg-primary/10 blur-sm -z-10" />
            </span>
          </div>

          {/* Headline with typing effect */}
          <h1
            className={`text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1] transition-all duration-1000 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <span className="block text-balance">
              Trouvez des{" "}
            </span>
            <span className="block relative mt-2">
              <span className="relative z-10 text-primary inline-block min-w-[300px] md:min-w-[500px]">
                {typedText}
                <span className="animate-blink">|</span>
              </span>
              <span 
                className="absolute bottom-2 left-0 h-4 md:h-6 bg-primary/20 -z-0 rounded transition-all duration-200"
                style={{ width: `${(typedText.length / fullText.length) * 100}%` }}
              />
            </span>
            <span className="block mt-2">
              qui s{"'"}adaptent a{" "}
              <span className="relative inline-block group">
                <span className="relative z-10 text-primary">vos etudes</span>
                <span className="absolute bottom-2 left-0 right-0 h-4 md:h-6 bg-primary/20 -z-0 rounded transform origin-left transition-transform duration-500 group-hover:scale-x-110" />
              </span>
            </span>
          </h1>

          {/* Subtitle with stagger */}
          <p
            className={`text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-1000 delay-400 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Connectez-vous avec des employeurs verifies, accedez a des centaines
            d{"'"}offres et rejoignez une communaute active d{"'"}etudiants.
          </p>

          {/* CTA Buttons with magnetic effect */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-1000 delay-500 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <Button
              size="lg"
              asChild
              className="group relative h-14 px-8 text-base font-semibold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-500 hover:scale-105 overflow-hidden"
            >
              <Link href="/register">
                <span className="relative z-10 flex items-center">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="group h-14 px-8 text-base font-semibold hover:scale-105 transition-all duration-500 hover:border-primary/50 hover:bg-primary/5 bg-transparent"
            >
              <Link href="/jobs">
                <Play className="mr-2 h-5 w-5 group-hover:scale-125 group-hover:text-primary transition-all duration-300" />
                Voir les offres
              </Link>
            </Button>
          </div>

          {/* Trust Indicators with hover effects */}
          <div
            className={`flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground transition-all duration-1000 delay-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="group flex items-center gap-2 cursor-default">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-muted to-muted/80 border-2 border-background flex items-center justify-center text-xs font-medium transition-transform duration-300 hover:scale-110 hover:z-10"
                    style={{ transitionDelay: `${i * 50}ms` }}
                  >
                    {["AD", "FS", "MB", "KD"][i - 1]}
                  </div>
                ))}
                <div className="w-9 h-9 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-medium text-primary">
                  +496
                </div>
              </div>
              <span className="group-hover:text-foreground transition-colors duration-300">500+ etudiants actifs</span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="group flex items-center gap-2 cursor-default">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-500 fill-yellow-500 transition-transform duration-300 hover:scale-125"
                    style={{ transitionDelay: `${i * 50}ms` }}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="group-hover:text-foreground transition-colors duration-300">4.9/5 satisfaction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator with pulse */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-muted-foreground">Decouvrir</span>
          <MousePointer2 className="w-5 h-5 text-primary animate-pulse" />
        </div>
      </div>

      <style jsx>{`
        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-30px) translateX(10px);
            opacity: 0.8;
          }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
      `}</style>
    </section>
  );
}
