'use client';

import { createConfig, http, WagmiProvider as LibWagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { metaMask } from 'wagmi/connectors';
import { ReactNode, useState, useEffect } from 'react';
import { NETWORK_CONFIG } from '@/app/utils/config';

// Define the Flare Coston2 chain
const flareCoston2 = {
  id: NETWORK_CONFIG.chainId,
  name: NETWORK_CONFIG.chainName,
  nativeCurrency: NETWORK_CONFIG.nativeCurrency,
  rpcUrls: {
    default: { http: NETWORK_CONFIG.rpcUrls },
    public: { http: NETWORK_CONFIG.rpcUrls },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: NETWORK_CONFIG.blockExplorerUrls[0] },
  },
};

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});

// Create Wagmi config
const config = createConfig({
  chains: [flareCoston2],
  connectors: [
    metaMask(),
  ],
  transports: {
    [flareCoston2.id]: http(flareCoston2.rpcUrls.default.http[0]),
  },
});

export function WagmiProvider({ children }: { children: ReactNode }) {
  // State to track if the component is mounted
  const [mounted, setMounted] = useState(false);
  
  // Only render children on client-side
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return (
    <LibWagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {mounted ? children : null}
      </QueryClientProvider>
    </LibWagmiProvider>
  );
} 