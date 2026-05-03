// EXEMPLE D'UTILISATION SIMPLIFIÉ - Version utilisant seulement la colonne "likes"
// Intégrez ce code dans vos composants de forum existants

import React from 'react';
import { LikeButton } from '@/components/LikeButton';

// 1. Dans votre composant ForumTopic (app/student/forum/page.tsx)
// Remplacez l'ancien système par :

const ForumTopicCard = ({ topic, token }: { topic: any, token: string | null }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* ... contenu du topic ... */}
      
      <div className="px-6 py-3 border-t border-gray-100">
        <div className="flex items-center gap-6">
          <LikeButton
            targetType="topic"
            targetId={topic.id}
            token={token}
            variant="heart"
            size="md"
          />
          
          <button
            onClick={() => handleTopicClick(topic)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm">Commenter</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Dans votre composant ForumReply
const ForumReplyCard = ({ reply, token }: { reply: any, token: string | null }) => {
  return (
    <div className="flex gap-3">
      {/* ... avatar et contenu ... */}
      
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-lg p-3">
          {/* ... contenu de la réponse ... */}
          
          <div className="flex items-center gap-4 mt-2">
            <LikeButton
              targetType="reply"
              targetId={reply.id}
              token={token}
              variant="thumbsup"
              size="sm"
              className="text-xs"
            />
            
            <button
              onClick={() => toggleExpandedReplies(reply.id)}
              className="text-blue-600 hover:text-blue-700 text-xs font-medium"
            >
              {expandedReplies.has(reply.id) ? 'Masquer les réponses' : 'Répondre'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Dans votre composant CommentReply
const CommentReplyCard = ({ commentReply, token }: { commentReply: any, token: string | null }) => {
  return (
    <div className="flex gap-2">
      {/* ... avatar et contenu ... */}
      
      <div className="flex-1 bg-gray-50 rounded-lg p-2">
        {/* ... contenu du commentaire ... */}
        
        <LikeButton
          targetType="comment_reply"
          targetId={commentReply.id}
          token={token}
          variant="thumbsup"
          size="sm"
          className="text-xs mt-1"
        />
      </div>
    </div>
  );
};

// 4. Migration des types TypeScript (version simplifiée)
interface ForumTopic {
  id: number;
  author_id: number;
  author_name: string;
  author_university?: string;
  author_department?: string;
  category?: string;
  title: string;
  content: string;
  tags?: string;
  likes: number; // Utilise directement la colonne likes existante
  is_pinned: boolean;
  created_at: string;
}

interface ForumReply {
  id: number;
  topic_id: number;
  author_id: number;
  author_name: string;
  author_university?: string;
  content: string;
  likes: number; // Utilise directement la colonne likes existante
  is_helpful: boolean;
  created_at: string;
}

interface CommentReply {
  id: number;
  reply_id: number;
  author_id: number;
  author_name: string;
  author_university?: string;
  content: string;
  likes: number; // Utilise directement la colonne likes existante
  is_helpful?: boolean;
  created_at: string;
}

// 5. Suppression des anciennes fonctions handleLike
// AVANT (à supprimer) :
const handleLikeTopic = async (topicId: number) => {
  // Ancienne logique avec simple incrémentation
  setTopics(prev => prev.map(topic => 
    topic.id === topicId 
      ? { ...topic, likes: topic.likes + 1 }
      : topic
  ));
};

const handleLikeReply = async (replyId: number) => {
  setReplies(prev => prev.map(reply => 
    reply.id === replyId 
      ? { ...reply, likes: reply.likes + 1 }
      : reply
  ));
};

// APRÈS : Plus besoin de ces fonctions !
// Le composant LikeButton gère tout automatiquement

// 6. Dans votre page principale de forum
export default function StudentForumPage() {
  const [token, setToken] = useState<string | null>(null);
  
  // Récupérer le token au montage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  return (
    <div className="mx-auto space-y-6 p-4">
      {filteredTopics.map((topic) => (
        <ForumTopicCard 
          key={topic.id} 
          topic={topic} 
          token={token}
        />
      ))}
    </div>
  );
}

// 7. Avantages de cette version simplifiée :
// ✅ Pas de colonnes supplémentaires dans la base de données
// ✅ Utilise la colonne "likes" existante
// ✅ Triggers automatiques pour maintenir les compteurs
// ✅ Contrainte "un like par utilisateur" garantie
// ✅ API RESTful simple et performante
// ✅ Composants React réutilisables
// ✅ Optimistic UI pour une meilleure expérience
// ✅ Moins de complexité à maintenir
