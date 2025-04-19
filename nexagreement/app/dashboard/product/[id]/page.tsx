'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useBlockchain } from '@/app/providers/BlockchainProvider';
import { ethers } from 'ethers';
import { ipfsToHttp } from '@/app/utils/ipfs';
import { getExplorerLink, NETWORK_CONFIG } from '@/app/utils/config';
import { Button } from '@/app/components/ui/Button';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Card } from '@/app/components/ui/Card';

// Category mapping (numeric ID to string name)
const CATEGORY_NAMES: Record<number, string> = {
  0: 'Commercial',
  1: 'Rental',
  2: 'Employment',
  3: 'Partnership',
  4: 'Real Estate'
};

interface ProductParams {
  id: string;
}

type ProductDetails = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: string;
  priceInWei: bigint;
  seller: string;
  sellerShort: string;
  contractAddress: string;
  productAddress: string;
  tokenId: number;
  ipfsHash: string;
  isSold: boolean;
};

export default function ProductDetailsPage({ params }: { params: ProductParams }) {
  const productId = parseInt(params.id);
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  
  const { productFactoryContract, isConnected, address } = useBlockchain();

  useEffect(() => {
    async function fetchProduct() {
      if (!productFactoryContract) {
        setIsLoading(false);
        setError("Contract not initialized. Please connect your wallet.");
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get product address from allProducts
        let productAddress;
        try {
          productAddress = await productFactoryContract.allProducts(productId);
          console.log(`Product ${productId} address:`, productAddress);
          
          if (!productAddress || productAddress === "0x0000000000000000000000000000000000000000") {
            setError('Product not found or has been removed');
            return;
          }
        } catch (err) {
          console.error('Error fetching product address:', err);
          setError('Failed to fetch product address');
          return;
        }
        
        // Get the NFT contract address
        let nftContractAddress;
        try {
          nftContractAddress = await productFactoryContract.productNFT();
        } catch (err) {
          console.error('Error fetching NFT contract address:', err);
          nftContractAddress = "0x0000000000000000000000000000000000000000";
        }
        
        // Create a minimal Product contract interface to access fields directly
        const ProductABI = [
          "function name() view returns (string)",
          "function category() view returns (string)",
          "function description() view returns (string)",
          "function ipfsId() view returns (string)",
          "function price() view returns (uint256)",
          "function seller() view returns (address)",
          "function tokenId() view returns (uint256)",
          "function isSold() view returns (bool)"
        ];
        
        // Try to get details directly from product contract
        let title = `Product #${productId}`;
        let description = `This is a product on the blockchain at address ${productAddress}`;
        let categoryName = 'Other';
        let ipfsHash = '';
        let price = 'TBD C2FLR';
        let priceInWei = BigInt(0);
        let sellerAddress = address || "0x0000000000000000000000000000000000000000";
        let productTokenId = productId;
        let soldStatus = false;
        
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const productContract = new ethers.Contract(productAddress, ProductABI, signer);
          
          // Get all product details at once
          const [
            productName,
            productCategory,
            productDescription,
            productIpfsId,
            productPrice,
            productSeller,
            tokenIdFromContract,
            productIsSold
          ] = await Promise.all([
            productContract.name().catch(() => ""),
            productContract.category().catch(() => "Other"),
            productContract.description().catch(() => ""),
            productContract.ipfsId().catch(() => ""),
            productContract.price().catch(() => "0"),
            productContract.seller().catch(() => "0x0000000000000000000000000000000000000000"),
            productContract.tokenId().catch(() => productId),
            productContract.isSold().catch(() => false)
          ]);
          
          console.log('Product details from contract:', {
            name: productName,
            category: productCategory,
            description: productDescription,
            ipfsId: productIpfsId,
            price: productPrice.toString(),
            seller: productSeller,
            tokenId: tokenIdFromContract.toString(),
            isSold: productIsSold
          });
          
          title = productName || title;
          categoryName = productCategory || categoryName;
          description = productDescription || description;
          ipfsHash = productIpfsId || ipfsHash;
          priceInWei = BigInt(productPrice.toString());
          price = `${ethers.formatEther(priceInWei)} C2FLR`;
          sellerAddress = productSeller || sellerAddress;
          productTokenId = Number(tokenIdFromContract) || productTokenId;
          soldStatus = productIsSold;
          
        } catch (contractErr) {
          console.error('Error reading from product contract:', contractErr);
          
          // Fallback to getProductDetails from factory if available
          try {
            const details = await productFactoryContract.getProductDetails(productId);
            if (details) {
              console.log('Product details from factory:', details);
              
              ipfsHash = details.ipfsId || details.ipfsHash || details[0] || '';
              categoryName = details.category || details[1] || 'Other';
              title = details.name || details.title || details[2] || `Product #${productId}`;
              description = details.description || details[3] || description;
              
              if (details.price || details[4]) {
                const rawPrice = details.price || details[4] || 0;
                priceInWei = BigInt(rawPrice.toString());
                price = `${ethers.formatEther(priceInWei)} C2FLR`;
              }
            }
          } catch (factoryErr) {
            console.log('Could not get details from factory:', factoryErr);
            // Continue with basic info
          }
        }
        
        // Format seller address for display
        const sellerShort = sellerAddress ? `${sellerAddress.slice(0, 6)}...${sellerAddress.slice(-4)}` : 'Unknown';
        
        // Set product with all available information
        setProduct({
          id: productId,
          title: title,
          description: description,
          category: categoryName,
          price: price,
          priceInWei: priceInWei,
          seller: sellerAddress,
          sellerShort: sellerShort,
          contractAddress: nftContractAddress,
          productAddress: productAddress,
          tokenId: productTokenId,
          ipfsHash: ipfsHash,
          isSold: soldStatus
        });
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProduct();
  }, [productFactoryContract, productId, address]);

  const handlePurchase = async () => {
    if (!productFactoryContract || !product || !isConnected) {
      setPurchaseError('Please connect your wallet first');
      return;
    }
    
    setPurchaseError('Purchase functionality is not available yet');
    
    // Note: The original contract doesn't have a purchaseProduct function
    // We'd need to implement this based on your contract's actual purchase mechanism
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-white/70">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader 
          title="Error Loading Product" 
          description="There was a problem loading the product details"
        />
        <Card className="p-6 text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="mb-6">{error}</p>
          <Button href="/dashboard/marketplace">
            Return to Marketplace
          </Button>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader 
          title="Product Not Found" 
          description="The product you're looking for doesn't exist or has been removed"
        />
        <Card className="p-6 text-center">
          <Button href="/dashboard/marketplace">
            Browse Marketplace
          </Button>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/dashboard/marketplace" className="text-blue-500 hover:underline">
          ← Back to Marketplace
        </Link>
      </div>
      
      <PageHeader 
        title={product.title} 
        description="Product Details"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <Image
              src="/file.svg"
              alt={product.title}
              width={200}
              height={200}
              className="object-contain"
            />
          </div>
          
          {product.ipfsHash && (
            <div className="p-4 bg-blue-900/20 border border-blue-500/30 text-blue-400 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">Agreement Document</h3>
              <p className="text-sm mb-2">This product is linked to a document on IPFS</p>
              <div>
                <a 
                  href={ipfsToHttp(product.ipfsHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Document on IPFS
                </a>
              </div>
            </div>
          )}
          
          <div className="p-4 bg-blue-900/20 border border-blue-500/30 text-blue-400 rounded-lg">
            <h3 className="font-semibold mb-2">Product Contract Address</h3>
            <p className="font-mono text-sm break-all">{product.productAddress}</p>
            <div className="mt-2">
              <a 
                href={getExplorerLink(product.productAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                View on Block Explorer
              </a>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <span className="inline-block px-2 py-1 bg-blue-900/20 text-blue-400 text-xs rounded mb-2">
                {product.category}
              </span>
              <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
              <p className="text-white/70">
                Created by{" "}
                <a 
                  href={getExplorerLink(product.seller)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {product.sellerShort}
                </a>
              </p>
            </div>
            
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">{product.price}</span>
                {product.isSold && (
                  <span className="bg-red-900/20 text-red-400 px-2 py-1 text-xs rounded-full">
                    Sold
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-white/70">
                {product.description}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Smart Contract Details</h3>
              <div className="bg-blue-900/20 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/70">NFT Contract</span>
                  <a 
                    href={getExplorerLink(product.contractAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-blue-500 hover:underline"
                  >
                    {`${product.contractAddress.slice(0, 6)}...${product.contractAddress.slice(-4)}`}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Token ID</span>
                  <span className="font-mono">#{product.tokenId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Blockchain</span>
                  <span>{NETWORK_CONFIG.chainName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Status</span>
                  <span className={product.isSold ? "text-red-400" : "text-green-400"}>
                    {product.isSold ? "Sold" : "Available"}
                  </span>
                </div>
              </div>
            </div>
            
            {isConnected && !product.isSold && (
              <div className="pt-4">
                {purchaseSuccess ? (
                  <div className="p-4 bg-green-900/20 border border-green-500/30 text-center rounded-lg">
                    <svg className="w-8 h-8 text-green-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <h3 className="text-lg font-semibold text-green-400 mb-1">Purchase Successful!</h3>
                    <p className="text-green-400 mb-4">The agreement has been transferred to your wallet.</p>
                    <Button href="/dashboard/purchases" variant="secondary">
                      View My Purchases
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      className="w-full mb-4" 
                      onClick={handlePurchase}
                      disabled={isPurchasing || !isConnected}
                      isLoading={isPurchasing}
                    >
                      {!isConnected 
                        ? 'Connect Wallet to Purchase' 
                        : isPurchasing 
                          ? 'Processing...' 
                          : 'Purchase Now'
                      }
                    </Button>
                    {purchaseError && (
                      <div className="p-3 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg mb-4">
                        {purchaseError}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            
            {product.isSold && (
              <div className="p-4 bg-red-900/20 border border-red-500/30 text-center rounded-lg">
                <svg className="w-8 h-8 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-red-400 mb-1">Product Already Sold</h3>
                <p className="text-red-400 mb-4">This product has already been purchased.</p>
                <Button href="/dashboard/marketplace" variant="secondary">
                  Browse Marketplace
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      <Card className="mt-8 p-6">
        <h2 className="text-xl font-semibold mb-6">How the Purchase Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-900/20 rounded-full flex items-center justify-center">
              <span className="text-blue-400 font-semibold">1</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Initiate Purchase</h3>
              <p className="text-white/70 text-sm">
                Connect your wallet and confirm the transaction
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-900/20 rounded-full flex items-center justify-center">
              <span className="text-blue-400 font-semibold">2</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Smart Contract Execution</h3>
              <p className="text-white/70 text-sm">
                The contract handles the secure transfer of assets
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-900/20 rounded-full flex items-center justify-center">
              <span className="text-blue-400 font-semibold">3</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Transfer Complete</h3>
              <p className="text-white/70 text-sm">
                Receive your NFT and product ownership rights
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 