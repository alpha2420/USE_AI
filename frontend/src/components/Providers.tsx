"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { setApiToken, setTokenGetter } from '@/lib/api';

function ApiInterceptor({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [initialized, setInitialized] = useState(false);

  // Stable token getter that the interceptor will call on every request
  const stableGetToken = useCallback(async () => {
    try {
      return await getToken();
    } catch {
      return null;
    }
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) return;

    // Register the token getter so the axios interceptor can call it per-request
    setTokenGetter(stableGetToken);

    // Also set the initial token for immediate availability
    const init = async () => {
      try {
        const token = await getToken();
        setApiToken(token);
      } catch {
        setApiToken(null);
      } finally {
        setInitialized(true);
      }
    };
    init();
  }, [getToken, isLoaded, isSignedIn, stableGetToken]);

  if (!initialized) return null;

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ApiInterceptor>
        {children}
      </ApiInterceptor>
    </QueryClientProvider>
  );
}
