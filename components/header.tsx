"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Briefcase, Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { decodeToken } from "@/lib/jwt";

const navItems = [
  { href: "/", label: "Accueil" },
  { href: "/jobs", label: "Offres" },
  { href: "#features", label: "Fonctionnalites" },
  { href: "#testimonials", label: "Temoignages" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [user, setUser] = useState<{ userId?: string; name?: string; avatar?: string; role?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // load user from token instead of localStorage
  useEffect(() => {
    const loadFromToken = (token: string) => {
      const decoded = decodeToken(token);
      if (decoded) {
        setUser({
          userId: String(decoded.userId),
          name: decoded.name || undefined,
          avatar: decoded.avatar || undefined,
          role: decoded.role || undefined,
        });
      } else {
        setUser(null);
      }
    };

    const token = localStorage.getItem('token');
    if (token) {
      loadFromToken(token);
    } else {
      setUser(null);
    }

    const onLogin = (e: Event) => {
      // Get token from localStorage after login
      const token = localStorage.getItem('token');
      if (token) {
        loadFromToken(token);
      }
    };
    const onLogout = () => setUser(null);

    window.addEventListener('user:login', onLogin as EventListener);
    window.addEventListener('user:logout', onLogout as EventListener);
    return () => {
      window.removeEventListener('user:login', onLogin as EventListener);
      window.removeEventListener('user:logout', onLogout as EventListener);
    };
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-lg shadow-black/5"
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo with animation */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <Briefcase className="h-6 w-6 text-primary-foreground transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 rounded-xl bg-primary blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              </div>
              <div className="overflow-hidden">
                <h1 className="text-xl font-bold tracking-tight transition-transform duration-300 group-hover:translate-x-1">
                  FlexJob
                </h1>
                <p className="text-xs text-muted-foreground transition-all duration-300 group-hover:text-primary">
                  Senegal
                </p>
              </div>
            </Link>

            {/* Desktop Navigation with hover effects */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-300"
                  onMouseEnter={() => setHoveredNav(item.href)}
                  onMouseLeave={() => setHoveredNav(null)}
                >
                  {item.label}
                  {/* Animated underline */}
                  <span
                    className={cn(
                      "absolute bottom-0 left-1/2 h-0.5 bg-primary rounded-full transition-all duration-300 -translate-x-1/2",
                      hoveredNav === item.href ? "w-1/2" : "w-0"
                    )}
                  />
                </Link>
              ))}
            </nav>

            {/* Auth Buttons with user info */}
            <div className="hidden md:flex items-center gap-3">

              {user ? (
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt="avatar" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-muted-foreground/20 flex items-center justify-center">U</div>
                  )}
                  <div className="text-sm text-foreground">
                    <div className="font-medium">{user.name || 'Utilisateur'}</div>
                    {user.role && <div className="text-xs text-muted-foreground">{user.role}</div>}
                  </div>
                  <Button variant="ghost" onClick={() => {
                    localStorage.removeItem('token');
                    try { window.dispatchEvent(new Event('user:logout')); } catch (e) {}
                    router.push('/login');
                  }} className="ml-2">Logout</Button>
                </div>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    asChild 
                    className="font-medium hover:bg-primary/5 transition-all duration-300"
                  >
                    <Link href="/login">Connexion</Link>
                  </Button>
                  <Button 
                    asChild 
                    className="group font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300"
                  >
                    <Link href="/register">
                      Inscription
                      <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button with animation */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden relative p-2 rounded-xl hover:bg-muted transition-colors duration-300"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <span
                  className={cn(
                    "absolute left-0 w-6 h-0.5 bg-foreground rounded-full transition-all duration-300",
                    isMobileMenuOpen ? "top-3 rotate-45" : "top-1.5"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-3 w-6 h-0.5 bg-foreground rounded-full transition-all duration-300",
                    isMobileMenuOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 w-6 h-0.5 bg-foreground rounded-full transition-all duration-300",
                    isMobileMenuOpen ? "top-3 -rotate-45" : "top-[18px]"
                  )}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/95 backdrop-blur-lg md:hidden transition-all duration-500",
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <nav className="flex flex-col items-center gap-2">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-8 py-4 text-2xl font-semibold hover:text-primary transition-all duration-500",
                  isMobileMenuOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                )}
                style={{ transitionDelay: `${index * 100}ms` }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div
            className={cn(
              "flex flex-col gap-3 mt-12 w-64 transition-all duration-500",
              isMobileMenuOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            )}
            style={{ transitionDelay: "400ms" }}
          >
            {user ? (
              <>
                <div className="flex items-center gap-3 p-4 bg-muted/5 rounded-lg">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt="avatar" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted-foreground/20 flex items-center justify-center">U</div>
                  )}
                  <div>
                    <div className="font-medium">{user.name || 'Utilisateur'}</div>
                    {user.role && <div className="text-xs text-muted-foreground">{user.role}</div>}
                  </div>
                </div>
                <Button variant="outline" size="lg" className="w-full" onClick={() => { localStorage.removeItem('token'); try { window.dispatchEvent(new Event('user:logout')); } catch (e) {} router.push('/login'); setIsMobileMenuOpen(false); }}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild size="lg" className="w-full bg-transparent">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Connexion
                  </Link>
                </Button>
                <Button asChild size="lg" className="w-full">
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    Inscription
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
