"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { setApiToken } from '@/lib/api';

function ApiInterceptor({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    const attachToken = async () => {
      try {
        const token = await getToken();
        setApiToken(token);
      } catch (err) {
        setApiToken(null);
      }
    };
    attachToken();
  }, [getToken]);

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
