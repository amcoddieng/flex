# Robust Frontend Auth Pattern - Quick Reference

## Copy-Paste Template for New Employer Pages

Use this template when creating additional employer pages:

```typescript
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";

export default function NewEmployerPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  // ✅ PATTERN: Token helper
  const getValidToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = decodeToken(token);
    if (!decoded || decoded.role !== 'EMPLOYER') {
      localStorage.removeItem('token');
      return null;
    }
    return token;
  };

  // ✅ PATTERN: Initial auth check
  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const token = getValidToken();
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAuthed(true);
  }, [router]);

  // ✅ PATTERN: Fetch with auth and error handling
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getValidToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/employer/endpoint', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        let errorMsg = 'Erreur';
        try {
          const errorData = await res.json();
          if (errorData.error) {
            errorMsg = errorData.error;
          }
        } catch {
          if (res.status === 401 || res.status === 403) {
            errorMsg = 'Accès refusé';
            router.push('/login');
            return;
          }
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Réponse invalide');
      }

      // Process data...
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('fetchData error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthed) {
    return <div className="p-8">Vérification...</div>;
  }

  return (
    <div className="space-y-8">
      <h1>Your Content Here</h1>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
```

## Key Points

1. **`getValidToken()` is called at fetch time, not render time**
   - This ensures fresh token from localStorage
   - Validates token before using it

2. **No conditional Authorization headers**
   - If token exists, it ALWAYS goes in the header
   - If no token, redirect immediately

3. **Extract detailed errors from API**
   ```typescript
   const errorData = await res.json();
   if (errorData.error) {
     errorMsg = errorData.error;  // Use server's message
   }
   ```

4. **Handle 401/403 by redirecting**
   - These indicate auth failure
   - User should go back to login

5. **Show "Vérification..." during auth check**
   - Returns early if not authenticated
   - Prevents UI from showing before auth

## Common Mistakes to Avoid

### ❌ WRONG: Token at render time
```typescript
const token = localStorage.getItem('token');  // Gets stale value

const fetchData = async () => {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    //      ^ This might be null!
  });
};
```

### ✅ RIGHT: Token at fetch time
```typescript
const getValidToken = (): string | null => {
  // Fresh from localStorage every time
};

const fetchData = async () => {
  const token = getValidToken();  // Fresh value
  if (!token) {
    router.push('/login');
    return;
  }
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
    //        ^ Always present
  });
};
```

### ❌ WRONG: Generic error messages
```typescript
if (!res.ok) throw new Error('Erreur');  // Not helpful
```

### ✅ RIGHT: Detailed errors
```typescript
if (!res.ok) {
  let errorMsg = 'Erreur par défaut';
  try {
    const data = await res.json();
    if (data.error) {
      errorMsg = data.error;  // Server's detailed message
    }
  } catch {
    // JSON parse failed
  }
  throw new Error(errorMsg);
}
```

### ❌ WRONG: Optional Authorization header
```typescript
headers: {
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  // Doesn't send header if token is falsy
}
```

### ✅ RIGHT: Always send if we have token
```typescript
const token = getValidToken();
if (!token) {
  router.push('/login');
  return;
}

headers: {
  'Authorization': `Bearer ${token}`,  // Guaranteed to exist
}
```

## Testing Your Implementation

1. **Test with valid token**
   - Should work normally

2. **Test with expired/invalid token**
   - Page should redirect to `/login`
   - localStorage should be cleared

3. **Test with API returning error**
   - Should display detailed error message
   - Not generic "Erreur"

4. **Test with network offline**
   - Should show error (not crash)

5. **Test page refresh**
   - Auth check should complete
   - Page should load correctly
