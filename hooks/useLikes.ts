import { useState, useCallback, useEffect } from 'react';

type TargetType = 'topic' | 'reply' | 'comment_reply';

interface LikeData {
  isLiked: boolean;
  totalLikes: number;
  recentLikes?: Array<{
    name: string;
    role: string;
  }>;
}

interface UseLikesReturn {
  likes: number;
  isLiked: boolean;
  isLoading: boolean;
  error: string | null;
  toggleLike: () => Promise<void>;
  refreshLikes: () => Promise<void>;
}

export const useLikes = (targetType: TargetType, targetId: number, token: string | null): UseLikesReturn => {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const target = `${targetType === 'comment_reply' ? 'comment-reply' : targetType}_${targetId}`;

  const refreshLikes = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`/api/forum/likes?target=${target}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des likes');
      }

      const data = await response.json();
      if (data.success) {
        setLikes(data.data.totalLikes);
        setIsLiked(data.data.isLiked);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [token, target]);

  const toggleLike = useCallback(async () => {
    if (!token || isLoading) return;

    setIsLoading(true);
    setError(null);

    // Optimistic update
    const optimisticLikes = isLiked ? likes - 1 : likes + 1;
    const optimisticIsLiked = !isLiked;
    
    setLikes(optimisticLikes);
    setIsLiked(optimisticIsLiked);

    try {
      const response = await fetch('/api/forum/likes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ target })
      });

      if (!response.ok) {
        // Rollback en cas d'erreur
        setLikes(likes);
        setIsLiked(isLiked);
        
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du like');
      }

      const data = await response.json();
      if (data.success) {
        setLikes(data.data.totalLikes);
        setIsLiked(data.data.isLiked);
      }
    } catch (err: any) {
      // Rollback en cas d'erreur
      setLikes(likes);
      setIsLiked(isLiked);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token, target, isLiked, likes, isLoading]);

  useEffect(() => {
    refreshLikes();
  }, [refreshLikes]);

  return {
    likes,
    isLiked,
    isLoading,
    error,
    toggleLike,
    refreshLikes
  };
};
