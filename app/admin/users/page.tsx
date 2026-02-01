"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Trash2, Shield, ShieldOff } from "lucide-react";

type User = {
  id: number;
  email: string;
  role: string;
  created_at: string;
};

const ADMIN_MENU = [
  { label: "Utilisateurs", href: "/admin/users" },
  { label: "Étudiants", href: "/admin/students" },
  { label: "Employeurs", href: "/admin/employers" },
  { label: "Modérateurs", href: "/admin/moderators" },
  { label: "Offres d'emploi", href: "/admin/jobs" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
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
    fetchUsers(1);
  }, [decoded, router]);

  const fetchUsers = async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/user?page=${pageNum}&limit=${limit}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setUsers(data.data || []);
      setTotal(data.pagination?.total || 0);
      setPage(pageNum);
    } catch (err: any) {
      console.error('fetchUsers error', err);
      setError(err?.message || 'Erreur lors de la récupération');
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (id: number, newRole: string) => {
    if (!confirm(`Changer le rôle de l'utilisateur ${id} en ${newRole} ?`)) return;
    try {
      const res = await fetch(`/api/user/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      alert('Rôle modifié');
      fetchUsers(page);
    } catch (err: any) {
      console.error('changeRole error', err);
      alert(err?.message || 'Erreur lors de la modification');
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm(`Supprimer l'utilisateur ${id} ? Cette action est irréversible.`)) return;
    try {
      const res = await fetch(`/api/user/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      alert('Utilisateur supprimé');
      fetchUsers(page);
    } catch (err: any) {
      console.error('deleteUser error', err);
      alert(err?.message || 'Erreur lors de la suppression');
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
          <h1 className="text-3xl font-bold text-slate-900">Gestion des utilisateurs</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Menu latéral */}
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
                      item.href === '/admin/users'
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

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total: {total} utilisateurs</p>
                </div>
                <Button onClick={() => fetchUsers(page)} disabled={loading}>
                  {loading ? 'Rafraîchir...' : 'Rafraîchir'}
                </Button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold text-slate-900">ID</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Email</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Rôle</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Créé le</th>
                      <th className="text-right p-4 font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-medium">{u.id}</td>
                        <td className="p-4">{u.email}</td>
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                            u.role === 'EMPLOYER' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          {new Date(u.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex gap-2 justify-end">
                            {u.role === 'ADMIN' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => changeRole(u.id, 'STUDENT')}
                                className="flex items-center gap-1"
                              >
                                <ShieldOff className="h-4 w-4" />
                                Retirer
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => changeRole(u.id, 'ADMIN')}
                                className="flex items-center gap-1"
                              >
                                <Shield className="h-4 w-4" />
                                Admin
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteUser(u.id)}
                              className="flex items-center gap-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              Supprimer
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Page {page} sur {pages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => fetchUsers(page - 1)}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page === pages}
                    onClick={() => fetchUsers(page + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

