"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, WagmiProvider, createConfig } from "wagmi";
import { flareTestnet, flare } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";


const queryClient = new QueryClient();

const config = createConfig({
    ssr: true,
    chains: [flare, flareTestnet],
    connectors: [metaMask()],
    transports: {
        [flare.id]: http(),
        [flareTestnet.id]: http(),
    },
});

const Connector = ({ children }: { children: React.ReactNode }) => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}

export default Connector;