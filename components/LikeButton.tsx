import React from 'react';
import { Heart, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLikes } from '@/hooks/useLikes';

type TargetType = 'topic' | 'reply' | 'comment_reply';

interface LikeButtonProps {
  targetType: TargetType;
  targetId: number;
  token: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'heart' | 'thumbsup';
  showCount?: boolean;
  disabled?: boolean;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  targetType,
  targetId,
  token,
  className = '',
  size = 'md',
  variant = 'heart',
  showCount = true,
  disabled = false
}) => {
  const { likes, isLiked, isLoading, error, toggleLike } = useLikes(targetType, targetId, token);

  const sizeClasses = {
    sm: 'h-3 w-3 text-xs',
    md: 'h-4 w-4 text-sm',
    lg: 'h-5 w-5 text-base'
  };

  const buttonSizes = {
    sm: 'px-2 py-1',
    md: 'px-3 py-2',
    lg: 'px-4 py-3'
  };

  const Icon = variant === 'thumbsup' ? ThumbsUp : Heart;

  const handleClick = () => {
    if (!token) {
      alert('Vous devez être connecté pour aimer du contenu');
      return;
    }
    toggleLike();
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={disabled || isLoading || !token}
        className={`
          flex items-center gap-1 transition-all duration-200
          ${isLiked ? 'text-red-500 hover:text-red-600 scale-105' : 'text-gray-500 hover:text-red-500'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          ${buttonSizes[size]}
          ${className}
        `}
      >
        <Icon 
          className={`${sizeClasses[size]} ${isLiked ? 'fill-current' : ''}`} 
        />
        {isLoading && (
          <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        )}
      </Button>
      
      {showCount && (
        <span className={`text-gray-600 font-medium ${sizeClasses[size]}`}>
          {likes}
        </span>
      )}

      {error && (
        <span className="text-xs text-red-500 ml-2">
          {error}
        </span>
      )}
    </div>
  );
};
