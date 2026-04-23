"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { usePendingApplications } from "@/hooks/usePendingApplications";
import { 
  Menu, 
  X, 
  LogOut, 
  Briefcase, 
  Home, 
  Users, 
  MessageCircle, 
  User,
  Bell
} from "lucide-react";
import Link from "next/link";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const hasCheckedAuth = useRef(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const decoded = token ? decodeToken(token) : null;
  const { unreadCount, refreshUnreadCount } = useUnreadMessages(token);
  const { pendingCount } = usePendingApplications(token);

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
    { label: "Candidatures", href: "/employer/applications", hasBadge: true },
    { label: "Messages", href: "/employer/messages", hasBadge: true },
    { label: "Profil", href: "/employer/profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="w-64 bg-slate-900 text-white min-h-screen flex-shrink-0">
          {/* Logo */}
          <div className="p-6 border-b border-slate-700">
            <Link href="/employer" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">FlexJob</h1>
                <p className="text-xs text-slate-300">Employeur</p>
              </div>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-2">
            {EMPLOYER_MENU.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200 font-medium group"
              >
                <span className="flex items-center gap-3">
                  {item.label === "Tableau de bord" && <Home className="h-4 w-4" />}
                  {item.label === "Mes offres" && <Briefcase className="h-4 w-4" />}
                  {item.label === "Candidatures" && <Users className="h-4 w-4" />}
                  {item.label === "Messages" && <MessageCircle className="h-4 w-4" />}
                  {item.label === "Profil" && <User className="h-4 w-4" />}
                  {item.label}
                </span>
                {item.hasBadge && (
                  <span className="flex items-center gap-1">
                    {item.href === "/employer/messages" && unreadCount > 0 && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                    )}
                    {item.href === "/employer/applications" && pendingCount > 0 && (
                      <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                    )}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="mt-auto p-4 border-t border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                E
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Employeur</p>
                <p className="text-xs text-slate-300">En ligne</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 text-xs"
            >
              <LogOut className="h-3 w-3 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      
      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Modern Footer - uniquement sur desktop */}
        <footer className="hidden md:block bg-slate-900 text-white mt-auto">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">F</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">FlexJob</p>
                  <p className="text-xs text-slate-400">Plateforme d'emploi moderne</p>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                © 2026 FlexJob. Tous droits réservés.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating Menu Button - uniquement sur mobile */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu - flottant */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute top-0 right-0 h-full w-80 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              {/* Header du menu */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">F</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">FlexJob</h1>
                    <p className="text-xs text-gray-600">Employeur</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              
              {/* Navigation */}
              <nav className="space-y-2">
                {EMPLOYER_MENU.map((item) => {
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-3 rounded-lg font-medium transition-all duration-200 ${
                        isActive 
                          ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="flex items-center gap-3">
                        {item.label === "Tableau de bord" && <Home className="h-5 w-5" />}
                        {item.label === "Mes offres" && <Briefcase className="h-5 w-5" />}
                        {item.label === "Candidatures" && <Users className="h-5 w-5" />}
                        {item.label === "Messages" && <MessageCircle className="h-5 w-5" />}
                        {item.label === "Profil" && <User className="h-5 w-5" />}
                        {item.label}
                      </span>
                      {item.hasBadge && (
                        <span className="flex items-center gap-1">
                          {item.href === "/employer/messages" && unreadCount > 0 && (
                            <>
                              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                              <span className="text-xs bg-blue-500 text-white rounded-full px-2 py-0.5 min-w-[20px] text-center">
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </span>
                            </>
                          )}
                          {item.href === "/employer/applications" && pendingCount > 0 && (
                            <>
                              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                              <span className="text-xs bg-amber-500 text-white rounded-full px-2 py-0.5 min-w-[20px] text-center">
                                {pendingCount > 99 ? '99+' : pendingCount}
                              </span>
                            </>
                          )}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
              
              {/* User Section */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      E
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Employeur</p>
                      <p className="text-sm text-gray-600">En ligne</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full gap-2 border-red-200 hover:bg-red-50 text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
