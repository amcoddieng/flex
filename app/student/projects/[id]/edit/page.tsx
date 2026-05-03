"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, X } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  objective: string;
  location: string;
  duration: string;
  max_participants: number;
  profiles_sought: string;
  requirements: string;
  status: string;
}

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    objective: '',
    location: '',
    duration: '',
    max_participants: 1,
    profiles_sought: '',
    requirements: '',
    status: 'open'
  });

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/student/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Projet non trouvé');
      }

      const data = await response.json();
      const projectData = data.data.project;
      
      setProject(projectData);
      setFormData({
        title: projectData.title || '',
        description: projectData.description || '',
        category: projectData.category || '',
        objective: projectData.objective || '',
        location: projectData.location || '',
        duration: projectData.duration || '',
        max_participants: projectData.max_participants || 1,
        profiles_sought: projectData.profiles_sought || '',
        requirements: projectData.requirements || '',
        status: projectData.status || 'open'
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Début de la soumission...');
      setSaving(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('token');
      console.log('Token trouvé:', !!token);
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Validation des données avant envoi
      const validatedData = {
        ...formData,
        max_participants: isNaN(formData.max_participants) ? 1 : formData.max_participants
      };

      console.log('Envoi de la requête PUT vers:', `/api/student/projects/${projectId}`);
      console.log('Données envoyées:', validatedData);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('Timeout atteint, annulation de la requête');
        controller.abort();
      }, 60000); // 60 secondes de timeout

      console.log('Début de la requête fetch...');
      const response = await fetch(`/api/student/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validatedData),
        signal: controller.signal
      });

      console.log('Requête fetch terminée, annulation du timeout');
      clearTimeout(timeoutId);

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error data:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      const responseData = await response.json();
      console.log('Response data:', responseData);

      setSuccess('Projet mis à jour avec succès!');
      
      // Rediriger vers la page du projet après 2 secondes
      setTimeout(() => {
        console.log('Redirection vers:', `/student/projects/${projectId}`);
        router.push(`/student/projects/${projectId}`);
      }, 2000);

    } catch (err: any) {
      console.error('Erreur lors de la soumission:', err);
      
      if (err.name === 'AbortError') {
        setError('La requête a pris trop de temps. Veuillez réessayer.');
      } else {
        setError(err.message || 'Une erreur est survenue lors de la mise à jour.');
      }
    } finally {
      console.log('Fin de la soumission, setting saving to false');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-gray-200 rounded-lg h-20"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <Link href={`/student/projects/${projectId}`}>
            <Button className="mt-2">
              Retour au projet
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/student/projects/${projectId}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour au projet
            </Button>
          </Link>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Modifier le projet
          </h1>
          <p className="text-gray-600 mt-2">
            Mettez à jour les informations de votre projet
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Titre du projet *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Titre attractif pour votre projet"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Catégorie *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech">Technologie</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="education">Éducation</SelectItem>
                  <SelectItem value="health">Santé</SelectItem>
                  <SelectItem value="environment">Environnement</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Décrivez votre projet en détail"
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="objective">Objectif principal *</Label>
              <Textarea
                id="objective"
                value={formData.objective}
                onChange={(e) => handleInputChange('objective', e.target.value)}
                placeholder="Quel est l'objectif principal de ce projet?"
                rows={3}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logistique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Lieu</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Paris, Lyon, Remote..."
                />
              </div>

              <div>
                <Label htmlFor="duration">Durée</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="3 mois, 6 mois, 1 an..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="max_participants">Nombre maximum de participants *</Label>
              <Input
                id="max_participants"
                type="number"
                min="1"
                max="50"
                value={formData.max_participants}
                onChange={(e) => handleInputChange('max_participants', parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profil et exigences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="profiles_sought">Profils recherchés *</Label>
              <Textarea
                id="profiles_sought"
                value={formData.profiles_sought}
                onChange={(e) => handleInputChange('profiles_sought', e.target.value)}
                placeholder="Décrivez les types de compétences et profils que vous recherchez"
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="requirements">Prérequis</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="Y a-t-il des prérequis spécifiques pour participer?"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="status">Statut du projet *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Ouvert aux candidatures</SelectItem>
                  <SelectItem value="closed">Fermé</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="flex-1"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer les modifications
              </>
            )}
          </Button>

          <Link href={`/student/projects/${projectId}`}>
            <Button type="button" variant="outline">
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
