import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { UserInfo } from "@/types/student";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) { localStorage.removeItem("token"); return null; }
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      localStorage.removeItem("token"); return null;
    }
    return token;
  } catch { localStorage.removeItem("token"); return null; }
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const token = getToken();
    console.log("Token check:", token ? "exists" : "missing");
    
    if (!token) { 
      console.log("No token, redirecting to login");
      router.push("/login"); 
      return; 
    }
    
    const decoded = decodeToken(token);
    console.log("Decoded token:", decoded);
    
    if (!decoded || decoded.role !== "STUDENT") { 
      console.log("Invalid token or role, redirecting to login");
      router.push("/login"); 
      return; 
    }
    
    const userInfo: UserInfo = {
      userId: String(decoded.userId),
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      avatar: decoded.avatar,
    };
    
    console.log("Setting user info:", userInfo);
    setUser(userInfo);
  }, [router]);

  const logout = () => {
    localStorage.removeItem("token");
    try { window.dispatchEvent(new Event("user:logout")); } catch {}
    router.push("/login");
  };

  return { user, logout, getToken };
}
