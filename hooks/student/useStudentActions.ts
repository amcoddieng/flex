import { useState, useCallback } from "react";
import { Application, ForumTopic } from "@/types/student";

export function useStudentActions(getToken: () => string | null) {
  const [savedJobs, setSavedJobs] = useState<Set<string | number>>(new Set());
  const [likedTopics, setLikedTopics] = useState<Set<number>>(new Set());
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [newReply, setNewReply] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

  // Withdraw Application
  const withdrawApplication = useCallback(async (id: number, onRefresh: () => void) => {
    if (!confirm("Retirer cette candidature ?")) return;
    const token = getToken();
    if (!token) return;
    setWithdrawingId(id);
    try {
      const res = await fetch(`/api/student/applications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur retrait");
      setSelectedApp(null);
      await onRefresh();
    } catch (e: any) {
      console.error("Error withdrawing application:", e);
    } finally {
      setWithdrawingId(null);
    }
  }, [getToken]);

  // Submit Reply
  const submitReply = useCallback(async (topicId: number, onRefresh: () => void) => {
    if (!newReply.trim()) return;
    const token = getToken();
    if (!token) return;
    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/forum/topics/${topicId}/replies`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: newReply.trim() }),
      });
      if (!res.ok) throw new Error("Erreur envoi réponse");
      setNewReply("");
      await onRefresh();
    } catch (e: any) {
      console.error("Error submitting reply:", e);
    } finally {
      setSubmittingReply(false);
    }
  }, [getToken, newReply]);

  // Like Topic
  const likeTopic = useCallback(async (topicId: number, e?: React.MouseEvent, selectedTopic?: ForumTopic | null, onRefresh?: () => void) => {
    e?.stopPropagation();
    const token = getToken();
    if (!token) return;
    const alreadyLiked = likedTopics.has(topicId);
    
    // Optimistic update
    setLikedTopics(prev => {
      const next = new Set(prev);
      alreadyLiked ? next.delete(topicId) : next.add(topicId);
      return next;
    });
    
    try {
      const res = await fetch(`/api/forum/topics/${topicId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLikedTopics(prev => {
          const next = new Set(prev);
          data.liked ? next.add(topicId) : next.delete(topicId);
          return next;
        });
        if (onRefresh) onRefresh();
      } else {
        // Rollback on error
        setLikedTopics(prev => { 
          const next = new Set(prev); 
          alreadyLiked ? next.add(topicId) : next.delete(topicId); 
          return next; 
        });
      }
    } catch {
      // Rollback on network error
      setLikedTopics(prev => { 
        const next = new Set(prev); 
        alreadyLiked ? next.add(topicId) : next.delete(topicId); 
        return next; 
      });
    }
  }, [getToken, likedTopics]);

  // Like Reply
  const likeReply = useCallback(async (replyId: number, onRefresh: () => void) => {
    const token = getToken();
    if (!token) return;
    await fetch(`/api/forum/replies/${replyId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    await onRefresh();
  }, [getToken]);

  return {
    // States
    savedJobs,
    likedTopics,
    selectedApp,
    newReply,
    submittingReply,
    withdrawingId,
    
    // Actions
    setSavedJobs,
    setSelectedApp,
    setNewReply,
    setLikedTopics,
    withdrawApplication,
    submitReply,
    likeTopic,
    likeReply,
  };
}
