# 🎨 Architecture Frontend - Projets Collaboratifs

## 📁 Structure des dossiers

```
app/
├── student/
│   ├── projects/
│   │   ├── page.tsx                    # Liste des projets
│   │   ├── create/
│   │   │   └── page.tsx               # Formulaire création
│   │   ├── [id]/
│   │   │   ├── page.tsx               # Détails projet
│   │   │   ├── applications/
│   │   │   │   └── page.tsx           # Gestion candidatures (créateur)
│   │   │   ├── chat/
│   │   │   │   └── page.tsx           # Chat du projet
│   │   │   ├── tasks/
│   │   │   │   └── page.tsx           # Gestion des tâches
│   │   │   └── feedbacks/
│   │   │       └── page.tsx           # Feedbacks finaux
│   │   └── recommendations/
│   │       └── page.tsx               # Projets recommandés
│   └── profile/
│       └── skills/
│           └── page.tsx               # Gestion compétences
├── components/
│   ├── projects/
│   │   ├── ProjectCard.tsx            # Carte projet
│   │   ├── ProjectForm.tsx            # Formulaire création/édition
│   │   ├── ApplicationForm.tsx        # Formulaire candidature
│   │   ├── ApplicationList.tsx        # Liste des candidatures
│   │   ├── MemberList.tsx             # Liste des membres
│   │   ├── ProjectChat.tsx            # Chat en temps réel
│   │   ├── TaskBoard.tsx              # Tableau des tâches
│   │   ├── FeedbackForm.tsx            # Formulaire feedback
│   │   └── FilterPanel.tsx            # Filtres de recherche
│   ├── ui/
│   │   ├── Badge.tsx                  # Badge catégorie/statut
│   │   ├── Avatar.tsx                 # Avatar utilisateur
│   │   ├── ProgressBar.tsx            # Barre de progression
│   │   └── StatusIndicator.tsx        # Indicateur de statut
└── hooks/
    ├── useProjects.ts                 # Hook projets
    ├── useApplications.ts             # Hook candidatures
    ├── useProjectChat.ts              # Hook chat temps réel
    ├── useTasks.ts                    # Hook tâches
    └── useRecommendations.ts          # Hook recommandations
```

---

## 🎯 Pages principales

### 1. Liste des projets (`/student/projects`)

```tsx
// app/student/projects/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { FilterPanel } from '@/components/projects/FilterPanel';
import { useProjects } from '@/hooks/useProjects';

export default function ProjectsPage() {
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    status: 'open',
    search: ''
  });
  
  const { projects, loading, pagination } = useProjects(filters);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-6">
        {/* Filtres latéraux */}
        <aside className="w-64">
          <FilterPanel 
            filters={filters} 
            onChange={setFilters} 
          />
        </aside>
        
        {/* Liste des projets */}
        <main className="flex-1">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project}
                showApplyButton={true}
              />
            ))}
          </div>
          
          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            {/* Component pagination */}
          </div>
        </main>
      </div>
    </div>
  );
}
```

### 2. Détails du projet (`/student/projects/[id]`)

```tsx
// app/student/projects/[id]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { ProjectHeader } from '@/components/projects/ProjectHeader';
import { ProjectDescription } from '@/components/projects/ProjectDescription';
import { MemberList } from '@/components/projects/MemberList';
import { ApplicationForm } from '@/components/projects/ApplicationForm';
import { useProject } from '@/hooks/useProjects';

export default function ProjectDetailPage() {
  const params = useParams();
  const { project, loading, isCreator, isMember } = useProject(params.id);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête du projet */}
      <ProjectHeader project={project} />
      
      <div className="grid gap-8 mt-8 lg:grid-cols-3">
        {/* Description et infos principales */}
        <div className="lg:col-span-2 space-y-6">
          <ProjectDescription project={project} />
          
          {/* Membres actuels */}
          <MemberList 
            members={project.members} 
            showManageButton={isCreator}
          />
        </div>
        
        {/* Actions latérales */}
        <aside className="space-y-4">
          {/* Formulaire de candidature */}
          {!isMember && !isCreator && (
            <ApplicationForm projectId={project.id} />
          )}
          
          {/* Actions créateur */}
          {isCreator && (
            <div className="space-y-2">
              <Link href={`/student/projects/${project.id}/applications`}>
                <Button className="w-full">Voir les candidatures</Button>
              </Link>
              <Link href={`/student/projects/${project.id}/tasks`}>
                <Button variant="outline" className="w-full">Gérer les tâches</Button>
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
```

