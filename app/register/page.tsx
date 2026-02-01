"use client";

import React from "react"

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Briefcase,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  GraduationCap,
  Building2,
} from "lucide-react";

type UserType = "student" | "employer" | null;

export default function RegisterPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    university: "",
    company: "",
    acceptTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const role = userType === 'student' ? 'STUDENT' : 'EMPLOYER';
      const payload: any = {
        email: formData.email,
        password: formData.password,
        role,
        firstName: formData.firstName,
        lastName: formData.lastName,
      };

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erreur lors de l\'inscription');
        setIsLoading(false);
        return;
      }

      if (data.userId) localStorage.setItem('userId', data.userId);

      router.push('/jobs');
    } catch (err: any) {
      console.error('Register error:', err);
      alert(err?.message || 'Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 mb-12 justify-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Briefcase className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">FlexJob</h1>
              <p className="text-sm text-muted-foreground">Sénégal</p>
            </div>
          </Link>

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Créer un compte</h2>
            <p className="text-muted-foreground text-lg">
              Choisissez votre type de profil pour commencer
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Student Card */}
            <button
              onClick={() => setUserType("student")}
              className="group relative p-8 rounded-2xl border-2 border-border hover:border-primary bg-card text-left transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
            >
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-border group-hover:border-primary group-hover:bg-primary transition-all duration-300 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-primary-foreground scale-0 group-hover:scale-100 transition-transform duration-300" />
              </div>

              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <GraduationCap className="h-8 w-8" />
              </div>

              <h3 className="text-xl font-semibold mb-2">Je suis étudiant</h3>
              <p className="text-muted-foreground">
                Trouvez des jobs flexibles adaptés à votre emploi du temps et
                financez vos études.
              </p>

              <div className="mt-6 flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Continuer
                <ArrowRight className="ml-2 h-5 w-5" />
              </div>
            </button>

            {/* Employer Card */}
            <button
              onClick={() => setUserType("employer")}
              className="group relative p-8 rounded-2xl border-2 border-border hover:border-primary bg-card text-left transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
            >
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-border group-hover:border-primary group-hover:bg-primary transition-all duration-300 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-primary-foreground scale-0 group-hover:scale-100 transition-transform duration-300" />
              </div>

              <div className="w-16 h-16 rounded-2xl bg-accent/20 text-accent flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                <Building2 className="h-8 w-8" />
              </div>

              <h3 className="text-xl font-semibold mb-2">Je suis employeur</h3>
              <p className="text-muted-foreground">
                Publiez vos offres et trouvez des étudiants motivés pour vos
                missions.
              </p>

              <div className="mt-6 flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Continuer
                <ArrowRight className="ml-2 h-5 w-5" />
              </div>
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff1_1px,transparent_1px),linear-gradient(to_bottom,#fff1_1px,transparent_1px)] bg-[size:60px_60px] opacity-10" />
        </div>

        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur">
              <Briefcase className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">FlexJob</h1>
              <p className="text-sm text-primary-foreground/70">Sénégal</p>
            </div>
          </Link>

          <h2 className="text-4xl font-bold mb-6 leading-tight">
            {userType === "student" ? (
              <>
                Rejoignez des
                <br />
                centaines d{"'"}étudiants
                <br />
                qui réussissent.
              </>
            ) : (
              <>
                Trouvez les
                <br />
                meilleurs talents
                <br />
                étudiants.
              </>
            )}
          </h2>

          <p className="text-lg text-primary-foreground/80 mb-8 max-w-md">
            {userType === "student"
              ? "Créez votre profil, postulez aux offres et commencez à travailler selon vos disponibilités."
              : "Publiez vos offres, consultez les profils et recrutez des étudiants motivés."}
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span>Inscription 100% gratuite</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span>Profils vérifiés</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span>Support disponible 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link
            href="/"
            className="flex lg:hidden items-center gap-3 mb-8 justify-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Briefcase className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">FlexJob</h1>
              <p className="text-sm text-muted-foreground">Sénégal</p>
            </div>
          </Link>

          <Card className="border-0 shadow-none lg:border lg:shadow-sm">
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <button
                  onClick={() => setUserType(null)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  ← Changer de profil
                </button>
              </div>
              <CardTitle className="text-2xl font-bold">
                {userType === "student"
                  ? "Inscription Étudiant"
                  : "Inscription Employeur"}
              </CardTitle>
              <CardDescription>
                Remplissez le formulaire pour créer votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      placeholder="Amadou"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      placeholder="Diallo"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      required
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="h-12"
                  />
                </div>

                {userType === "student" ? (
                  <div className="space-y-2">
                    <Label htmlFor="university">Université</Label>
                    <Select
                      value={formData.university}
                      onValueChange={(value) =>
                        setFormData({ ...formData, university: value })
                      }
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Sélectionnez votre université" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ucad">UCAD - Dakar</SelectItem>
                        <SelectItem value="ugb">UGB - Saint-Louis</SelectItem>
                        <SelectItem value="ism">ISM - Dakar</SelectItem>
                        <SelectItem value="supdeco">SupdeCo - Dakar</SelectItem>
                        <SelectItem value="iau">IAU - Thiès</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="company">Nom de l{"'"}entreprise</Label>
                    <Input
                      id="company"
                      placeholder="Votre entreprise"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      required
                      className="h-12"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      className="h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimum 8 caractères avec une majuscule et un chiffre
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        acceptTerms: checked as boolean,
                      })
                    }
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    J{"'"}accepte les{" "}
                    <Link href="#" className="text-primary hover:underline">
                      Conditions d{"'"}utilisation
                    </Link>{" "}
                    et la{" "}
                    <Link href="#" className="text-primary hover:underline">
                      Politique de confidentialité
                    </Link>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25"
                  disabled={isLoading || !formData.acceptTerms}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Création du compte...
                    </>
                  ) : (
                    <>
                      Créer mon compte
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                Déjà un compte ?{" "}
                <Link
                  href="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Se connecter
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
