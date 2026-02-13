"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowLeft, Search, X, Eye } from "lucide-react";

type Job = {
  id: number;
  employer_id: number;
  title: string;
  company: string;
  location: string;
  is_active: boolean;
  posted_at: string;
  applicants?: number;
};

const ADMIN_MENU = [
  { label: "Utilisateurs", href: "/admin/users" },
  { label: "Étudiants", href: "/admin/students" },
  { label: "Employeurs", href: "/admin/employers" },
  { label: "Modérateurs", href: "/admin/moderators" },
  { label: "Offres d'emploi", href: "/admin/jobs" },
];

export default function AdminJobsPage() {
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const decoded = token ? decodeToken(token) : null;

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    if (!decoded || decoded.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    setIsAdmin(true);
  }, [decoded, router]);

  // Page state and filters
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => { if (isAdmin) fetchJobs(1); }, [isAdmin]);

  const fetchJobs = async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/admin/jobs?page=${pageNum}&limit=${limit}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (filterStatus) url += `&is_active=${encodeURIComponent(filterStatus)}`;

      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      setJobs(data.data || []);
      setTotal(data.pagination?.total || 0);
      setPage(pageNum);
    } catch (err: any) {
      console.error('fetchJobs error', err);
      setError(err?.message || 'Erreur lors de la récupération');
    } finally { setLoading(false); }
  };

  const openDetailModal = async (jobId: number) => {
    setSelectedJob(null);
    setShowDetailModal(true);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      if (data.success) setSelectedJob(data.data);
    } catch (err) { console.error('openDetailModal error', err); setSelectedJob(null); }
    finally { setDetailLoading(false); }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => { setSearchQuery(e.target.value); setPage(1); };
  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => { setFilterStatus(e.target.value); setPage(1); };

  const toggleJobActive = async (jobId: number, activate: boolean) => {
    if (!confirm(`Confirmer ${activate ? 'activation' : 'désactivation'} de l'offre ?`)) return;
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ is_active: activate })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      fetchJobs(page);
    } catch (err: any) { console.error('toggleJobActive error', err); alert(err?.message || 'Erreur'); }
  };

  const toggleJobBlocked = async (jobId: number, blocked: boolean) => {
    if (!confirm(`${blocked ? 'Bloquer' : 'Débloquer'} cette offre ?`)) return;
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ blocked })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      fetchJobs(page);
    } catch (err: any) { console.error('toggleJobBlocked error', err); alert(err?.message || 'Erreur'); }
  };

  const deleteJob = async (jobId: number) => {
    if (!confirm('Confirmer la suppression de cette offre ? Cette action est irréversible.')) return;
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      fetchJobs(page);
    } catch (err: any) { console.error('deleteJob error', err); alert(err?.message || 'Erreur'); }
  };

  if (!isAdmin) {
    return <div className="p-8">Vérification...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/admin" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Retour au panneau
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Gestion des offres d'emploi</h1>
        </div>
      </div>

        {/* Detail Modal */}
        {showDetailModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Détails de l'offre</h2>
                <button onClick={() => { setShowDetailModal(false); setSelectedJob(null); }} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="h-6 w-6" /></button>
              </div>

              {detailLoading ? (
                <p className="text-slate-600">Chargement...</p>
              ) : !selectedJob ? (
                <p className="text-slate-600">Aucune donnée</p>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{selectedJob.job.title}</h3>
                    <div className="text-sm text-slate-600">{selectedJob.job.company} • {selectedJob.job.location}</div>
                    <div className="mt-4 text-slate-800">{selectedJob.job.description}</div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Candidatures ({selectedJob.applicants?.length || 0})</h4>
                    {selectedJob.applicants && selectedJob.applicants.length > 0 ? (
                      <div className="space-y-3">
                        {selectedJob.applicants.map((a: any) => (
                          <div key={a.id} className="p-3 border rounded-md flex items-center justify-between">
                            <div>
                              <div className="font-medium">{a.first_name} {a.last_name} ({a.user_email || a.email})</div>
                              <div className="text-sm text-slate-600">Status: {a.status}</div>
                              <div className="text-xs text-slate-500">Candidature: {a.applied_at ? new Date(a.applied_at).toLocaleString('fr-FR') : '-'}</div>
                            </div>
                            <div>
                              <Button size="sm" variant="outline" onClick={() => window.open(`/admin/applications/${a.id}`, '_blank')}>Voir</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-slate-600">Aucune candidature</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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
                      item.href === '/admin/jobs'
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
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

              <div className="p-6 border-b space-y-4">
                <div className="flex items-center gap-2 mb-4"><Search className="h-5 w-5 text-slate-400" /><h3 className="font-semibold text-slate-900">Recherche et Filtres</h3></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Rechercher (Titre, Société)</label>
                    <Input type="text" placeholder="Entrez titre ou société..." value={searchQuery} onChange={handleSearch} className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Filtrer par Statut</label>
                    <select value={filterStatus} onChange={handleStatusFilter} className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Tous les statuts</option>
                      <option value="1">Active</option>
                      <option value="0">Fermée</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b flex items-center justify-between">
                <div><p className="text-sm text-slate-600">Total: {total} offres</p></div>
                <Button onClick={() => fetchJobs(page)} disabled={loading}>{loading ? 'Rafraîchir...' : 'Rafraîchir'}</Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b"><tr><th className="text-left p-4 font-semibold text-slate-900">Titre</th><th className="text-left p-4 font-semibold text-slate-900">Société</th><th className="text-left p-4 font-semibold text-slate-900">Localisation</th><th className="text-left p-4 font-semibold text-slate-900">Statut</th><th className="text-right p-4 font-semibold text-slate-900">Actions</th></tr></thead>
                  <tbody>{jobs.map((job) => (
                    <tr key={job.id} className={`border-b hover:bg-slate-50 transition-colors ${!job.is_active ? 'opacity-70' : ''}`}>
                      <td className="p-4 font-medium">{job.title}</td>
                      <td className="p-4">{job.company}</td>
                      <td className="p-4">{job.location}</td>
                      <td className="p-4"><span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${job.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{job.is_active ? 'Active' : 'Fermée'}</span></td>
                      <td className="p-4"><span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${job.blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{job.blocked ? 'Bloquée' : 'Active'}</span></td>
                      <td className="p-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => openDetailModal(job.id)}>Détails</Button>
                          <Button size="sm" variant="outline" onClick={() => toggleJobActive(job.id, !job.is_active)}>{job.is_active ? 'Désactiver' : 'Activer'}</Button>
                          <Button size="sm" variant={job.blocked ? 'default' : 'destructive'} onClick={() => toggleJobBlocked(job.id, !job.blocked)}>{job.blocked ? 'Débloquer' : 'Bloquer'}</Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteJob(job.id)}>Supprimer</Button>
                        </div>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>

              <div className="p-4 flex items-center justify-between"><div className="text-sm text-slate-600">Page {page} sur {Math.max(1, Math.ceil(total / limit))}</div><div className="flex gap-2"><Button variant="outline" disabled={page===1} onClick={() => fetchJobs(page-1)}>Précédent</Button><Button variant="outline" disabled={page===Math.max(1, Math.ceil(total / limit))} onClick={() => fetchJobs(page+1)}>Suivant</Button></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
