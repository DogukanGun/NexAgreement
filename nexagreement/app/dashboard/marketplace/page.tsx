'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Button } from '@/app/components/ui/Button';
import { Select } from '@/app/components/ui/Input';
import { ListingCard, Listing } from './components/ListingCard';
import { CategoryCard } from './components/CategoryCard';
import { useBlockchain } from '@/app/providers/BlockchainProvider';
import { ethers } from 'ethers';
import { getExplorerLink, NETWORK_CONFIG, CONTRACT_ADDRESSES } from '@/app/utils/config';
import { ipfsToHttp } from '@/app/utils/ipfs';
import ProductFactoryABI from '@/app/contracts/ProductFactory.json';

// Category mapping (numeric ID to string name)
const CATEGORY_NAMES: Record<string, string> = {
  "commercial": 'Commercial',
  "rental": 'Rental',
  "employment": 'Employment',
  "partnership": 'Partnership',
  "real-estate": 'Real Estate',
  "other": 'Other'
};

export default function Marketplace() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOption, setSortOption] = useState('');
  
  const { productFactoryContract, isLoading: isContractLoading } = useBlockchain();

  // Fetch listings from blockchain
  useEffect(() => {
    async function fetchListings() {
      if (!productFactoryContract) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get the number of products
        const productCount = await productFactoryContract.getProductCount();
        console.log('Product count:', productCount);
        
        const fetchedListings: Listing[] = [];
        
        // Fetch each product
        for (let i = 0; i < productCount; i++) {
          try {
            // Get product address from allProducts
            const productAddress = await productFactoryContract.allProducts(i);
            console.log(`Product ${i} address:`, productAddress);
            
            // Try to get additional product details
            let ipfsHash = "";
            let category = "Other";
            let title = `Product #${i}`;
            let description = `Product at address: ${productAddress.slice(0, 6)}...${productAddress.slice(-4)}`;
            let price = "TBD C2FLR";
            
            try {
              // Try calling the smart contract directly at productAddress to get details
              // Create a minimal Product contract interface to access fields
              const ProductABI = [
                "function name() view returns (string)",
                "function category() view returns (string)",
                "function description() view returns (string)",
                "function ipfsId() view returns (string)",
                "function price() view returns (uint256)"
              ];
              
              const provider = new ethers.BrowserProvider(window.ethereum);
              const signer = await provider.getSigner();
              const productContract = new ethers.Contract(productAddress, ProductABI, signer);
              
              // Get product details directly from product contract
              const [productName, productCategory, productDescription, productIpfsId, productPrice] = await Promise.all([
                productContract.name().catch(() => ""),
                productContract.category().catch(() => "Other"),
                productContract.description().catch(() => ""),
                productContract.ipfsId().catch(() => ""),
                productContract.price().catch(() => "0")
              ]);
              
              title = productName || title;
              category = productCategory || category;
              description = productDescription || description;
              ipfsHash = productIpfsId || ipfsHash;
              
              if (productPrice && productPrice !== "0") {
                price = `${ethers.formatEther(productPrice)} C2FLR`;
              }
              
              console.log(`Product ${i} details from contract:`, {
                name: productName,
                category: productCategory,
                description: productDescription,
                ipfsId: productIpfsId,
                price: productPrice.toString()
              });
            } catch (detailsErr) {
              console.log(`Could not get details for product ${i} from contract:`, detailsErr);
              
              // Fallback to getProductDetails if available
              try {
                const details = await productFactoryContract.getProductDetails(i);
                if (details) {
                  ipfsHash = details.ipfsId || details.ipfsHash || details[0] || "";
                  category = details.category || details[1] || "Other";
                  title = details.name || details.title || details[2] || `Product #${i}`;
                  description = details.description || details[3] || description;
                  
                  if (details.price || details[4]) {
                    const rawPrice = details.price || details[4] || 0;
                    price = `${ethers.formatEther(rawPrice.toString())} C2FLR`;
                  }
                }
              } catch (factoryErr) {
                console.log(`Could not get details from factory for product ${i}:`, factoryErr);
              }
            }
            
            // Format the product address for display
            const formattedProductAddress = `${productAddress.slice(0, 6)}...${productAddress.slice(-4)}`;
            
            fetchedListings.push({
              id: i,
              title: title,
              price: price,
              description: description,
              seller: formattedProductAddress,
              createdAt: "Recently added",
              category: category,
              ipfsHash: ipfsHash
            });
          } catch (err) {
            console.error(`Error fetching product ${i}:`, err);
            // Continue with other products even if one fails
          }
        }
        
        setListings(fetchedListings);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load listings from blockchain');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchListings();
  }, [productFactoryContract]);
  
  // Filter and sort listings
  const filteredListings = listings.filter(listing => 
    !selectedCategory || listing.category?.toLowerCase() === selectedCategory.toLowerCase()
  );
  
  // Sort listings based on selected option
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortOption === 'price-low') {
      return parseFloat(a.price) - parseFloat(b.price);
    } else if (sortOption === 'price-high') {
      return parseFloat(b.price) - parseFloat(a.price);
    }
    // Default: sort by most recent (id in descending order)
    return b.id - a.id;
  });
  
  // Featured listings (first 3 or all if less than 3)
  const featuredListings = sortedListings.slice(0, Math.min(3, sortedListings.length));
  
  // Recent listings (all)
  const recentListings = sortedListings;
  
  // Available categories
  const categories = Object.values(CATEGORY_NAMES);

  // Options for selects
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'rental', label: 'Rental' },
    { value: 'employment', label: 'Employment' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'real-estate', label: 'Real Estate' }
  ];
  
  const sortOptions = [
    { value: '', label: 'Sort By: Latest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' }
  ];

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Marketplace" 
        description="Discover and purchase legally verified agreements"
      />

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg p-4 mb-4">
          {error}
        </div>
      )}

      {/* Featured Listings */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Featured Agreements</h2>
          <Button href="/dashboard/create-listing">
            Create Listing
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-white/70">Loading listings from blockchain...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg p-4">
            {error}
          </div>
        ) : featuredListings.length === 0 ? (
          <div className="bg-blue-900/20 border border-blue-500/30 text-blue-400 rounded-lg p-4 text-center">
            <p>No listings found. Be the first to create a listing!</p>
            <Button href="/dashboard/create-listing" variant="outline" className="mt-4">
              Create Listing
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredListings.map(listing => (
              <ListingCard 
                key={listing.id} 
                listing={listing} 
                showCategory
              />
            ))}
          </div>
        )}
      </section>

      {/* Browse Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(CATEGORY_NAMES).map(([key, displayName]) => (
            <CategoryCard 
              key={key} 
              category={displayName} 
              onClick={() => setSelectedCategory(key)}
            />
          ))}
        </div>
      </section>

      {/* Recent Listings */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">All Listings</h2>
          <div className="flex gap-4">
            <Select 
              options={categoryOptions} 
              className="py-2 px-4 text-sm"
              value={selectedCategory}
              onChange={handleCategoryChange}
            />
            <Select 
              options={sortOptions}
              className="py-2 px-4 text-sm"
              value={sortOption}
              onChange={handleSortChange}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-white/70">Loading listings from blockchain...</p>
          </div>
        ) : recentListings.length === 0 ? (
          <div className="bg-blue-900/20 border border-blue-500/30 text-blue-400 rounded-lg p-4 text-center">
            <p>No listings found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
} 