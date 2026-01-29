"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, ArrowUpRight, Heart } from "lucide-react";

const footerLinks = {
  students: [
    { href: "/jobs", label: "Parcourir les offres" },
    { href: "#", label: "Communaute" },
    { href: "#", label: "Comment ca marche" },
    { href: "/register", label: "Creer un compte" },
  ],
  employers: [
    { href: "#", label: "Publier une offre" },
    { href: "#", label: "Rechercher des profils" },
    { href: "#", label: "Tarifs" },
    { href: "#", label: "Devenir partenaire" },
  ],
  support: [
    { href: "#", label: "Centre d'aide" },
    { href: "#", label: "Contact" },
    { href: "#", label: "A propos" },
    { href: "#", label: "Conditions d'utilisation" },
  ],
};

export function Footer() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  return (
    <footer className="relative border-t border-border bg-muted/30 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <Briefcase className="h-6 w-6 text-primary-foreground" />
                <div className="absolute inset-0 rounded-xl bg-primary blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              </div>
              <div>
                <h4 className="font-bold text-lg">FlexJob</h4>
                <p className="text-xs text-muted-foreground">Senegal</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              La plateforme de reference pour les jobs etudiants au Senegal.
              Connectez talent et opportunites.
            </p>
            {/* Social proof */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Fait avec</span>
              <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
              <span>au Senegal</span>
            </div>
          </div>

          {/* Students */}
          <div>
            <h5 className="font-bold mb-6 text-foreground">Etudiants</h5>
            <ul className="space-y-3">
              {footerLinks.students.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all duration-300"
                    onMouseEnter={() => setHoveredLink(link.label)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <span className="relative">
                      {link.label}
                      <span
                        className={`absolute -bottom-0.5 left-0 h-px bg-primary transition-all duration-300 ${
                          hoveredLink === link.label ? "w-full" : "w-0"
                        }`}
                      />
                    </span>
                    <ArrowUpRight
                      className={`h-3 w-3 transition-all duration-300 ${
                        hoveredLink === link.label
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-2"
                      }`}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h5 className="font-bold mb-6 text-foreground">Employeurs</h5>
            <ul className="space-y-3">
              {footerLinks.employers.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all duration-300"
                    onMouseEnter={() => setHoveredLink(link.label)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <span className="relative">
                      {link.label}
                      <span
                        className={`absolute -bottom-0.5 left-0 h-px bg-primary transition-all duration-300 ${
                          hoveredLink === link.label ? "w-full" : "w-0"
                        }`}
                      />
                    </span>
                    <ArrowUpRight
                      className={`h-3 w-3 transition-all duration-300 ${
                        hoveredLink === link.label
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-2"
                      }`}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h5 className="font-bold mb-6 text-foreground">Support</h5>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all duration-300"
                    onMouseEnter={() => setHoveredLink(link.label)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <span className="relative">
                      {link.label}
                      <span
                        className={`absolute -bottom-0.5 left-0 h-px bg-primary transition-all duration-300 ${
                          hoveredLink === link.label ? "w-full" : "w-0"
                        }`}
                      />
                    </span>
                    <ArrowUpRight
                      className={`h-3 w-3 transition-all duration-300 ${
                        hoveredLink === link.label
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-2"
                      }`}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 FlexJob Senegal. Tous droits reserves.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              Politique de confidentialite
            </Link>
            <span className="text-muted-foreground/30">|</span>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              Mentions legales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
