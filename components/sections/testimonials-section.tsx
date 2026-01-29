"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "Amadou Diallo",
    role: "Etudiant en Informatique",
    university: "UCAD Dakar",
    content:
      "FlexJob m'a permis de trouver des jobs de developpeur web qui s'adaptent parfaitement a mes etudes. J'ai pu financer mon materiel tout en gardant mes notes excellentes !",
    rating: 5,
    avatar: "AD",
  },
  {
    name: "Fatou Sarr",
    role: "Etudiante en Commerce",
    university: "UGB Saint-Louis",
    content:
      "La communaute est tres active et les offres sont variees. J'ai trouve un job de vendeuse le week-end qui me convient parfaitement. Excellent moyen de financer mes etudes.",
    rating: 5,
    avatar: "FS",
  },
  {
    name: "Moussa Ba",
    role: "Etudiant en Droit",
    university: "UCAD Dakar",
    content:
      "Grace a FlexJob, j'ai trouve un stage dans un cabinet d'avocat. Le processus etait simple et rapide. Je recommande a tous les etudiants !",
    rating: 5,
    avatar: "MB",
  },
  {
    name: "Khady Diop",
    role: "Etudiante en Marketing",
    university: "ISM Dakar",
    content:
      "Les employeurs sur FlexJob sont serieux et respectueux. J'ai pu travailler comme community manager pour plusieurs entreprises. Une experience enrichissante !",
    rating: 5,
    avatar: "KD",
  },
];

export function TestimonialsSection() {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);

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

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="testimonials" className="py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div 
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            <Star className="h-4 w-4 fill-current" />
            Temoignages
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Ce que disent nos etudiants
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Rejoignez des centaines d{"'"}etudiants satisfaits qui ont trouve
            leur job ideal sur FlexJob.
          </p>
        </div>

        {/* Mobile Slider */}
        <div className="md:hidden relative">
          <Card className="overflow-hidden border-primary/20 shadow-xl">
            <CardContent className="p-8">
              <Quote className="h-12 w-12 text-primary/20 mb-4" />
              <div className="flex gap-1 mb-4">
                {[...Array(testimonials[currentSlide].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-lg leading-relaxed mb-6">
                &ldquo;{testimonials[currentSlide].content}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {testimonials[currentSlide].avatar}
                </div>
                <div>
                  <p className="font-bold">{testimonials[currentSlide].name}</p>
                  <p className="text-sm text-muted-foreground">{testimonials[currentSlide].role}</p>
                  <p className="text-xs text-primary">{testimonials[currentSlide].university}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button variant="outline" size="icon" onClick={prevSlide} className="rounded-full bg-transparent">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentSlide ? "w-6 bg-primary" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={nextSlide} className="rounded-full bg-transparent">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              ref={(el) => { itemRefs.current[index] = el }}
              className={`group relative overflow-hidden transition-all duration-700 ease-out cursor-default
                ${visibleItems.has(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
                ${hoveredIndex === index ? "shadow-2xl shadow-primary/10 border-primary/30 -translate-y-2" : "border-border hover:shadow-xl"}
              `}
              style={{ transitionDelay: `${index * 150}ms` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Gradient overlay */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent transition-opacity duration-500 ${
                  hoveredIndex === index ? "opacity-100" : "opacity-0"
                }`}
              />

              <CardContent className="p-8 relative z-10">
                {/* Quote Icon with animation */}
                <Quote 
                  className={`h-12 w-12 mb-4 transition-all duration-500 ${
                    hoveredIndex === index ? "text-primary/40 scale-110" : "text-primary/20"
                  }`}
                />

                {/* Rating with stagger animation */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 fill-yellow-500 text-yellow-500 transition-all duration-300 ${
                        hoveredIndex === index ? "scale-110" : ""
                      }`}
                      style={{ transitionDelay: `${i * 50}ms` }}
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-foreground leading-relaxed mb-6 text-lg">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div 
                    className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 ${
                      hoveredIndex === index 
                        ? "bg-primary text-primary-foreground scale-110" 
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                    <p className={`text-xs transition-colors duration-300 ${
                      hoveredIndex === index ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {testimonial.university}
                    </p>
                  </div>
                </div>

                {/* Decorative corner */}
                <div 
                  className={`absolute -bottom-8 -right-8 w-24 h-24 bg-primary/10 rounded-full transition-all duration-500 ${
                    hoveredIndex === index ? "scale-150 opacity-100" : "scale-100 opacity-0"
                  }`}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
