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
  FileText, 
  MessageCircle, 
  User,
  Bell,
  Search,
  Calendar,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

    if (!decoded || decoded.role !== 'STUDENT') {
      router.push('/login');
      return;
    }
    setIsAuthed(true);
  }, [decoded, router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!isAuthed) {
    return <div className="p-8">Vérification...</div>;
  }

  const STUDENT_MENU = [
    { 
      label: "Tableau de bord", 
      href: "/student", 
      icon: Home 
    },
    { 
      label: "Offres", 
      href: "/student/jobs", 
      icon: Briefcase 
    },
    { 
      label: "Candidatures", 
      href: "/student/applications", 
      icon: FileText,
      hasBadge: true 
    },
    { 
      label: "Messages", 
      href: "/student/messages", 
      icon: MessageCircle,
      hasBadge: true 
    },
    { 
      label: "Forum", 
      href: "/student/forum", 
      icon: MessageCircle 
    },
    { 
      label: "Profil", 
      href: "/student/profile", 
      icon: User 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop uniquement - cachée sur mobile */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-300 sticky top-0 h-screen transition-all duration-300 shadow-sm flex-shrink-0`}>
          <div className="p-4">
            {/* Logo */}
            <Link href="/student" className="flex items-center gap-3 group mb-8">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-900 to-purple-900 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                <span className="text-white font-bold">F</span>
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="text-lg font-bold text-gray-900">FlexJob</h1>
                  <p className="text-xs text-gray-600">Étudiant</p>
                </div>
              )}
            </Link>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {STUDENT_MENU.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start ${!sidebarOpen ? 'px-2' : ''}`}
                    onClick={() => router.push(item.href)}
                  >
                    <Icon className="h-4 w-4" />
                    {sidebarOpen && (
                      <>
                        <span className="ml-3">{item.label}</span>
                        {item.hasBadge && (
                          <>
                            {item.href === "/student/messages" && unreadCount > 0 && (
                              <span className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            )}
                            {item.href === "/student/applications" && pendingCount > 0 && (
                              <span className="ml-auto w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </Button>
                );
              })}
            </nav>

            {/* User Profile */}
            {sidebarOpen && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                      E
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Étudiant</p>
                      <p className="text-xs text-gray-600">En ligne</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout} 
                    className="w-full gap-2 border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 text-xs"
                  >
                    <LogOut className="h-3 w-3" />
                    Déconnexion
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Toggle Button */}
          <button
            className="absolute -right-3 top-8 w-6 h-6 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-3 w-3 text-gray-600" />
          </button>
        </div>
      </aside>

      
      {/* Main Content Wrapper - occupe tout l'espace sur mobile */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar - uniquement sur desktop */}
        <div className="hidden md:block bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Bouton toggle sidebar sur tablette */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold text-gray-900">
                {STUDENT_MENU.find(item => item.href === pathname)?.label || "Tableau de bord"}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Étudiant
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-gray-800 hover:text-gray-900 hover:bg-gray-100 border-gray-300"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
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
                    <div className="w-8 h-8 rounded bg-gradient-to-r from-blue-900 to-purple-900 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">F</span>
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-gray-900">FlexJob</h1>
                      <p className="text-xs text-gray-600">Étudiant</p>
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
                  {STUDENT_MENU.map((item) => {
                    const Icon = item.icon;
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
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </span>
                        {item.hasBadge && (
                          <span className="flex items-center gap-1">
                            {item.href === "/student/messages" && unreadCount > 0 && (
                              <>
                                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                                <span className="text-xs bg-blue-600 text-white rounded-full px-2 py-0.5 min-w-[20px] text-center">
                                  {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                              </>
                            )}
                            {item.href === "/student/applications" && pendingCount > 0 && (
                              <>
                                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                                <span className="text-xs bg-orange-500 text-white rounded-full px-2 py-0.5 min-w-[20px] text-center">
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
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        E
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Étudiant</p>
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

        {/* Page Content - occupe tout l'espace disponible */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
