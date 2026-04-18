"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export default function LogoutButton({ 
  variant = 'outline', 
  size = 'default', 
  className = '',
  children 
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      // Get the current token
      const token = localStorage.getItem('token');
      
      // Call logout API (optional but good for server-side logging)
      if (token) {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      // Remove token from localStorage
      localStorage.removeItem('token');
      
      // Remove any other auth-related data
      localStorage.removeItem('user');
      localStorage.removeItem('auth');
      
      // Dispatch logout event for other components
      try {
        window.dispatchEvent(new CustomEvent('user:logout'));
      } catch (e) {
        // ignore if window unavailable
      }

      // Clear any session storage data
      try {
        sessionStorage.clear();
      } catch (e) {
        // ignore if sessionStorage unavailable
      }

      // Redirect to login page
      router.push('/login');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, still clear local data and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth');
      try {
        sessionStorage.clear();
      } catch (e) {
        // ignore
      }
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Déconnexion...
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4 mr-2" />
          {children || 'Déconnexion'}
        </>
      )}
    </Button>
  );
}
