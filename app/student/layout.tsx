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
  GraduationCap,
  Rocket,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { NotificationsDropdown } from "@/components/student/NotificationsDropdown";
import { useNotifications } from "@/hooks/student/useNotifications";

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
  const { unreadCount: notificationCount } = useNotifications(decoded?.userId ? Number(decoded.userId) : undefined);

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
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const STUDENT_MENU = [
    { label: "Tableau de bord", href: "/student", icon: Home },
    { label: "Offres", href: "/student/jobs", icon: Briefcase },
    { label: "Candidatures", href: "/student/applications", icon: FileText, hasBadge: true },
    { label: "Messages", href: "/student/messages", icon: MessageCircle, hasBadge: true },
    { label: "Forum", href: "/student/forum", icon: BookOpen },
    { label: "Projets", href: "/student/projects", icon: Rocket },
    { label: "Profil", href: "/student/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* Sidebar Desktop */}
      <aside className={`hidden md:flex md:flex-shrink-0 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="w-full bg-slate-900 text-white flex flex-col min-h-screen">
          {/* Logo */}
          <div className="p-5 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <Link href="/student" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                {sidebarOpen && (
                  <div>
                    <h1 className="text-lg font-bold text-white">FlexJob</h1>
                    <p className="text-[10px] text-slate-400">Étudiant</p>
                  </div>
                )}
              </Link>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
                {sidebarOpen ? <X className="h-4 w-4 text-slate-400" /> : <Menu className="h-4 w-4 text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {STUDENT_MENU.map((item) => {
              const isActive = pathname ? (pathname === item.href || pathname.startsWith(item.href + '/')) : false;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-900/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'} transition-colors flex-shrink-0`} />
                    {item.hasBadge && (
                      <>
                        {item.href === "/student/messages" && unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full"></span>
                        )}
                        {item.href === "/student/applications" && pendingCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full"></span>
                        )}
                      </>
                    )}
                  </div>
                  {sidebarOpen && (
                    <>
                      <span className="text-sm flex-1">{item.label}</span>
                      {item.hasBadge && (
                        <>
                          {item.href === "/student/messages" && unreadCount > 0 && (
                            <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{unreadCount > 99 ? '99+' : unreadCount}</span>
                          )}
                          {item.href === "/student/applications" && pendingCount > 0 && (
                            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{pendingCount > 99 ? '99+' : pendingCount}</span>
                          )}
                        </>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-lg ring-2 ring-slate-700 flex-shrink-0">
                E
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">Étudiant</p>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    En ligne
                  </p>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className={`w-full bg-transparent hover:bg-red-500/10 border-slate-600 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all duration-200 text-xs ${!sidebarOpen ? 'px-0 justify-center' : ''}`}
            >
              <LogOut className="h-3.5 w-3.5" />
              {sidebarOpen && <span className="ml-2">Déconnexion</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar Mobile */}
        <div className="bg-white border-b border-slate-200/60 px-4 py-3 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-sm font-bold text-slate-900">{STUDENT_MENU.find(item => item.href === pathname)?.label || "Tableau de bord"}</h2>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsDropdown userId={decoded?.userId ? Number(decoded.userId) : undefined} />
            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 text-xs" onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Desktop Notifications Bar */}
        <div className="hidden md:flex bg-white border-b border-slate-200/60 px-6 py-2.5 items-center justify-end">
          <NotificationsDropdown userId={decoded?.userId ? Number(decoded.userId) : undefined} />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute top-0 left-0 h-full w-72 bg-slate-900 text-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-700 flex items-center justify-between">
              <Link href="/student" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">FlexJob</h1>
                  <p className="text-[10px] text-slate-400">Étudiant</p>
                </div>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-800">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <nav className="p-3 space-y-1">
              {STUDENT_MENU.map((item) => {
                const isActive = pathname ? (pathname === item.href || pathname.startsWith(item.href + '/')) : false;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-200'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                    {item.hasBadge && (
                      <>
                        {item.href === "/student/messages" && unreadCount > 0 && (
                          <span className="ml-auto bg-blue-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{unreadCount > 99 ? '99+' : unreadCount}</span>
                        )}
                        {item.href === "/student/applications" && pendingCount > 0 && (
                          <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{pendingCount > 99 ? '99+' : pendingCount}</span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className="absolute bottom-4 left-4 right-4">
              <Button variant="outline" size="sm" onClick={handleLogout} className="w-full bg-transparent border-slate-600 text-slate-400 hover:text-red-400 hover:border-red-500/30">
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
