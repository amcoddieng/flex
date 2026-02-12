"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowLeft, Search, X, Eye } from "lucide-react";

type Employer = {
  id: number;
  email: string;
  role: string;
  blocked: boolean;
  created_at: string;
  profile_id?: number;
  company_name?: string;
  contact_person?: string;
  phone?: string;
  address?: string;
  description?: string;
  validation_status?: string;
};

const ADMIN_MENU = [
  { label: "Utilisateurs", href: "/admin/users" },
  { label: "Étudiants", href: "/admin/students" },
  { label: "Employeurs", href: "/admin/employers" },
  { label: "Modérateurs", href: "/admin/moderators" },
  { label: "Offres d'emploi", href: "/admin/jobs" },
];

export default function AdminEmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editData, setEditData] = useState<any>({});
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

  useEffect(() => {
    if (isAdmin) fetchEmployers(1);
  }, [isAdmin]);

  const fetchEmployers = async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/admin/employers?page=${pageNum}&limit=${limit}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (filterStatus) url += `&validation_status=${encodeURIComponent(filterStatus)}`;

      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      // Trier les employeurs: PENDING en premier
      const sortedEmployers = (data.data || []).sort((a: Employer, b: Employer) => {
        if (a.validation_status === 'PENDING' && b.validation_status !== 'PENDING') return -1;
        if (a.validation_status !== 'PENDING' && b.validation_status === 'PENDING') return 1;
        return 0;
      });
      setEmployers(sortedEmployers);
      setTotal(data.pagination?.total || 0);
      setPage(pageNum);
    } catch (err: any) {
      console.error('fetchEmployers error', err);
      setError(err?.message || 'Erreur lors de la récupération');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => { setSearchQuery(e.target.value); setPage(1); };
  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => { setFilterStatus(e.target.value); setPage(1); };

  useEffect(() => { if (isAdmin) fetchEmployers(1); }, [searchQuery, filterStatus, isAdmin]);

  const openDetailModal = (employer: Employer) => {
    setSelectedEmployer(employer);
    setProfileLoading(true);
    setShowDetailModal(true);

    fetch(`/api/admin/employers/${employer.id}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      .then(res => { if (!res.ok) throw new Error('Erreur'); return res.json(); })
      .then(data => { if (data.success) setSelectedProfile(data.data.profile); })
      .catch(err => { console.error('Erreur chargement profil employeur:', err); setSelectedProfile(null); })
      .finally(() => setProfileLoading(false));

    // Charger l'historique des offres de l'employeur
    setJobsLoading(true);
    fetch(`/api/admin/jobs?employer_id=${employer.id}&limit=50`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      .then(res => { if (!res.ok) throw new Error('Erreur jobs'); return res.json(); })
      .then(data => { if (data.success) setJobs(data.data || []); else setJobs([]); })
      .catch(err => { console.error('Erreur chargement jobs employeur:', err); setJobs([]); })
      .finally(() => setJobsLoading(false));
  };

  const quickValidate = async (employerId: number, status: 'VALIDATED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/admin/employers/${employerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ validation_status: status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');

      // Refresh list and profile
      fetchEmployers(page);
      if (selectedEmployer) openDetailModal(selectedEmployer);
    } catch (err: any) {
      console.error('quickValidate error', err);
      alert(err?.message || 'Erreur lors de la validation');
    }
  };

  const openJobDetailModal = async (jobId: number) => {
    setSelectedJob(null);
    setShowJobModal(true);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      if (!res.ok) throw new Error('Erreur job detail');
      const data = await res.json();
      if (data.success) setSelectedJob(data.data);
      else setSelectedJob(null);
    } catch (err) {
      console.error('openJobDetailModal error', err);
      setSelectedJob(null);
    }
  };

  const openEditModal = () => {
    if (selectedEmployer && selectedProfile) {
      setEditData({
        company_name: selectedProfile.company_name || '',
        contact_person: selectedProfile.contact_person || '',
        phone: selectedProfile.phone || '',
        address: selectedProfile.address || '',
        description: selectedProfile.description || '',
        validation_status: selectedProfile.validation_status || 'PENDING'
      });
      setShowDetailModal(false);
      setShowEditModal(true);
    }
  };

  const toggleBlockStatus = async () => {
    if (!selectedEmployer) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/employers/${selectedEmployer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ blocked: !selectedEmployer.blocked })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      alert(selectedEmployer.blocked ? 'Employeur débloqué' : 'Employeur bloqué');
      setShowDetailModal(false);
      setSelectedEmployer(null);
      setSelectedProfile(null);
      fetchEmployers(page);
    } catch (err: any) { console.error('toggleBlockStatus error', err); alert(err?.message || 'Erreur'); }
    finally { setEditLoading(false); }
  };

  const saveEmployerChanges = async () => {
    if (!selectedEmployer) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/employers/${selectedEmployer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      alert('Employeur modifié');
      setShowEditModal(false);
      setSelectedEmployer(null);
      setSelectedProfile(null);
      fetchEmployers(page);
    } catch (err: any) { console.error('saveEmployerChanges error', err); alert(err?.message || 'Erreur'); }
    finally { setEditLoading(false); }
  };

  if (!isAdmin) return <div className="p-8">Vérification...</div>;

  const pages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/admin" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Retour au panneau
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Gestion des employeurs</h1>
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
                      item.href === '/admin/employers'
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">Rechercher (Email, Société)</label>
                    <Input type="text" placeholder="Entrez email ou société..." value={searchQuery} onChange={handleSearch} className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Filtrer par Statut</label>
                    <select value={filterStatus} onChange={handleStatusFilter} className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Tous les statuts</option>
                      <option value="PENDING">En attente</option>
                      <option value="VALIDATED">Validé</option>
                      <option value="REJECTED">Rejeté</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b flex items-center justify-between">
                <div><p className="text-sm text-slate-600">Total: {total} employeurs</p></div>
                <Button onClick={() => fetchEmployers(page)} disabled={loading}>{loading ? 'Rafraîchir...' : 'Rafraîchir'}</Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b"><tr><th className="text-left p-4 font-semibold text-slate-900">Société</th><th className="text-left p-4 font-semibold text-slate-900">Contact</th><th className="text-left p-4 font-semibold text-slate-900">Email</th><th className="text-left p-4 font-semibold text-slate-900">Statut</th><th className="text-left p-4 font-semibold text-slate-900">Bloqué</th><th className="text-right p-4 font-semibold text-slate-900">Actions</th></tr></thead>
                  <tbody>{employers.map((em) => (
                    <tr key={em.id} className={`border-b hover:bg-slate-50 transition-colors ${em.validation_status === 'PENDING' ? 'bg-yellow-50' : ''}`}>
                      <td className="p-4 font-medium">{em.company_name || '-'}</td>
                      <td className="p-4">{em.contact_person || '-'}</td>
                      <td className="p-4">{em.email}</td>
                      <td className="p-4"><span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${em.validation_status === 'VALIDATED' ? 'bg-green-100 text-green-800' : em.validation_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{em.validation_status || 'N/A'}</span></td>
                      <td className="p-4"><span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${em.blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{em.blocked ? 'Bloqué' : 'Actif'}</span></td>
                      <td className="p-4 text-right">
                        {em.validation_status === 'PENDING' ? (
                          <div className="flex items-center gap-2 justify-end">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => quickValidate(em.id, 'VALIDATED')}>Valider</Button>
                            <Button size="sm" variant="destructive" onClick={() => quickValidate(em.id, 'REJECTED')}>Invalider</Button>
                            <Button variant="outline" size="sm" onClick={() => openDetailModal(em)}>Détails</Button>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => openDetailModal(em)} className="flex items-center gap-1"><Eye className="h-4 w-4" />Détails</Button>
                        )}
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>

              <div className="p-4 flex items-center justify-between"><div className="text-sm text-slate-600">Page {page} sur {pages}</div><div className="flex gap-2"><Button variant="outline" disabled={page===1} onClick={() => fetchEmployers(page-1)}>Précédent</Button><Button variant="outline" disabled={page===pages} onClick={() => fetchEmployers(page+1)}>Suivant</Button></div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedEmployer && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-slate-900">Détails de l'employeur</h2><button onClick={() => { setShowDetailModal(false); setSelectedEmployer(null); setSelectedProfile(null); }} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="h-6 w-6" /></button></div>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b-2 pb-2">Informations Compte</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6"><div><label className="block text-sm font-medium text-slate-700 mb-2">ID</label><p className="text-slate-900 font-semibold">{selectedEmployer.id}</p></div><div className="col-span-2 md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-2">Email</label><p className="text-slate-900 font-semibold">{selectedEmployer.email}</p></div><div><label className="block text-sm font-medium text-slate-700 mb-2">Statut du Compte</label><span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedEmployer.blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{selectedEmployer.blocked ? 'Bloqué' : 'Actif'}</span></div><div className="col-span-2"><label className="block text-sm font-medium text-slate-700 mb-2">Créé le</label><p className="text-slate-900">{new Date(selectedEmployer.created_at).toLocaleDateString('fr-FR')}</p></div></div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b-2 pb-2">Profil Employeur</h3>
                {profileLoading ? <p className="text-slate-600">Chargement...</p> : selectedProfile ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">{selectedProfile.company_name && <div><label className="block text-sm font-medium text-slate-700 mb-2">Nom Entreprise</label><p className="text-slate-900">{selectedProfile.company_name}</p></div>}{selectedProfile.contact_person && <div><label className="block text-sm font-medium text-slate-700 mb-2">Personne de Contact</label><p className="text-slate-900">{selectedProfile.contact_person}</p></div>}{selectedProfile.phone && <div><label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label><p className="text-slate-900">{selectedProfile.phone}</p></div>}{selectedProfile.address && <div className="col-span-2"><label className="block text-sm font-medium text-slate-700 mb-2">Adresse</label><p className="text-slate-900">{selectedProfile.address}</p></div>}{selectedProfile.description && <div className="col-span-3"><label className="block text-sm font-medium text-slate-700 mb-2">Description</label><p className="text-slate-900">{selectedProfile.description}</p></div>}<div><label className="block text-sm font-medium text-slate-700 mb-2">Statut de Validation</label><span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedProfile.validation_status === 'VALIDATED' ? 'bg-green-100 text-green-800' : selectedProfile.validation_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{selectedProfile.validation_status}</span></div></div>
                ) : <p className="text-slate-600">Aucun profil</p>}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b-2 pb-2">Offres publiées</h3>
                {jobsLoading ? <p className="text-slate-600">Chargement des offres...</p> : (
                  jobs.length > 0 ? (
                    <div className="space-y-3">
                      {jobs.map((j) => (
                        <div key={j.id} className="p-3 border rounded-md flex items-center justify-between">
                          <div>
                            <div className="font-medium text-slate-900">{j.title}</div>
                            <div className="text-sm text-slate-600">{j.company || ''} • {j.location || ''}</div>
                            <div className="text-xs text-slate-500">Publié: {j.posted_at ? new Date(j.posted_at).toLocaleDateString('fr-FR') : '-'}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-slate-700">{j.is_active ? 'Active' : 'Fermée'}</div>
                            <Button size="sm" variant="outline" onClick={() => openJobDetailModal(j.id)}>Détails</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-slate-600">Aucune offre trouvée</p>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <Button variant="outline" onClick={() => { setShowDetailModal(false); setSelectedEmployer(null); setSelectedProfile(null); }} className="flex-1">Fermer</Button>
                <div className="flex gap-2">
                  {/* <Button size="sm" onClick={() => selectedEmployer && quickValidate(selectedEmployer.id, 'VALIDATED')} className="bg-green-600 text-white hover:bg-green-700">Valider profil</Button> */}
                  {/* <Button size="sm" variant="outline" onClick={() => selectedEmployer && quickValidate(selectedEmployer.id, 'REJECTED')}>Rejeter profil</Button> */}
                </div>
                <Button variant={selectedEmployer.blocked ? "default" : "destructive"} onClick={toggleBlockStatus} disabled={editLoading} className="flex-1">{editLoading ? 'Traitement...' : selectedEmployer.blocked ? 'Débloquer' : 'Bloquer'}</Button>
                <Button onClick={openEditModal} disabled={!selectedProfile} className="flex-1">Modifier</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEmployer && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-slate-900">Modifier l'employeur</h2><button onClick={() => { setShowEditModal(false); setSelectedEmployer(null); setSelectedProfile(null); }} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="h-6 w-6" /></button></div>
            <div className="space-y-8"><div><h3 className="text-lg font-semibold text-slate-900 mb-6 border-b-2 pb-2">Profil Employeur</h3><div className="grid grid-cols-2 md:grid-cols-3 gap-6"><div><label className="block text-sm font-medium text-slate-700 mb-2">Nom Entreprise</label><Input type="text" value={editData.company_name || ''} onChange={(e) => setEditData({ ...editData, company_name: e.target.value })} placeholder="Nom Entreprise" className="w-full" /></div><div><label className="block text-sm font-medium text-slate-700 mb-2">Personne de Contact</label><Input type="text" value={editData.contact_person || ''} onChange={(e) => setEditData({ ...editData, contact_person: e.target.value })} placeholder="Personne de Contact" className="w-full" /></div><div><label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label><Input type="tel" value={editData.phone || ''} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} placeholder="Téléphone" className="w-full" /></div><div className="col-span-2"><label className="block text-sm font-medium text-slate-700 mb-2">Adresse</label><Input type="text" value={editData.address || ''} onChange={(e) => setEditData({ ...editData, address: e.target.value })} placeholder="Adresse" className="w-full" /></div><div className="col-span-3"><label className="block text-sm font-medium text-slate-700 mb-2">Description</label><textarea value={editData.description || ''} onChange={(e) => setEditData({ ...editData, description: e.target.value })} placeholder="Description" rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-slate-700 mb-2">Statut de Validation</label><select value={editData.validation_status || 'PENDING'} onChange={(e) => setEditData({ ...editData, validation_status: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="PENDING">En attente</option><option value="VALIDATED">Validé</option><option value="REJECTED">Rejeté</option></select></div></div></div></div>
            <div className="flex gap-3 mt-8"><Button variant="outline" onClick={() => { setShowEditModal(false); setSelectedEmployer(null); setSelectedProfile(null); }} className="flex-1" disabled={editLoading}>Annuler</Button><Button onClick={saveEmployerChanges} className="flex-1" disabled={editLoading}>{editLoading ? 'Enregistrement...' : 'Enregistrer'}</Button></div>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Détails de l'offre</h2>
              <button onClick={() => { setShowJobModal(false); setSelectedJob(null); }} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="h-6 w-6" /></button>
            </div>

            {!selectedJob ? (
              <p className="text-slate-600">Chargement...</p>
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
                        <div key={a.id} className="p-3 border rounded-md">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{a.first_name} {a.last_name} ({a.user_email || a.email})</div>
                              <div className="text-sm text-slate-600">Status: {a.status}</div>
                              <div className="text-xs text-slate-500">Candidature: {a.applied_at ? new Date(a.applied_at).toLocaleString('fr-FR') : '-'}</div>
                            </div>
                            <div>
                              <Button size="sm" variant="outline" onClick={() => {
                                // open application detail in new modal or navigate to admin application route
                                window.open(`/admin/applications/${a.id}`, '_blank');
                              }}>Voir</Button>
                            </div>
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
    </div>
  );
}
