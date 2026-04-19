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
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-300 sticky top-0 h-screen transition-all duration-300 shadow-sm ${
        sidebarOpen ? 'md:flex' : 'hidden md:flex'
      }`}>
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
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
