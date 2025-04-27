'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBlockchain } from '@/app/providers/BlockchainProvider';
import { Button } from './Button';

export function ProductCount() {
  const { productFactoryContract, isConnected, isLoading, error } = useBlockchain();
  const [productCount, setProductCount] = useState<number | null>(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [countError, setCountError] = useState<string | null>(null);

  const fetchProductCount = useCallback(async () => {
    if (!productFactoryContract || !isConnected) {
      return;
    }

    try {
      setIsLoadingCount(true);
      setCountError(null);

      // Call the getProductCount function from the contract
      const count = await productFactoryContract.getProductCount();
      setProductCount(Number(count));
    } catch (err) {
      console.error('Error fetching product count:', err);
      setCountError('Failed to fetch product count');
    } finally {
      setIsLoadingCount(false);
    }
  }, [productFactoryContract, isConnected]);

  useEffect(() => {
    if (isConnected && productFactoryContract) {
      fetchProductCount();
    }
  }, [isConnected, productFactoryContract, fetchProductCount]);

  if (!isConnected) {
    return (
      <div className="rounded-lg border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
        <p className="text-center text-gray-400">Connect your wallet to view product count</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
        <p className="text-center text-gray-400">Loading smart contract...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-900/10 p-6">
        <p className="text-center text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-6 backdrop-blur-sm h-full flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-medium mb-3 text-white/80">Product Count</h3>
        
        {isLoadingCount ? (
          <p className="text-gray-400 text-center">Loading count...</p>
        ) : countError ? (
          <div className="text-red-400 mb-2">{countError}</div>
        ) : (
          <div className="text-6xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            {productCount !== null ? productCount : '-'}
          </div>
        )}
      </div>
      
      <Button
        onClick={fetchProductCount}
        variant="primary"
        disabled={isLoadingCount}
        className="w-full mt-4"
      >
        {isLoadingCount ? 'Loading...' : 'Refresh'}
      </Button>
    </div>
  );
} 