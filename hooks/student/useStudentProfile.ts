import { useState, useCallback, useEffect } from "react";

interface StudentProfileData {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  university: string;
  department: string;
  yearOfStudy: number;
  bio: string;
  skills: any[];
  availability: any;
  services: any[];
  hourlyRate: number;
  profilePhoto: string;
  studentCardPdf: string;
  validationStatus: string;
  rejectionReason: string;
  createdAt: string;
  accountCreatedAt: string;
  statistics: {
    applications: {
      total: number;
      accepted: number;
      pending: number;
      interview: number;
      rejected: number;
      successRate: number;
      responseRate: number;
      lastApplicationDate: string;
    };
    forum: {
      topicsCreated: number;
      repliesGiven: number;
      totalTopicLikes: number;
      totalReplyLikes: number;
    };
    notifications: {
      unreadCount: number;
    };
  };
  recentApplications: Array<{
    id: number;
    status: string;
    appliedAt: string;
    jobTitle: string;
    company: string;
  }>;
}

export function useStudentProfile(getToken: () => string | null) {
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    const token = getToken();
    if (!token) {
      console.log("No token for fetchProfile");
      return;
    }

    console.log("Fetching student profile...");
    setLoading(true);
    try {
      const res = await fetch("/api/student/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Profile response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Profile API error:", errorData);
        throw new Error(errorData.error || "Erreur chargement profil");
      }

      const data = await res.json();
      console.log("Profile data received:", data);
      
      if (data.success) {
        setProfile(data.student);
      } else {
        throw new Error(data.error || "Erreur profil");
      }
    } catch (e: any) {
      console.error("Error fetching profile:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const updateProfile = useCallback(async (profileData: Partial<StudentProfileData>) => {
    const token = getToken();
    if (!token) {
      console.log("No token for updateProfile");
      return;
    }

    console.log("Updating student profile...");
    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profileData),
      });

      console.log("Update profile response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Update profile API error:", errorData);
        throw new Error(errorData.error || "Erreur mise à jour profil");
      }

      const data = await res.json();
      console.log("Update profile response:", data);
      
      if (data.success) {
        // Rafraîchir les données du profil
        await fetchProfile();
        return { success: true, message: data.message };
      } else {
        throw new Error(data.error || "Erreur mise à jour");
      }
    } catch (e: any) {
      console.error("Error updating profile:", e);
      setError(e.message);
      return { success: false, error: e.message };
    }
  }, [getToken, fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    setProfile,
    setError,
  };
}
