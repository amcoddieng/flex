"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { Users, Users2, Briefcase, FileText, BarChart3 } from "lucide-react";
import bcrypt from 'bcrypt';

const menuItems = [
  { icon: Users, label: "Utilisateurs", href: "/admin/users" },
  { icon: Users2, label: "Étudiants", href: "/admin/students" },
  { icon: Briefcase, label: "Employeurs", href: "/admin/employers" },
  { icon: Users, label: "Modérateurs", href: "/admin/moderators" },
  { icon: FileText, label: "Offres d'emploi", href: "/admin/jobs" },
];


export default function AdminPage() {

  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const router = useRouter();

  // Small donut chart component
  const Donut = ({ value = 0, total = 1, size = 80, color = '#3b82f6' }: { value?: number; total?: number; size?: number; color?: string }) => {
    const radius = (size - 10) / 2;
    const circumference = 2 * Math.PI * radius;
    const percent = total > 0 ? Math.max(0, Math.min(1, value / total)) : 0;
    const dash = percent * circumference;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          <circle r={radius} fill="transparent" stroke="#e6eefc" strokeWidth={10} />
          <circle r={radius} fill="transparent" stroke={color} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${dash} ${circumference - dash}`} transform={`rotate(-90)`} />
          <text x="0" y="4" textAnchor="middle" fontSize={12} fill="#0f172a">{Math.round(percent * 100)}%</text>
        </g>
      </svg>
    );
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const decoded = token ? decodeToken(token) : null;
    
    if (decoded?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    setIsAdmin(true);
    // fetch stats
    (async () => {
      setLoadingStats(true);
      try {
        const res = await fetch('/api/admin/stats', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
        if (!res.ok) throw new Error('Erreur récupération statistiques');
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch (err) {
        console.error('fetch stats error', err);
      } finally {
        setLoadingStats(false);
      }
    })();
  }, [router]);

  if (!isAdmin) {
    return <div className="p-8">Vérification...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Panneau d'administration</h1>
          <p className="text-slate-600">Gérez les utilisateurs, contenu et modération de FlexJob</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer h-full">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-blue-100 p-4 rounded-lg mb-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">{item.label}</h3>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-slate-900">Aperçu par section</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Users section */}
            <div className="p-6 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Utilisateurs</h3>
                <div className="text-sm text-slate-600">Total: {loadingStats ? '…' : stats?.total_users ?? 0}</div>
              </div>
              <div className="flex items-center gap-4">
                <Donut value={loadingStats ? 0 : (stats?.blocked_users ?? 0)} total={loadingStats ? 1 : (stats?.total_users ?? 1)} color="#ef4444" />
                <div>
                  <div className="text-sm text-slate-600">Bloqués</div>
                  <div className="text-xl font-bold">{loadingStats ? '…' : stats?.blocked_users ?? 0}</div>
                  <div className="text-sm text-slate-500">Nouveaux 7j: {loadingStats ? '…' : stats?.new_users_last_7_days ?? 0}</div>
                </div>
              </div>
            </div>

            {/* Students section */}
            <div className="p-6 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Étudiants</h3>
                <div className="text-sm text-slate-600">Total: {loadingStats ? '…' : stats?.total_students ?? 0}</div>
              </div>
              <div className="flex items-center gap-4">
                <Donut value={loadingStats ? 0 : (stats?.pending_students ?? 0)} total={loadingStats ? 1 : (stats?.total_students ?? 1)} color="#f59e0b" />
                <div>
                  <div className="text-sm text-slate-600">En attente</div>
                  <div className="text-xl font-bold">{loadingStats ? '…' : stats?.pending_students ?? 0}</div>
                  <div className="text-sm text-slate-500">Validés: {loadingStats ? '…' : ((stats?.total_students ?? 0) - (stats?.pending_students ?? 0))}</div>
                </div>
              </div>
            </div>

            {/* Employers section */}
            <div className="p-6 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Employeurs</h3>
                <div className="text-sm text-slate-600">Total: {loadingStats ? '…' : stats?.total_employers ?? 0}</div>
              </div>
              <div className="flex items-center gap-4">
                <Donut value={loadingStats ? 0 : (stats?.pending_employers ?? 0)} total={loadingStats ? 1 : (stats?.total_employers ?? 1)} color="#10b981" />
                <div>
                  <div className="text-sm text-slate-600">En attente</div>
                  <div className="text-xl font-bold">{loadingStats ? '…' : stats?.pending_employers ?? 0}</div>
                  <div className="text-sm text-slate-500">Offres: {loadingStats ? '…' : stats?.total_jobs ?? 0}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Jobs section */}
            <div className="p-6 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Offres</h3>
                <div className="text-sm text-slate-600">Total: {loadingStats ? '…' : stats?.total_jobs ?? 0}</div>
              </div>
              <div className="flex items-center gap-4">
                <Donut value={loadingStats ? 0 : (stats?.active_jobs ?? 0)} total={loadingStats ? 1 : (stats?.total_jobs ?? 1)} color="#3b82f6" />
                <div>
                  <div className="text-sm text-slate-600">Actives</div>
                  <div className="text-xl font-bold">{loadingStats ? '…' : stats?.active_jobs ?? 0}</div>
                  <div className="text-sm text-slate-500">Bloquées: {loadingStats ? '…' : ((stats?.total_jobs ?? 0) - (stats?.active_jobs ?? 0))}</div>
                </div>
              </div>
            </div>

            {/* Applications section */}
            <div className="p-6 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Candidatures</h3>
                <div className="text-sm text-slate-600">Total: {loadingStats ? '…' : stats?.total_applications ?? 0}</div>
              </div>
              <div className="flex items-center gap-4">
                <Donut value={loadingStats ? 0 : (stats?.total_applications ?? 0)} total={loadingStats ? 1 : Math.max(1, (stats?.total_applications ?? 1))} color="#6366f1" />
                <div>
                  <div className="text-sm text-slate-600">Total candidatures</div>
                  <div className="text-xl font-bold">{loadingStats ? '…' : stats?.total_applications ?? 0}</div>
                  <div className="text-sm text-slate-500">Nouvelles utilisateurs 7j: {loadingStats ? '…' : stats?.new_users_last_7_days ?? 0}</div>
                </div>
              </div>
            </div>

            {/* System section */}
            <div className="p-6 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Système</h3>
                <div className="text-sm text-slate-600">Environnement</div>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-sm text-slate-600">Date</div>
                  <div className="text-xl font-bold">{new Date().toLocaleDateString('fr-FR')}</div>
                  <div className="text-sm text-slate-500">DB: {process.env.DB_NAME || 'job_platform'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
