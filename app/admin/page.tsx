"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, FileText, CheckCircle, TrendingUp, Building } from "lucide-react";

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const router = useRouter();

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
    fetchStats(token);
  }, [router]);

  const fetchStats = async (token: string) => {
    setLoadingStats(true);
    try {
      // Simuler des statistiques - à remplacer avec de vraies API
      const mockStats = {
        totalUsers: 1250,
        totalStudents: 850,
        totalEmployers: 400,
        totalJobs: 320,
        pendingValidations: 12,
        totalApplications: 2450,
        activeJobs: 280,
        thisMonthRegistrations: 45,
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Utilisateurs Totals",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-blue-500",
      change: "+12%",
      changeType: "positive"
    },
    {
      title: "Étudiants",
      value: stats?.totalStudents || 0,
      icon: Users,
      color: "bg-green-500",
      change: "+8%",
      changeType: "positive"
    },
    {
      title: "Employeurs",
      value: stats?.totalEmployers || 0,
      icon: Briefcase,
      color: "bg-purple-500",
      change: "+15%",
      changeType: "positive"
    },
    {
      title: "Offres d'Emploi",
      value: stats?.totalJobs || 0,
      icon: FileText,
      color: "bg-orange-500",
      change: "+5%",
      changeType: "positive"
    },
    {
      title: "Validations en Attente",
      value: stats?.pendingValidations || 0,
      icon: CheckCircle,
      color: "bg-yellow-500",
      change: "-2%",
      changeType: "negative"
    },
    {
      title: "Candidatures",
      value: stats?.totalApplications || 0,
      icon: FileText,
      color: "bg-pink-500",
      change: "+18%",
      changeType: "positive"
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de Bord Administrateur
          </h1>
          <p className="text-gray-600">
            Vue d'ensemble de la plateforme et statistiques clés
          </p>
        </div>

        {/* Stats Grid */}
        {loadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">
                          {card.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {card.value.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1">
                          <TrendingUp className={`h-4 w-4 ${
                            card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                          }`} />
                          <span className={`text-sm ${
                            card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {card.change}
                          </span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-full ${card.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                Actions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => router.push('/admin/employer-validation')}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Validations en Attente
                      </p>
                      <p className="text-sm text-gray-600">
                        {stats?.pendingValidations || 0} profils à valider
                      </p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => router.push('/admin/users')}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Gestion Utilisateurs
                      </p>
                      <p className="text-sm text-gray-600">
                        Administrer les comptes
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-purple-600" />
                Activité Récente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Nouveaux employeurs</p>
                    <p className="text-sm text-gray-600">Ce mois</p>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    {stats?.thisMonthRegistrations || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Offres actives</p>
                    <p className="text-sm text-gray-600">En ligne</p>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {stats?.activeJobs || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
