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
      {/* Modern Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/employer" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">FlexJob</h1>
                <p className="text-xs text-slate-600">Employeur</p>
              </div>
            </Link>
            
            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center gap-8">
              {EMPLOYER_MENU.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative text-slate-700 hover:text-blue-600 transition-all duration-200 font-medium group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-200"></span>
                </Link>
              ))}
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">Employeur</p>
                  <p className="text-xs text-slate-600">En ligne</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                  E
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout} 
                  className="flex items-center gap-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-slate-700" />
              ) : (
                <Menu className="h-6 w-6 text-slate-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 space-y-2 border-t border-slate-200 pt-4">
              {EMPLOYER_MENU.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-all duration-200 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                  E
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Employeur</p>
                  <p className="text-xs text-slate-600">En ligne</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full mt-2 flex items-center gap-2 justify-center border-slate-200 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen">
        {children}
      </main>

      {/* Modern Footer */}
      <footer className="bg-slate-900 text-white mt-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <div>
                <p className="font-semibold">FlexJob</p>
                <p className="text-xs text-slate-400">Plateforme d'emploi moderne</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              © 2026 FlexJob. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
