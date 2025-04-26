'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { useBlockchain } from '@/app/providers/BlockchainProvider';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { ipfsToHttp } from '@/app/utils/ipfs';
import Link from 'next/link';
import prodcutAbi from "@/public/product.abi.json"
// Category mapping (numeric ID to string name)
const CATEGORY_NAMES: Record<number, string> = {
  0: 'Commercial',
  1: 'Rental',
  2: 'Employment',
  3: 'Partnership',
  4: 'Real Estate'
};

interface ProductDetails {
  id: number;
  title: string;
  description: string;
  price: string;
  seller: string;
  category: string;
  imageUrl: string;
  agreementUrl: string;
  hasAgreement: boolean;
  isSold: boolean;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = parseInt(params.id as string);
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { productFactoryContract, isLoading: isContractLoading } = useBlockchain();
  const [httpImageUrl, setHttpImageUrl] = useState<string>('');
  const [httpAgreementUrl, setHttpAgreementUrl] = useState<string>('');
  const [isGeneratingAgreement, setIsGeneratingAgreement] = useState(false);
  const [agreementGenerationError, setAgreementGenerationError] = useState<string | null>(null);
  const [signatureStatus, setSignatureStatus] = useState<{ 
    senderVerified: boolean; 
    receiverVerified: boolean; 
  } | null>(null);
  const [isCurrentUserSeller, setIsCurrentUserSeller] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [purchaseTxHash, setPurchaseTxHash] = useState('');
  const [buyerSignature, setBuyerSignature] = useState('');

