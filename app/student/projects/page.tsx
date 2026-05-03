"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, MapPin, Users, Clock, Calendar } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  objective?: string;
  location?: string;
  duration?: string;
  max_participants: number;
  current_participants: number;
  profiles_sought?: string;
  requirements?: string;
  status: string;
  created_at: string;
  creator_name: string;
  creator_university?: string;
  creator_email?: string;
}

interface ProjectsResponse {
  success: boolean;
  data: {
    projects: Project[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export default function ProjectsPage() {
  console.log('ProjectsPage - Composant monté');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  const [filters, setFilters] = useState({
    category: 'all',
    location: '',
    status: 'open',
    search: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState<'all' | 'my' | 'applied'>('all');
  const router = useRouter();

  // Récupération des projets
  const fetchProjects = async (page = 1) => {
    try {
      console.log('fetchProjects - Début de la requête');
      setLoading(true);
      
      const params = new URLSearchParams({
        category: filters.category === 'all' ? '' : filters.category,
        location: filters.location,
        status: filters.status,
        search: searchTerm,
        view: viewType,
        page: page.toString(),
        limit: pagination.limit.toString()
      });

      console.log('URL de la requête:', `/api/student/projects?${params}`);

      const token = localStorage.getItem('token');
      console.log('Token disponible:', !!token);
      
      const response = await fetch(`/api/student/projects?${params}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      console.log('Status de la réponse:', response.status);

      if (response.ok) {
        const data: ProjectsResponse = await response.json();
        console.log('Données reçues:', data);
        setProjects(data.data.projects);
        setPagination(data.data.pagination);
      } else {
        const errorText = await response.text();
        console.error('Erreur de réponse:', errorText);
      }
    } catch (error) {
      console.error('Erreur complète:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []); // Only run on mount

  useEffect(() => {
    fetchProjects();
  }, [viewType, filters.category, filters.location, filters.status, searchTerm]); // Run when filters or viewType change

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjects(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      business: 'bg-blue-100 text-blue-800',
      social: 'bg-green-100 text-green-800',
      event: 'bg-amber-100 text-amber-800',
      academic: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.open;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    return `Il y a ${Math.floor(diffDays / 30)} mois`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Projets Collaboratifs</h1>
              <p className="mt-2 text-gray-600">Découvrez et rejoignez des projets étudiants</p>
            </div>
            <Link href="/student/projects/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Créer un projet
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Onglets de filtrage */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setViewType('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewType === 'all'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tous les projets
            </button>
            <button
              onClick={() => setViewType('my')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewType === 'my'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mes projets
            </button>
            <button
              onClick={() => setViewType('applied')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewType === 'applied'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Projets déposés
            </button>
          </div>

        <div className="flex gap-6">
          {/* Filtres latéraux */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Catégorie</h3>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="event">Événement</SelectItem>
                    <SelectItem value="academic">Académique</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Statut</h3>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Ouverts</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="completed">Terminés</SelectItem>
                    <SelectItem value="cancelled">Annulés</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Localisation</h3>
                <Input
                  placeholder="Ville ou région"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
            </div>
          </aside>

          {/* Liste des projets */}
          <main className="flex-1">
            {/* Barre de recherche */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Rechercher des projets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            {/* Loading */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Chargement des projets...</p>
              </div>
            )}

            {/* Liste des projets */}
            {!loading && (
              <>
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Users className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
                    <p className="text-gray-600 mb-4">Essayez de modifier vos filtres ou créez le premier projet</p>
                    <Link href="/student/projects/create">
                      <Button>Créer un projet</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-6 grid-cols-1">
                    {projects.map((project) => (
                      <div key={project.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        {/* En-tête */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <Link href={`/student/projects/${project.id}`}>
                              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2">
                                {project.title}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getCategoryColor(project.category)}>
                                {project.category}
                              </Badge>
                              <Badge className={getStatusColor(project.status)}>
                                {project.status === 'open' ? 'Ouvert' : project.status === 'in_progress' ? 'En cours' : project.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {project.description}
                        </p>

                        {/* Informations */}
                        <div className="space-y-2 mb-4">
                          {project.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <MapPin className="h-4 w-4" />
                              <span>{project.location}</span>
                            </div>
                          )}
                          {project.duration && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span>{project.duration}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Users className="h-4 w-4" />
                            <span>{project.current_participants}/{project.max_participants} participants</span>
                          </div>
                        </div>

                        {/* Progression participants */}
                        <div className="mb-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${(project.current_participants / project.max_participants) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Créateur et date */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {project.creator_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{project.creator_name}</p>
                              <p className="text-xs text-gray-500">
                                {project.creator_university} • {formatDate(project.created_at)}
                              </p>
                            </div>
                          </div>
                          
                          <Link href={`/student/projects/${project.id}`}>
                            <Button size="sm" variant="outline">
                              Voir plus
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => fetchProjects(pagination.page - 1)}
                    >
                      Précédent
                    </Button>
                    
                    <span className="text-sm text-gray-600">
                      Page {pagination.page} sur {pagination.pages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === pagination.pages}
                      onClick={() => fetchProjects(pagination.page + 1)}
                    >
                      Suivant
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
