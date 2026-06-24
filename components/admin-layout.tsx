"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  CheckCircle,
  Shield,
  GraduationCap,
  UserCog
} from "lucide-react";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const getValidToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = decodeToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      localStorage.removeItem('token');
      return null;
    }
    return token;
  };

  useEffect(() => {
    const token = getValidToken();
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAuthed(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const menuItems = [
    { title: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
    { title: "Validation Employeurs", href: "/admin/employer-validation", icon: CheckCircle },
    { title: "Gestion Utilisateurs", href: "/admin/users", icon: Users },
    { title: "Étudiants", href: "/admin/students", icon: GraduationCap },
    { title: "Employeurs", href: "/admin/employers", icon: Briefcase },
    { title: "Offres", href: "/admin/jobs", icon: FileText },
    { title: "Candidatures", href: "/admin/applications", icon: Shield },
    { title: "Modérateurs", href: "/admin/moderators", icon: UserCog },
  ];

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* Sidebar */}
      <aside className={`hidden md:flex md:flex-shrink-0 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="w-full bg-slate-900 text-white flex flex-col min-h-screen">
          {/* Logo */}
          <div className="p-5 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                {sidebarOpen && (
                  <div>
                    <h1 className="text-lg font-bold text-white">Admin</h1>
                    <p className="text-[10px] text-slate-400">Panel</p>
                  </div>
                )}
              </Link>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                {sidebarOpen ? <X className="h-4 w-4 text-slate-400" /> : <Menu className="h-4 w-4 text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
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
                  <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'} transition-colors flex-shrink-0`} />
                  {sidebarOpen && <span className="text-sm">{item.title}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-lg ring-2 ring-slate-700 flex-shrink-0">
                A
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">Administrateur</p>
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
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200/60 px-6 py-3 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-sm font-bold text-slate-900">
              {menuItems.find(item => item.href === pathname)?.title || "Administration"}
            </h2>
          </div>
          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 text-xs" onClick={handleLogout}>
            <LogOut className="h-3.5 w-3.5 mr-1" />
            Sortir
          </Button>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)}>
          <div className="absolute top-0 left-0 h-full w-72 bg-slate-900 text-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-700 flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Admin</h1>
                  <p className="text-[10px] text-slate-400">Panel</p>
                </div>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-slate-800">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <nav className="p-3 space-y-1">
              {menuItems.map((item) => {
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
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.title}</span>
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

      <ScrollToTop />
    </div>
  );
}
