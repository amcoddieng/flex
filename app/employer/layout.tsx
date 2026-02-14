"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const decoded = token ? decodeToken(token) : null;

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    if (!decoded || decoded.role !== 'EMPLOYER') {
      router.push('/login');
      return;
    }
    setIsAdmin(true);
  }, [decoded, router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!isAdmin) {
    return <div className="p-8">Vérification...</div>;
  }

  const EMPLOYER_MENU = [
    { label: "Tableau de bord", href: "/employer" },
    { label: "Mes offres", href: "/employer/jobs" },
    { label: "Candidatures", href: "/employer/applications" },
    { label: "Profil", href: "/employer/profile" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/employer" className="text-2xl font-bold text-blue-600">
              FlexJob Employer
            </Link>
            
            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center gap-6">
              {EMPLOYER_MENU.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-slate-700 hover:text-blue-600 transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ))}
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 space-y-2 border-t pt-4">
              {EMPLOYER_MENU.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 rounded text-slate-700 hover:bg-slate-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full mt-2 flex items-center gap-2 justify-center"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-slate-400">
            © 2026 FlexJob. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
