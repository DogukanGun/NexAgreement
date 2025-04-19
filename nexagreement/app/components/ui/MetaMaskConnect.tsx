'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAccount, useConnect, useDisconnect, useConfig, useSwitchChain } from 'wagmi';
import { Button } from './Button';
import { getExplorerLink, NETWORK_CONFIG } from '@/app/utils/config';

export function MetaMaskConnect() {
  const [isClientSide, setIsClientSide] = useState(false);
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const config = useConfig();
  const { switchChain } = useSwitchChain();
  const [showDetails, setShowDetails] = useState(false);
  
  // Prevent hydration errors
  useEffect(() => {
    setIsClientSide(true);
  }, []);

  // Find the MetaMask connector - memoize to prevent recalculations
  const metamaskConnector = useMemo(() => 
    connectors.find(c => c.name === 'MetaMask'),
    [connectors]
  );
  
  // Format the address for display - memoize to prevent recalculations
  const formattedAddress = useMemo(() => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  // Check if user is on the correct network - memoize to prevent recalculations
  const isOnCorrectNetwork = useMemo(() => 
    chainId === NETWORK_CONFIG.chainId,
    [chainId]
  );

  // Don't render during SSR to prevent hydration mismatch
  if (!isClientSide) {
    return null;
  }

  // Handle connect action
  const handleConnect = () => {
    if (metamaskConnector) {
      connect({ connector: metamaskConnector });
    }
  };

  // Handle disconnect action
  const handleDisconnect = () => {
    disconnect();
  };

  // Handle network switch
  const handleNetworkSwitch = () => {
    switchChain({ chainId: NETWORK_CONFIG.chainId });
  };

  // If connected but on wrong network
  if (isConnected && !isOnCorrectNetwork) {
    return (
      <div className="flex flex-col space-y-2">
        <Button 
          onClick={handleNetworkSwitch}
          className="bg-yellow-500 hover:bg-yellow-600"
        >
          Switch to {NETWORK_CONFIG.chainName}
        </Button>
        <div className="text-xs text-yellow-600">
          Currently connected to network ID: {chainId}
        </div>
      </div>
    );
  }

  // If connected to correct network
  if (isConnected && address) {
    return (
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 pr-4">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center mr-2">
              <div className="w-4 h-4 text-white">W</div>
            </div>
            <span className="text-sm font-medium truncate max-w-[100px]">
              {formattedAddress}
            </span>
          </div>
          <Button
            onClick={handleDisconnect}
            variant="outline"
            className="rounded-full !p-1.5"
          >
            X
          </Button>
        </div>
        
        {showDetails && (
          <div className="bg-gray-50 p-3 rounded-md text-sm">
            <div className="mb-1">
              Connected to <span className="font-medium">{NETWORK_CONFIG.chainName}</span>
            </div>
            <div className="mb-2 text-xs break-all">
              Address: {address}
            </div>
            <a 
              href={getExplorerLink(address)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-xs hover:underline"
            >
              View on Explorer
            </a>
          </div>
        )}
      </div>
    );
  }

  // Not connected
  return (
    <Button
      onClick={handleConnect}
      disabled={isPending}
      className="bg-blue-600 hover:bg-blue-700 flex items-center"
    >
      {isPending ? 'Connecting...' : 'Connect with MetaMask'}
    </Button>
  );
} 