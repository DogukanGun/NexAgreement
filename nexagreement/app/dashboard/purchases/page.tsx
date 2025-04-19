'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Select } from '@/app/components/ui/Input';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { PurchaseCard, Purchase } from './components/PurchaseCard';
import { useBlockchain } from '@/app/providers/BlockchainProvider';
import { ethers } from 'ethers';

export default function MyPurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('recent');
  
  const { productFactoryContract, address, isConnected } = useBlockchain();

  // Fetch purchases from blockchain
  useEffect(() => {
    async function fetchPurchases() {
      if (!productFactoryContract || !address) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get the number of products
        const productCount = await productFactoryContract.getProductCount();
        console.log('Total product count:', productCount);
        
        const fetchedPurchases: Purchase[] = [];
        
        // Fetch all products and check if user is the buyer
        for (let i = 0; i < productCount; i++) {
          try {
            const productAddress = await productFactoryContract.allProducts(i);
            console.log(`Checking product ${i} at address ${productAddress}`);
            
            // Create a minimal Product contract interface
            const ProductABI = [
              "function name() view returns (string)",
              "function description() view returns (string)",
              "function price() view returns (uint256)",
              "function seller() view returns (address)",
              "function isSold() view returns (bool)",
              "function ipfsId() view returns (string)",
              "function category() view returns (string)"
            ];
            
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const productContract = new ethers.Contract(productAddress, ProductABI, signer);
            
            // Check if product is sold and if sold to current user
            // Note: Since we don't store buyer info in the contract yet, we use a mock approach
            // where we assume the user bought it if they didn't create it and it's sold
            try {
              const [isSold, seller, productName, price] = await Promise.all([
                productContract.isSold().catch(() => false),
                productContract.seller().catch(() => ""),
                productContract.name().catch(() => ""),
                productContract.price().catch(() => "0")
              ]);
              
              // If product is sold and user is not the seller, assume user is the buyer
              // In a real app, you'd need to track actual purchases
              if (isSold && seller.toLowerCase() !== address.toLowerCase()) {
                const [description, ipfsId, category] = await Promise.all([
                  productContract.description().catch(() => ""),
                  productContract.ipfsId().catch(() => ""),
                  productContract.category().catch(() => "Other")
                ]);
                
                fetchedPurchases.push({
                  id: i,
                  title: productName || `Product #${i}`,
                  price: `${ethers.formatEther(price.toString())} C2FLR`,
                  seller: `${seller.slice(0, 6)}...${seller.slice(-4)}`,
                  purchaseDate: "Recently", // Mock data, would need to get from events
                  status: "Completed",
                  transactionHash: "0x", // Would need to get from events
                  productAddress: productAddress,
                  ipfsHash: ipfsId,
                  category: category,
                  description: description
                });
              }
            } catch (err) {
              console.error(`Error checking product ${i}:`, err);
            }
          } catch (err) {
            console.error(`Error fetching product ${i}:`, err);
          }
        }
        
        setPurchases(fetchedPurchases);
      } catch (err) {
        console.error('Error fetching purchases:', err);
        setError('Failed to load your purchases from blockchain');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPurchases();
  }, [productFactoryContract, address]);
  
  // Filter and sort purchases
  const filteredPurchases = purchases.filter(purchase => 
    statusFilter === 'all' || purchase.status.toLowerCase() === statusFilter.toLowerCase()
  );
  
  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
    if (sortOption === 'oldest') {
      return a.id - b.id;
    } else if (sortOption === 'price-high') {
      return parseFloat(b.price) - parseFloat(a.price);
    } else if (sortOption === 'price-low') {
      return parseFloat(a.price) - parseFloat(b.price);
    }
    // Default: recent first
    return b.id - a.id;
  });
  
  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Purchases' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' }
  ];
  
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'price-low', label: 'Price: Low to High' }
  ];

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader 
          title="Your Purchases" 
          description="View and manage your purchased agreements"
          action={{
            label: "Browse Marketplace",
            href: "/dashboard/marketplace"
          }}
        />
        
        <EmptyState
          title="Please connect your wallet"
          description="Connect your wallet to view your purchases"
          action={{
            label: "Explore Marketplace",
            href: "/dashboard/marketplace"
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Your Purchases" 
        description="View and manage your purchased agreements"
        action={{
          label: "Browse Marketplace",
          href: "/dashboard/marketplace"
        }}
      />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-white/70">Loading your purchases from blockchain...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg p-4 mb-4">
          {error}
        </div>
      ) : sortedPurchases.length > 0 ? (
        <div>
          <div className="mb-8 flex items-center">
            <div className="flex gap-4">
              <Select 
                options={statusOptions} 
                value={statusFilter}
                onChange={handleStatusChange}
              />
              <Select 
                options={sortOptions}
                value={sortOption}
                onChange={handleSortChange}
              />
            </div>
          </div>

          <div className="space-y-6">
            {sortedPurchases.map((purchase) => (
              <PurchaseCard 
                key={purchase.id} 
                purchase={purchase} 
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="You haven't made any purchases yet"
          description="Browse the marketplace to find legal agreements"
          action={{
            label: "Explore Marketplace",
            href: "/dashboard/marketplace"
          }}
        />
      )}
    </div>
  );
} 