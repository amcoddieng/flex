"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  ArrowRight,
  FileText,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { decodeToken } from "@/lib/jwt";

const navItems = [
  { href: "/", label: "Accueil" },
  { href: "/jobs", label: "Offres" },
  { href: "#features", label: "Fonctionnalités" },
  { href: "#testimonials", label: "Témoignages" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setUser(decodeToken(token));

    const onLogin = () => {
      const token = localStorage.getItem("token");
      if (token) setUser(decodeToken(token));
    };

    const onLogout = () => setUser(null);

    window.addEventListener("user:login", onLogin);
    window.addEventListener("user:logout", onLogout);

    return () => {
      window.removeEventListener("user:login", onLogin);
      window.removeEventListener("user:logout", onLogout);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-white/70 backdrop-blur-xl shadow-lg"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-3 bg-gradient-to-r from-primary to-violet-600 shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/30">
            <Briefcase className="text-white h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight group-hover:text-primary transition-all duration-300">
            FlexJob
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative text-sm font-medium text-slate-600 hover:text-primary transition"
            >
              {item.label}
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-primary transition-all group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              {/* Avatar + name */}
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-100/70 backdrop-blur-sm hover:bg-slate-100/90 transition-all duration-300 hover:shadow-lg">
                <div className="h-10 w-10 bg-gradient-to-r from-primary to-violet-600 flex items-center justify-center text-white font-bold shadow-md">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div className="text-sm">
                  <div className="font-bold text-slate-800">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.role}</div>
                </div>
              </div>

              {/* STUDENT */}
              {user.role === "STUDENT" && (
                <>
                  <Button variant="ghost" asChild className="group relative overflow-hidden px-4 py-2 hover:bg-gradient-to-r hover:from-primary/10 hover:to-violet-500/10 transition-all duration-300 hover:-translate-y-1 btn-hover-lift shadow-sm hover:shadow-lg border border-transparent hover:border-primary/20">
                    <Link href="/student/applications" className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-600 group-hover:text-primary transition-colors duration-300" />
                      <span className="font-medium text-slate-700 group-hover:text-slate-800 transition-colors duration-300">Candidatures</span>
                    </Link>
                  </Button>

                  <Button variant="ghost" asChild className="group relative overflow-hidden px-4 py-2 hover:bg-gradient-to-r hover:from-primary/10 hover:to-violet-500/10 transition-all duration-300 hover:-translate-y-1 btn-hover-lift shadow-sm hover:shadow-lg border border-transparent hover:border-primary/20">
                    <Link href="/forum" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-slate-600 group-hover:text-primary transition-colors duration-300" />
                      <span className="font-medium text-slate-700 group-hover:text-slate-800 transition-colors duration-300">Forum</span>
                    </Link>
                  </Button>
                </>
              )}

              {/* EMPLOYER */}
              {user.role === "EMPLOYER" && (
                <>
                  <Button variant="ghost" asChild className="group relative overflow-hidden px-4 py-2 hover:bg-gradient-to-r hover:from-primary/10 hover:to-violet-500/10 transition-all duration-300 hover:-translate-y-1 btn-hover-lift shadow-sm hover:shadow-lg border border-transparent hover:border-primary/20">
                    <Link href="/employer" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-slate-600 group-hover:text-primary transition-colors duration-300" />
                      <span className="font-medium text-slate-700 group-hover:text-slate-800 transition-colors duration-300">Dashboard</span>
                    </Link>
                  </Button>

                  <Button variant="ghost" asChild className="group relative overflow-hidden px-4 py-2 hover:bg-gradient-to-r hover:from-primary/10 hover:to-violet-500/10 transition-all duration-300 hover:-translate-y-1 btn-hover-lift shadow-sm hover:shadow-lg border border-transparent hover:border-primary/20">
                    <Link href="/forum" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-slate-600 group-hover:text-primary transition-colors duration-300" />
                      <span className="font-medium text-slate-700 group-hover:text-slate-800 transition-colors duration-300">Forum</span>
                    </Link>
                  </Button>
                </>
              )}

              {/* Logout */}
              <Button
                variant="ghost"
                className="group relative overflow-hidden px-4 py-2 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 transition-all duration-300 hover:-translate-y-1 btn-hover-lift shadow-sm hover:shadow-lg border border-transparent hover:border-red-200"
                onClick={() => {
                  localStorage.removeItem("token");
                  window.dispatchEvent(new Event("user:logout"));
                  router.push("/login");
                }}
              >
                <LogOut className="h-4 w-4 mr-2 text-red-600 group-hover:text-red-700 transition-colors duration-300" />
                <span className="font-medium">Déconnexion</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="group relative overflow-hidden px-4 py-2 hover:bg-gradient-to-r hover:from-primary/10 hover:to-violet-500/10 hover:text-primary transition-all duration-300 hover:-translate-y-1 btn-hover-lift shadow-sm hover:shadow-lg border border-transparent hover:border-primary/20">
                <Link href="/login" className="font-medium text-slate-700 group-hover:text-slate-800 transition-colors duration-300">
                  Connexion
                </Link>
              </Button>

              <Button
                asChild
                className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-primary to-violet-600 text-white hover:from-primary/90 hover:to-violet-600/90 hover:scale-105 transition-all duration-300 hover:-translate-y-1 btn-hover-lift shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 border border-primary/20 hover:border-primary/30"
              >
                <Link href="/register" className="flex items-center gap-2 font-bold">
                  Inscription
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}