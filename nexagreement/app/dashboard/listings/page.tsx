'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { ListingItemCard } from './components/ListingItemCard';
import { useBlockchain } from '@/app/providers/BlockchainProvider';
import { ethers } from 'ethers';

export default function MyListings() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { productFactoryContract, address, isConnected } = useBlockchain();

  // Fetch listings from blockchain
  useEffect(() => {
    async function fetchListings() {
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
        
        const fetchedListings: any[] = [];
        
        // Try to get seller's products directly if the method is available
        try {
          const sellerProducts = await productFactoryContract.getProductsBySeller(address);
          console.log('Seller products:', sellerProducts);
          
          // Process seller's products
          for (let i = 0; i < sellerProducts.length; i++) {
            const productAddress = sellerProducts[i];
            await processProductListing(productAddress, fetchedListings);
          }
        } catch (sellerError) {
          console.error('Could not get products by seller:', sellerError);
          
          // Fallback: fetch all products and filter by seller
          for (let i = 0; i < productCount; i++) {
            try {
              const productAddress = await productFactoryContract.allProducts(i);
              
              // Create a minimal Product contract interface
              const ProductABI = [
                "function seller() view returns (address)"
              ];
              
              const provider = new ethers.BrowserProvider(window.ethereum);
              const signer = await provider.getSigner();
              const productContract = new ethers.Contract(productAddress, ProductABI, signer);
              
              // Check if current user is the seller
              try {
                const productSeller = await productContract.seller();
                if (productSeller.toLowerCase() === address.toLowerCase()) {
                  await processProductListing(productAddress, fetchedListings, i);
                }
              } catch (err) {
                console.error(`Error checking seller for product ${i}:`, err);
              }
            } catch (err) {
              console.error(`Error fetching product ${i}:`, err);
            }
          }
        }
        
        setListings(fetchedListings);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load your listings from blockchain');
      } finally {
        setIsLoading(false);
      }
    }
    
    async function processProductListing(productAddress: string, listingsArray: any[], index?: number) {
      try {
        // Create a minimal Product contract interface to access fields
        const ProductABI = [
          "function name() view returns (string)",
          "function category() view returns (string)",
          "function description() view returns (string)",
          "function ipfsId() view returns (string)",
          "function price() view returns (uint256)",
          "function isSold() view returns (bool)"
        ];
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const productContract = new ethers.Contract(productAddress, ProductABI, signer);
        
        // Get product details
        const [productName, productCategory, productDescription, productIpfsId, productPrice, isSold] = await Promise.all([
          productContract.name().catch(() => ""),
          productContract.category().catch(() => "Other"),
          productContract.description().catch(() => ""),
          productContract.ipfsId().catch(() => ""),
          productContract.price().catch(() => "0"),
          productContract.isSold().catch(() => false)
        ]);
        
        // Add to listings array
        listingsArray.push({
          id: index !== undefined ? index : listingsArray.length,
          title: productName || `Product #${listingsArray.length}`,
          price: `${ethers.formatEther(productPrice.toString())} C2FLR`,
          description: productDescription || "No description available",
          createdAt: "Recently added",
          status: isSold ? "Sold" : "Active",
          views: Math.floor(Math.random() * 50),
          sales: isSold ? 1 : 0,
          category: productCategory,
          ipfsHash: productIpfsId,
          address: productAddress
        });
      } catch (err) {
        console.error('Error processing product:', err);
      }
    }
    
    fetchListings();
  }, [productFactoryContract, address]);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader 
          title="Your Listings" 
          description="Manage your published legal agreements"
          action={{
            label: "Create New Listing",
            href: "/dashboard/create-listing"
          }}
        />
        
        <EmptyState
          title="Please connect your wallet"
          description="Connect your wallet to view your listings"
          action={{
            label: "Create Your First Listing",
            href: "/dashboard/create-listing"
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Your Listings" 
        description="Manage your published legal agreements"
        action={{
          label: "Create New Listing",
          href: "/dashboard/create-listing"
        }}
      />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-white/70">Loading your listings from blockchain...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg p-4 mb-4">
          {error}
        </div>
      ) : listings.length > 0 ? (
        <div className="space-y-6">
          {listings.map(listing => (
            <ListingItemCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="You don't have any listings yet"
          description="Create your first listing to start selling your legal agreements"
          action={{
            label: "Create Your First Listing",
            href: "/dashboard/create-listing"
          }}
        />
      )}
    </div>
  );
} 