  useEffect(() => {
    async function fetchProductDetails() {
      if (!productFactoryContract) return;

      try {
        setIsLoading(true);
        setError(null);

        // Get product address from factory
        const productAddress = await productFactoryContract.allProducts(productId);
        
        // Create a minimal Product contract interface
        const ProductABI = [
          "function name() view returns (string)",
          "function description() view returns (string)",
          "function price() view returns (uint256)",
          "function seller() view returns (address)",
          "function category() view returns (string)",
          "function imageUrl() view returns (string)",
          "function agreementUrl() view returns (string)",
          "function hasAgreement() view returns (bool)",
          "function isSold() view returns (bool)"
        ];

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const productContract = new ethers.Contract(productAddress, ProductABI, signer);

        // Fetch all product details
        const [
          name,
          description,
          price,
          seller,
          category,
          imageUrl,
          agreementUrl,
          hasAgreement,
          isSold
        ] = await Promise.all([
          productContract.name(),
          productContract.description(),
          productContract.price(),
          productContract.seller(),
          productContract.category(),
          productContract.imageUrl(),
          productContract.agreementUrl(),
          productContract.hasAgreement(),
          productContract.isSold()
        ]);

        // Convert IPFS URLs to HTTP URLs
        const [httpImage, httpAgreement] = await Promise.all([
          ipfsToHttp(imageUrl),
          hasAgreement ? ipfsToHttp(agreementUrl) : Promise.resolve('')
        ]);

        setHttpImageUrl(httpImage);
        setHttpAgreementUrl(httpAgreement);

        setProduct({
          id: productId,
          title: name,
          description,
          price: ethers.formatEther(price),
          seller,
          category,
          imageUrl,
          agreementUrl,
          hasAgreement,
          isSold
        });

        // Check if current user is the seller
        const currentAddress = await signer.getAddress();
        setIsCurrentUserSeller(currentAddress.toLowerCase() === seller.toLowerCase());
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProductDetails();
  }, [productId, productFactoryContract]);

  const handlePurchase = async () => {
    if (!productFactoryContract || !product) return;

    try {
      setIsPurchasing(true);
      setError(null);
      setAgreementGenerationError(null);

      // Get product address
      const productAddress = await productFactoryContract.allProducts(productId);
      
      // Create product contract instance
      const ProductABI = [
        "function purchase(bytes memory) payable",
        "function price() view returns (uint256)",
        "function seller() view returns (address)",
        "function hasAgreement() view returns (bool)",
        "function updateAgreementAfterPurchase(string memory) external"
      ];
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const productContract = new ethers.Contract(productAddress, ProductABI, signer);

      // Get current price and seller
      const [price, seller] = await Promise.all([
        productContract.price(),
        productContract.seller()
      ]);

      const buyerAddress = await signer.getAddress();

      // Create message for buyer to sign
      const buyerMessage = `I agree to purchase "${product.title}" for ${ethers.formatEther(price)} C2FLR`;
      console.log("Buyer message to sign:", buyerMessage);
      
      // Get signature from buyer
      const buyerSignature = await signer.signMessage(buyerMessage);
      console.log("Buyer signature:", buyerSignature);
      
      // Store signature for later use in document generation
      setBuyerSignature(buyerSignature);

      try {
        console.log("Trying to purchase with params:", {
          signature: buyerSignature,
          value: price.toString(),
          from: buyerAddress,
          to: productAddress
        });
        
        // Send purchase transaction with signature
        const tx = await productContract.purchase(buyerSignature, { 
          value: price,
          gasLimit: 300000 // Set explicit gas limit to avoid estimation issues
        });
        
        console.log("Purchase transaction sent:", tx.hash);
        setPurchaseTxHash(tx.hash);
        
        const receipt = await tx.wait();
        console.log("Purchase receipt:", receipt);
        
        // Call the process-transaction API with the transaction hash
        try {
          toast.loading('Generating agreement document with AI...');
          const agentResponse = await fetch('/api/process-transaction', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ txHash: tx.hash }),
          });
          
          if (!agentResponse.ok) {
            throw new Error('Failed to process transaction with AI agent');
          }
          
          const { ipfsUrl } = await agentResponse.json();
          
          // Explicitly update UI state
          setPurchaseComplete(true);
          
          if (ipfsUrl) {
            // Convert IPFS URL to HTTP URL
            const httpUrl = await ipfsToHttp(ipfsUrl);
            
            // Update all relevant state
            setProduct(prev => prev ? { 
              ...prev, 
              hasAgreement: true, 
              agreementUrl: ipfsUrl,
              isSold: true
            } : null);
            
            setHttpAgreementUrl(httpUrl);
            setSignatureStatus({
              senderVerified: true,
              receiverVerified: true
            });
            
            // Hide the manual generation button since we succeeded
            setPurchaseComplete(false);
          }
          
          toast.dismiss();
          toast.success('Agreement document generated automatically!');
        } catch (agentError) {
          console.error('Error calling AI agent:', agentError);
          // We'll still set purchaseComplete to show manual button as fallback
          setPurchaseComplete(true);
          toast.error('Auto-generation failed. Please use manual generation.');
        }
      } catch (purchaseError: any) {
        console.error('Purchase transaction failed:', purchaseError);
        
        // Try to extract more specific error information
        const errorMessage = purchaseError.message || '';
        if (errorMessage.includes('Agreement not uploaded')) {
          setError('The product agreement has not been uploaded by the seller yet.');
        } else if (errorMessage.includes('Invalid buyer signature')) {
          setError('Your signature is invalid. Please try again.');
        } else if (errorMessage.includes('user rejected')) {
          setError('Transaction was rejected in your wallet.');
        } else {
          setError(`Transaction failed: ${errorMessage.substring(0, 100)}${errorMessage.length > 100 ? '...' : ''}`);
        }
      }
    } catch (err: any) {
      console.error('Error in purchase process:', err);
      setError(err.message || 'Failed to complete purchase process');
    } finally {
      setIsPurchasing(false);
    }
  };
  
  const handleGenerateAgreement = async () => {
    if (!productFactoryContract || !product) return;
    
    try {
      setIsGeneratingAgreement(true);
      setAgreementGenerationError(null);
      
      // Get product address and create contract instance
      const productAddress = await productFactoryContract.allProducts(productId);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const productContract = new ethers.Contract(productAddress, prodcutAbi.abi, signer);
      
      const response = await fetch('/api/agreement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productDetails: {
            title: product.title,
            price: product.price,
            description: product.description,
            category: product.category
          },
          senderSignature: "",
          receiverSignature: buyerSignature,
          senderAddress: product.seller,
          receiverAddress: await signer.getAddress(),
          transactionHash: purchaseTxHash
        }),
      });
      
      const data = await response.json();
      
      if (!data.success || !data.agreementUrl) {
        throw new Error('Failed to generate agreement');
      }

      // Update contract
      const updateTx = await productContract.updateAgreementAfterPurchase(data.agreementUrl);
      await updateTx.wait();

      // Update UI state
      setProduct(prev => prev ? { 
        ...prev, 
        hasAgreement: true, 
        agreementUrl: data.agreementUrl 
      } : null);
      
      setHttpAgreementUrl(await ipfsToHttp(data.agreementUrl));
      setSignatureStatus(data.signatureStatus);
      setPurchaseComplete(false);
      
      toast.success('Agreement generated successfully!');
    } catch (err) {
      console.error('Error generating agreement:', err);
      setAgreementGenerationError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsGeneratingAgreement(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-white/70">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg p-4 text-center">
          {error || 'Product not found'}
        </div>
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
        description={product.category}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <Card variant="default">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            <Image
              src={httpImageUrl}
              alt={product.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </Card>

        {/* Product Details */}
        <Card variant="default">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{product.title}</h2>
              <p className="text-white/70">{product.description}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/70">Price:</span>
                <span className="text-white font-bold">{product.price} C2FLR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Category:</span>
                <span className="text-white">{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Seller:</span>
                <span className="text-white font-mono">
                  {product.seller.slice(0, 6)}...{product.seller.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Status:</span>
                <span className={`font-bold ${product.isSold ? 'text-red-400' : 'text-green-400'}`}>
                  {product.isSold ? 'Sold' : 'Available'}
                </span>
              </div>
            </div>

            {product.hasAgreement && httpAgreementUrl && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Agreement Document</h3>
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Agreement has been generated and stored on IPFS</span>
                  </div>
                  
                  {signatureStatus && (
                    <div className="mb-4 p-4 bg-gray-800 rounded-lg">
                      <h4 className="font-semibold mb-2">Signature Verification</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <span className={signatureStatus.senderVerified ? "text-green-500" : "text-yellow-500"}>
                            {signatureStatus.senderVerified ? "✓" : "⚠️"}
                          </span>
                          <span>Seller Signature: {signatureStatus.senderVerified ? "Verified" : "Not Verified"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={signatureStatus.receiverVerified ? "text-green-500" : "text-yellow-500"}>
                            {signatureStatus.receiverVerified ? "✓" : "⚠️"}
                          </span>
                          <span>Buyer Signature: {signatureStatus.receiverVerified ? "Verified" : "Not Verified"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-4">
                    {/* View button */}
                    <a 
                      href={httpAgreementUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 text-blue-400 hover:underline"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Agreement
                    </a>

                    {/* Download button */}
                    <a 
                      href={httpAgreementUrl}
                      download={`agreement_${product.title.replace(/\s+/g, '_')}.pdf`}
                      className="inline-flex items-center gap-2 text-green-400 hover:underline"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Agreement
                    </a>
                  </div>
                </Card>
              </div>
            )}

            {!product.isSold && !isCurrentUserSeller && (
              <div className="space-y-4">
                <div className="bg-blue-900/20 border border-blue-500/30 text-blue-400 rounded-lg p-4 mb-4">
                  <p className="font-semibold">Smart Agreement Purchase</p>
                  <p className="text-sm mt-1">
                    First purchase the product, then you'll be able to generate the legally binding agreement document.
                  </p>
                </div>
                <Button
                  onClick={handlePurchase}
                  disabled={isPurchasing || isContractLoading}
                  className="w-full"
                >
                  {isPurchasing ? 'Processing Purchase...' : isContractLoading ? 'Loading...' : 'Purchase Product'}
                </Button>
              </div>
            )}

            {purchaseComplete && !product.hasAgreement && (
              <div className="space-y-4 mt-4">
                <div className="bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg p-4">
                  <p className="font-semibold">Automatic Agreement Generation Failed</p>
                  <p className="text-sm mt-1">The system couldn't automatically generate your agreement.</p>
                  <Button
                    onClick={handleGenerateAgreement}
                    disabled={isGeneratingAgreement}
                    className="mt-2"
                  >
                    Generate Agreement Manually
                  </Button>
                </div>
              </div>
            )}

            {isCurrentUserSeller && !product.isSold && (
              <div className="bg-blue-900/20 border border-blue-500/30 text-blue-400 rounded-lg p-4 mb-4">
                <p className="font-semibold">You are the seller</p>
                <p className="text-sm mt-1">
                  When someone purchases this product, an AI-generated agreement will be automatically created.
                </p>
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