---

## 🧩 Composants React

### 1. ProjectCard - Carte projet

```tsx
// components/projects/ProjectCard.tsx
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProjectCardProps {
  project: Project;
  showApplyButton?: boolean;
}

export function ProjectCard({ project, showApplyButton = true }: ProjectCardProps) {
  const progressPercentage = (project.current_participants / project.max_participants) * 100;
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link href={`/student/projects/${project.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              {project.title}
            </h3>
          </Link>
          <Badge category={project.category} className="mt-2" />
        </div>
        <Badge status={project.status} />
      </div>
      
      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {project.description}
      </p>
      
      {/* Localisation et durée */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <span>📍 {project.location}</span>
        <span>⏱️ {project.duration}</span>
      </div>
      
      {/* Progression participants */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Participants</span>
          <span className="font-medium">
            {project.current_participants}/{project.max_participants}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      
      {/* Créateur et date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar name={project.creator.name} size="sm" />
          <div>
            <p className="text-sm font-medium">{project.creator.name}</p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(project.created_at), {
                addSuffix: true,
                locale: fr
              })}
            </p>
          </div>
        </div>
        
        {showApplyButton && project.status === 'open' && (
          <Link href={`/student/projects/${project.id}`}>
            <Button size="sm">Postuler</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
```

### 2. ApplicationForm - Formulaire candidature

```tsx
// components/projects/ApplicationForm.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useApplications } from '@/hooks/useApplications';

interface ApplicationFormProps {
  projectId: number;
  onSuccess?: () => void;
}

export function ApplicationForm({ projectId, onSuccess }: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    message: '',
    skills: '',
    availability: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { applyToProject } = useApplications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await applyToProject(projectId, formData);
      onSuccess?.();
      setFormData({ message: '', skills: '', availability: '' });
    } catch (error) {
      console.error('Erreur lors de la candidature:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Postuler à ce projet</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message de motivation
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Pourquoi voulez-vous rejoindre ce projet ?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Compétences
          </label>
          <input
            type="text"
            value={formData.skills}
            onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
            placeholder="marketing, design, communication..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Disponibilité
          </label>
          <input
            type="text"
            value={formData.availability}
            onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
            placeholder="Week-ends, soirs..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma candidature'}
        </Button>
      </form>
    </div>
  );
}
```

### 3. ProjectChat - Chat temps réel

```tsx
// components/projects/ProjectChat.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { useProjectChat } from '@/hooks/useProjectChat';

interface ProjectChatProps {
  projectId: number;
}

export function ProjectChat({ projectId }: ProjectChatProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, sendMessage, isConnected } = useProjectChat(projectId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 h-96 flex flex-col">
      {/* En-tête */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold">Chat du projet</h3>
        <div className="flex items-center gap-2 mt-1">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'En ligne' : 'Hors ligne'}
          </span>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3">
            <Avatar name={msg.sender.name} size="sm" />
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm">{msg.sender.name}</span>
                <span className="text-xs text-gray-500">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-700 text-sm mt-1">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Formulaire d'envoi */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tapez votre message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!isConnected}
          />
          <Button type="submit" disabled={!isConnected || !message.trim()}>
            Envoyer
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

## 🪝 Hooks personnalisés

### 1. useProjects - Hook projets

```tsx
// hooks/useProjects.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UseProjectsOptions {
  category?: string;
  location?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useProjects(options: UseProjectsOptions = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, [options]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(options as any);
      const response = await fetch(`/api/student/projects?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data.data.projects);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: CreateProjectData) => {
    try {
      const response = await fetch('/api/student/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      
      if (response.ok) {
        const newProject = await response.json();
        router.push(`/student/projects/${newProject.data.id}`);
      }
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
    }
  };

  return {
    projects,
    loading,
    pagination,
    createProject,
    refetch: fetchProjects
  };
}
```

### 2. useProjectChat - Hook chat temps réel

```tsx
// hooks/useProjectChat.ts
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useProjectChat(projectId: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connexion WebSocket
    socketRef.current = io('/project-chat', {
      query: { project_id: projectId }
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connecté au chat du projet');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Charger les messages existants
    loadExistingMessages();

    return () => {
      socket.disconnect();
    };
  }, [projectId]);

  const loadExistingMessages = async () => {
    try {
      const response = await fetch(`/api/student/projects/${projectId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.data.messages);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  };

  const sendMessage = (content: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send_message', { content });
    }
  };

  return {
    messages,
    sendMessage,
    isConnected
  };
}
```

---

## 🎨 Design System

### Couleurs et thèmes
```css
/* styles/projects.css */
:root {
  --project-business: #3B82F6;    /* Blue */
  --project-social: #10B981;      /* Green */
  --project-event: #F59E0B;       /* Amber */
  --project-academic: #8B5CF6;    /* Purple */
  --project-other: #6B7280;       /* Gray */
}

.project-card {
  @apply bg-white rounded-lg border border-gray-200 p-6;
  @apply hover:shadow-lg transition-shadow;
}

.project-badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.project-badge.business { @apply bg-blue-100 text-blue-800; }
.project-badge.social { @apply bg-green-100 text-green-800; }
.project-badge.event { @apply bg-amber-100 text-amber-800; }
.project-badge.academic { @apply bg-purple-100 text-purple-800; }
.project-badge.other { @apply bg-gray-100 text-gray-800; }
```

### Composants réutilisables
```tsx
// components/ui/Badge.tsx
interface BadgeProps {
  category?: string;
  status?: string;
  className?: string;
}

export function Badge({ category, status, className = '' }: BadgeProps) {
  if (category) {
    return <span className={`project-badge ${category} ${className}`}>
      {category}
    </span>;
  }
  
  if (status) {
    return <span className={`status-badge ${status} ${className}`}>
      {status}
    </span>;
  }
  
  return null;
}
```

---

## 🚀 Performance et Optimisation

### 1. Code splitting
```tsx
// Lazy loading des pages
const ProjectDetailPage = lazy(() => import('./[id]/page'));
const ProjectChatPage = lazy(() => import('./chat/page'));
```

### 2. Infinite scroll
```tsx
// hooks/useInfiniteProjects.ts
export function useInfiniteProjects(options: UseProjectsOptions) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const nextPage = Math.ceil(projects.length / 10) + 1;
      const response = await fetch(`/api/student/projects?page=${nextPage}`);
      
      if (response.ok) {
        const data = await response.json();
        setProjects(prev => [...prev, ...data.data.projects]);
        setHasMore(data.data.projects.length > 0);
      }
    } finally {
      setLoading(false);
    }
  };

  return { projects, loadMore, hasMore, loading };
}
```

### 3. Cache local
```tsx
// hooks/useProjectsCache.ts
const projectsCache = new Map<string, Project[]>();

export function useProjectsCache() {
  const getCachedProjects = (key: string) => {
    return projectsCache.get(key);
  };

  const setCachedProjects = (key: string, projects: Project[]) => {
    projectsCache.set(key, projects);
    // Cache TTL: 5 minutes
    setTimeout(() => {
      projectsCache.delete(key);
    }, 5 * 60 * 1000);
  };

  return { getCachedProjects, setCachedProjects };
}
```

---

## 📱 Responsive Design

```css
/* Mobile-first approach */
@media (max-width: 640px) {
  .projects-grid {
    @apply grid-cols-1 gap-4;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .projects-grid {
    @apply grid-cols-2 gap-6;
  }
}

@media (min-width: 1025px) {
  .projects-grid {
    @apply grid-cols-3 gap-8;
  }
}
```

Cette architecture frontend offre une expérience utilisateur complète, performante et scalable pour la fonctionnalité de projets collaboratifs.
