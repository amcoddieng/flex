"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type StudentProfile = {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  university: string;
  created_at: string;
};

const ADMIN_MENU = [
  { label: "Utilisateurs", href: "/admin/users" },
  { label: "Étudiants", href: "/admin/students" },
  { label: "Employeurs", href: "/admin/employers" },
  { label: "Modérateurs", href: "/admin/moderators" },
  { label: "Offres d'emploi", href: "/admin/jobs" },
];

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const decoded = token ? decodeToken(token) : null;

  useEffect(() => {
    if (!decoded || decoded.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    setIsAdmin(true);
    fetchStudents(1);
  }, [decoded, router]);

  const fetchStudents = async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/students?page=${pageNum}&limit=${limit}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        // Endpoint not yet created, show placeholder
        setStudents([]);
        setTotal(0);
        return;
      }
      const data = await res.json();
      setStudents(data.data || []);
      setTotal(data.pagination?.total || 0);
      setPage(pageNum);
    } catch (err: any) {
      console.error('fetchStudents error', err);
      setError(err?.message || 'Erreur lors de la récupération');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return <div className="p-8">Vérification...</div>;
  }

  const pages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/admin" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Retour au panneau
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Gestion des étudiants</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4">
              <h3 className="font-bold mb-4 text-slate-900">Menu</h3>
              <nav className="space-y-2">
                {ADMIN_MENU.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2 rounded transition-colors ${
                      item.href === '/admin/students'
                        ? 'bg-blue-100 text-blue-900 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total: {total} étudiants</p>
                </div>
                <Button onClick={() => fetchStudents(page)} disabled={loading}>
                  {loading ? 'Rafraîchir...' : 'Rafraîchir'}
                </Button>
              </div>

              <div className="p-6 text-center text-slate-600">
                <p>Fonctionnalité en développement...</p>
                <p className="text-sm mt-2">Liste des étudiants bientôt disponible</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
