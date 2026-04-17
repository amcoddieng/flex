import { useState, useCallback, useEffect } from "react";
import { Application, Job, ForumTopic, ForumReply } from "@/types/student";

export function useStudentData(getToken: () => string | null) {
  // Data states
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [topicReplies, setTopicReplies] = useState<ForumReply[]>([]);

  // Loading & error states
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingForum, setLoadingForum] = useState(true);
  const [loadingTopic, setLoadingTopic] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Applications
  const fetchApplications = useCallback(async () => {
    const token = getToken();
    if (!token) {
      console.log("No token for fetchApplications");
      return;
    }
    
    console.log("Fetching applications...");
    setLoadingApps(true);
    try {
      const res = await fetch("/api/student/applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Applications response status:", res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Applications API error:", errorData);
        throw new Error(errorData.error || "Erreur chargement candidatures");
      }
      
      const data = await res.json();
      console.log("Applications data received:", data);
      setApplications(data.applications || []);
    } catch (e: any) {
      console.error("Error fetching applications:", e);
      setError(e.message);
    } finally {
      setLoadingApps(false);
    }
  }, [getToken]);

  // Fetch Jobs
  const fetchJobs = useCallback(async () => {
    const token = getToken();
    if (!token) {
      console.log("No token for fetchJobs");
      return;
    }
    
    console.log("Fetching jobs...");
    setLoadingJobs(true);
    try {
      const res = await fetch("/api/job?page=1&limit=20", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Jobs response status:", res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Jobs API error:", errorData);
        throw new Error(errorData.error || "Erreur chargement offres");
      }
      
      const data = await res.json();
      console.log("Jobs data received:", data);
      setJobs(data.data || data.jobs || data || []);
    } catch (e: any) {
      console.error("Error fetching jobs:", e);
      setError(e.message);
    } finally {
      setLoadingJobs(false);
    }
  }, [getToken]);

  // Fetch Forum Topics
  const fetchForumTopics = useCallback(async () => {
    const token = getToken();
    if (!token) {
      console.log("No token for fetchForumTopics");
      return;
    }
    
    console.log("Fetching forum topics...");
    setLoadingForum(true);
    try {
      const res = await fetch("/api/forum/topics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Forum response status:", res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Forum API error:", errorData);
        throw new Error(errorData.error || "Erreur chargement forum");
      }
      
      const data = await res.json();
      console.log("Forum data received:", data);
      setForumTopics(data.topics || data || []);
    } catch (e: any) {
      console.error("Error fetching forum topics:", e);
      setError(e.message);
    } finally {
      setLoadingForum(false);
    }
  }, [getToken]);

  // Fetch Topic Detail
  const fetchTopicDetail = async (topicId: number) => {
    const token = getToken();
    if (!token) {
      console.log("No token for fetchTopicDetail");
      return;
    }
    
    console.log("Fetching topic detail...");
    setLoadingTopic(true);
    try {
      const res = await fetch(`/api/forum/topics/${topicId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur chargement sujet");
      const data = await res.json();
      setSelectedTopic(data.topic);
      setTopicReplies(data.replies || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingTopic(false);
    }
  };

  return {
    // Data
    applications,
    jobs,
    forumTopics,
    selectedTopic,
    topicReplies,
    
    // Loading states
    loadingApps,
    loadingJobs,
    loadingForum,
    loadingTopic,
    
    // Error
    error,
    
    // Actions
    fetchApplications,
    fetchJobs,
    fetchForumTopics,
    fetchTopicDetail,
    setSelectedTopic,
    setApplications,
    setJobs,
    setForumTopics,
    setError,
  };
}
