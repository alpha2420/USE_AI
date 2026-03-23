"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { setApiToken } from '@/lib/api';

function ApiInterceptor({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded } = useAuth();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const attachToken = async () => {
      if (!isLoaded) return;
      try {
        const token = await getToken();
        setApiToken(token);
      } catch (err) {
        setApiToken(null);
      } finally {
        setInitialized(true);
      }
    };
    attachToken();
  }, [getToken, isLoaded]);

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
