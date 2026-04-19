"use client";

import React from "react"

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Eye, EyeOff, ArrowRight, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { decodeToken } from "@/lib/jwt";

const benefits = [
  "Acces a 200+ offres exclusives",
  "Suivi de vos candidatures",
  "Alertes personnalisees",
];

export default function LoginPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Erreur lors de la connexion');
        setIsLoading(false);
        return;
      }
      console.log('Login successful:', data);
      // Store only the token - all user info is in the token payload
      if (data.token) localStorage.setItem('token', data.token);

      // notify other components to refresh user from token
      try {
        window.dispatchEvent(new CustomEvent('user:login'));
      } catch (e) {
        // ignore if window unavailable
      }

      // Decode token to get user role and redirect accordingly
      const decodedToken = decodeToken(data.token);
      const userRole = data.role || decodedToken?.role || 'STUDENT'; // use API role first, then token role
      
      console.log('User role:', userRole);
      
      if (userRole === 'ADMIN') {
        router.push('/admin');
      } else if (userRole === 'EMPLOYER') {
        router.push('/employer');
      } else if (userRole === 'STUDENT') {
        router.push('/student');
      } else {
        router.push('/student');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      alert(err?.message || 'Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding with enhanced animations */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 relative overflow-hidden">
        {/* Animated Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-foreground/5 rounded-full blur-3xl" />
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-primary-foreground/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float-particle ${8 + Math.random() * 10}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            ))}
          </div>
          
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff1_1px,transparent_1px),linear-gradient(to_bottom,#fff1_1px,transparent_1px)] bg-[size:60px_60px] opacity-10" />
        </div>

        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <Link 
            href="/" 
            className={`flex items-center gap-3 mb-12 group transition-all duration-700 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
              <Briefcase className="h-8 w-8" />
              <div className="absolute inset-0 rounded-xl bg-primary-foreground/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">FlexJob</h1>
              <p className="text-sm text-primary-foreground/70">Senegal</p>
            </div>
          </Link>

          <h2 
            className={`text-5xl font-bold mb-6 leading-tight transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            Bienvenue !<br />
            <span className="relative inline-block mt-2">
              Connectez-vous
              <Sparkles className="absolute -top-2 -right-8 h-6 w-6 animate-pulse" />
            </span>
          </h2>

          <p 
            className={`text-lg text-primary-foreground/80 mb-10 max-w-md leading-relaxed transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            Retrouvez vos candidatures, vos jobs favoris et connectez-vous avec
            les meilleurs employeurs du Senegal.
          </p>

          <div className="flex flex-col gap-4">
            {benefits.map((benefit, index) => (
              <div 
                key={benefit}
                className={`flex items-center gap-4 transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
                }`}
                style={{ transitionDelay: `${400 + index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-primary-foreground/20">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <span className="text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form with enhanced animations */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <Link 
            href="/" 
            className={`flex lg:hidden items-center gap-3 mb-8 justify-center transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
            }`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 shadow-xl shadow-blue-600/25">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FlexJob</h1>
              <p className="text-sm text-gray-600">Senegal</p>
            </div>
          </Link>

          <Card 
            className={`border-0 shadow-none lg:border lg:shadow-2xl lg:shadow-primary/5 transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl font-bold">Connexion</CardTitle>
              <CardDescription className="text-base">
                Entrez vos identifiants pour acceder a votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">Adresse email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`h-14 text-base transition-all duration-300 ${
                        focusedField === "email" ? "border-primary ring-4 ring-primary/10" : ""
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-base font-medium">Mot de passe</Label>
                    <Link
                      href="#"
                      className="text-sm text-primary hover:underline transition-colors"
                    >
                      Mot de passe oublie ?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Votre mot de passe"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`h-14 text-base pr-14 transition-all duration-300 ${
                        focusedField === "password" ? "border-primary ring-4 ring-primary/10" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-base font-semibold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-4 text-muted-foreground">
                      Ou continuez avec
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="h-14 bg-transparent hover:bg-muted/50 hover:scale-[1.02] transition-all duration-300"
                  >
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="h-14 bg-transparent hover:bg-muted/50 hover:scale-[1.02] transition-all duration-300"
                  >
                    <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </Button>
                </div>
              </form>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                Pas encore de compte ?{" "}
                <Link
                  href="/register"
                  className="text-primary font-semibold hover:underline transition-colors"
                >
                  Creer un compte
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-30px) translateX(15px);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
