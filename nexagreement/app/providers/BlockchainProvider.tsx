'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { Contract, ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '@/app/utils/config';

// Import your contract ABIs
import ProductFactoryABI from '@/app/contracts/ProductFactory.json';

type BlockchainContextType = {
  isConnected: boolean;
  address: string | undefined;
  productFactoryContract: Contract | null;
  isLoading: boolean;
  error: string | null;
};

const BlockchainContext = createContext<BlockchainContextType>({
  isConnected: false,
  address: undefined,
  productFactoryContract: null,
  isLoading: false,
  error: null,
});

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();  
  const [productFactoryContract, setProductFactoryContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Detect if we're in a browser environment
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }
    
    async function initializeContracts() {
      if (!isConnected || !walletClient) {
        setProductFactoryContract(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Check if ethereum is available in the browser
        if (!window.ethereum) {
          throw new Error('MetaMask is not installed. Please install MetaMask to use this application.');
        }

        // Create a provider with the connected wallet
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Get signer with error handling
        let signer;
        try {
          signer = await provider.getSigner();
        } catch (err) {
          console.error('Error getting signer:', err);
          throw new Error('Failed to get wallet signer. Please ensure your wallet is connected properly.');
        }

        // Initialize the ProductFactory contract with error handling
        try {
          const factory = new ethers.Contract(
            CONTRACT_ADDRESSES.productFactory,
            ProductFactoryABI.abi,
            signer
          );
          
          // Test contract connection with a simple call
          await factory.getProductCount();
          
          setProductFactoryContract(factory);
        } catch (err) {
          console.error('Error initializing ProductFactory contract:', err);
          throw new Error(`Failed to initialize blockchain contracts. Please check your connection to the ${CONTRACT_ADDRESSES.productFactory} contract.`);
        }
      } catch (err: any) {
        console.error('Error initializing contracts:', err);
        setError(err.message || 'Failed to initialize blockchain contracts');
        setProductFactoryContract(null);
      } finally {
        setIsLoading(false);
      }
    }

    initializeContracts();
  }, [isConnected, walletClient, address]);

  // Separate useEffect to handle connection changes and cleanup
  useEffect(() => {
    return () => {
      // Cleanup function
      setProductFactoryContract(null);
    };
  }, []);

  return (
    <BlockchainContext.Provider
      value={{
        isConnected,
        address,
        productFactoryContract,
        isLoading,
        error,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
}

export const useBlockchain = () => useContext(BlockchainContext); 