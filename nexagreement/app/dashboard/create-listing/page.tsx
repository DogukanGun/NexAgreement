'use client';

import { useState } from 'react';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Button } from '@/app/components/ui/Button';
import { Input, Textarea, Select } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { FileUploader } from './components/FileUploader';
import { ipfsToHttp, uploadToIPFS } from '@/app/utils/ipfs';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useBlockchain } from '@/app/providers/BlockchainProvider';
import { switchToFlareNetwork, NETWORK_CONFIG, addFlareNetworkToMetamask } from '@/app/utils/config';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

export default function CreateListing() {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    description: ''
  });
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [httpImageUrl, setHttpImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [error, setError] = useState('');
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Wagmi hooks for wallet connection
  const { address, isConnected, chainId } = useAccount();
  const { connect, isPending, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  // Get contract from blockchain provider
  const { productFactoryContract, isLoading: isContractLoading } = useBlockchain();
  
  // Check if the user is on the correct network
  const isCorrectNetwork = chainId === NETWORK_CONFIG.chainId;
  
  // Handle network switch
  const handleSwitchNetwork = async () => {
    try {
      setNetworkError(null);
      await switchToFlareNetwork();
    } catch (error) {
      console.error('Failed to switch network:', error);
      setNetworkError('Failed to switch network. Please try manually in MetaMask.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConnectWallet = async () => {
    setError('');
    try {
      
      const connector = connectors.find(c => c.id === 'metaMaskSDK');
      if (connector) {
        connect({ connector });
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet. Please ensure MetaMask is installed and unlocked.');
    }
  };

  const handleFileSelected = async (file: File) => {
    // Check file size (max 1MB)
    const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 1MB limit. Please choose a smaller file.`);
      setSelectedFile(null);
      setImagePreview('');
      return;
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageUrl('');
    setError(''); // Clear any previous errors
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      
      // Compress image before upload if it's an image
      let fileToUpload = selectedFile;
      if (selectedFile.type.startsWith('image/')) {
        fileToUpload = await compressImage(selectedFile);
      }
      
      const url = await uploadToIPFS(fileToUpload);
      console.log('Uploaded to IPFS:', url);
      setImageUrl(url);
      
      const httpUrl = await ipfsToHttp(url);
      console.log('HTTP URL:', httpUrl);
      setHttpImageUrl(httpUrl);
      
      setImagePreview('');
      setSelectedFile(null);
      toast.success('File uploaded successfully!');
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file. Please try again with a smaller file.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add image compression function
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          const MAX_DIMENSION = 1000; // Max width or height
          
          if (width > height && width > MAX_DIMENSION) {
            height = (height * MAX_DIMENSION) / width;
            width = MAX_DIMENSION;
          } else if (height > MAX_DIMENSION) {
            width = (width * MAX_DIMENSION) / height;
            height = MAX_DIMENSION;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Failed to compress image'));
              }
            }, 'image/jpeg', 0.7); // 0.7 quality
          } else {
            reject(new Error('Failed to get canvas context'));
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handleFileUploaded = (url: string) => {
    setImageUrl(url);
    console.log('Image uploaded to IPFS:', url);
    console.log('HTTP gateway URL:', ipfsToHttp(url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl) {
      setError('Please upload an item image first');
      return;
    }

    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!isCorrectNetwork) {
      setError(`Please switch to ${NETWORK_CONFIG.chainName} network first`);
      return;
    }

    if (!productFactoryContract) {
      setError('Contract not initialized. Please try again.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Validate price as a valid number
      if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
        throw new Error('Please enter a valid price');
      }

      const priceInWei = ethers.parseEther(formData.price);
      
      // Create message for seller to sign
      const message = `I agree to list "${formData.title}" for sale at ${formData.price} C2FLR`;
      
      // Get signature from seller
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);
      
      // Map string category to numeric category ID
      const categoryMap: Record<string, string> = {
        'commercial': "0",
        'rental': "1",
        'employment': "2",
        'partnership': "3",
        'real-estate': "4"
      };
      
      // Create listing on blockchain using the product factory contract
      const tx = await productFactoryContract.createProduct(
        formData.title,
        formData.description,
        priceInWei,
        1, // royaltyPercentage (1%)
        "", // tokenURI (empty for now)
        formData.category,
        imageUrl, // IPFS URL of the image
        signature // Seller's signature
      );
      
      console.log('Transaction sent:', tx.hash);
      setTransactionHash(tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      // Reset form after successful submission
      setFormData({
        title: '',
        category: '',
        price: '',
        description: ''
      });
      setImageUrl('');
      setHttpImageUrl('');
    } catch (err: any) {
      console.error('Error creating listing:', err);
      setError(err.message || 'Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const categoryOptions = [
    { value: '', label: 'Select a category' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'rental', label: 'Rental' },
    { value: 'employment', label: 'Employment' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'real-estate', label: 'Real Estate' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Create New Listing" 
        description="List your item on the blockchain marketplace"
      />

      <Card variant="default" className="max-w-3xl mx-auto">
        {!isConnected ? (
          <div className="p-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Connect Your Wallet</h3>
            <p className="text-white/70 mb-2">
              To create a listing, you need to connect your wallet to the Flare Coston2 testnet.
            </p>
            <p className="text-white/70 mb-6">
              <span className="text-yellow-400">Important:</span> This application uses the Flare Coston2 testnet (Chain ID: 114).
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
              <Button
                onClick={handleConnectWallet}
                disabled={isPending}
                variant="primary"
                className="inline-flex items-center"
              >
                {isPending ? 'Connecting...' : 'Connect MetaMask'}
                {!isPending && (
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await addFlareNetworkToMetamask();
                    alert('Flare Coston2 testnet added to MetaMask!');
                  } catch (err) {
                    console.error('Failed to add network:', err);
                    setError('Failed to add Flare network. Please add it manually in MetaMask.');
                  }
                }}
                variant="outline"
                className="inline-flex items-center"
              >
                Add Flare Network to MetaMask
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg">
                {error}
              </div>
            )}
            <p className="text-white/50 text-sm mt-4">
              Don't have C2FLR tokens? Get them from the <a href="https://faucet.towolabs.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Flare Coston2 Faucet</a>
            </p>
          </div>
        ) : !isCorrectNetwork ? (
          <div className="p-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Switch to Flare Coston2 Network</h3>
            <p className="text-white/70 mb-4">
              You're currently connected to the wrong network. This app runs on the Flare Coston2 testnet (Chain ID: 114).
            </p>
            <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 text-blue-400 rounded-lg text-left">
              <h4 className="font-semibold mb-1">Flare Coston2 Testnet Details:</h4>
              <ul className="text-sm space-y-1">
                <li>• <span className="text-white/70">Network Name:</span> {NETWORK_CONFIG.chainName}</li>
                <li>• <span className="text-white/70">Chain ID:</span> {NETWORK_CONFIG.chainId}</li>
                <li>• <span className="text-white/70">Currency:</span> {NETWORK_CONFIG.nativeCurrency.symbol}</li>
                <li>• <span className="text-white/70">RPC URL:</span> {NETWORK_CONFIG.rpcUrls[0]}</li>
              </ul>
            </div>
            {networkError && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg">
                {networkError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleSwitchNetwork}
                variant="primary"
              >
                Switch to Flare Coston2
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await addFlareNetworkToMetamask();
                    alert('Flare Coston2 testnet added to MetaMask!');
                  } catch (err) {
                    console.error('Failed to add network:', err);
                    setNetworkError('Failed to add Flare network. Please add it manually in MetaMask.');
                  }
                }}
                variant="secondary"
              >
                Add Flare Network
              </Button>
              <Button
                onClick={() => disconnect()}
                variant="outline"
              >
                Disconnect
              </Button>
            </div>
            <p className="text-white/50 text-sm mt-4">
              Need C2FLR tokens? Visit the <a href="https://faucet.towolabs.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Flare Coston2 Faucet</a>
            </p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between rounded-t-lg">
              <div>
                <span className="text-sm font-medium text-white/70">Connected Wallet:</span>
                <span className="ml-2 text-sm text-white font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => disconnect()}
                className="text-sm py-1 px-3"
              >
                Disconnect
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg">
                  {error}
                </div>
              )}
              
              {transactionHash && (
                <div className="p-3 border border-green-500/30 bg-green-500/10 text-green-400 rounded-lg">
                  <p className="font-bold">Listing created successfully!</p>
                  <p className="text-sm mt-1">
                    Transaction Hash: 
                    <a 
                      href={`${NETWORK_CONFIG.blockExplorerUrls[0]}/tx/${transactionHash}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-mono ml-1 underline"
                    >
                      {transactionHash.slice(0, 10)}...{transactionHash.slice(-6)}
                    </a>
                  </p>
                  {imageUrl && (
                    <p className="text-sm mt-1">
                      Item Image: 
                      <a 
                        href={""} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-mono ml-1 underline"
                      >
                        View on IPFS
                      </a>
                    </p>
                  )}
                </div>
              )}

              <Input
                label="Item Title"
                id="title"
                name="title"
                placeholder="e.g. Premium Digital Art"
                required
                value={formData.title}
                onChange={handleChange}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Category"
                  id="category"
                  name="category"
                  required
                  options={categoryOptions}
                  value={formData.category}
                  onChange={handleChange}
                />
                
                <Input
                  label="Price (ETH)"
                  id="price"
                  name="price"
                  placeholder="e.g. 0.05"
                  required
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>

              <Textarea
                label="Description"
                id="description"
                name="description"
                rows={4}
                placeholder="Provide a detailed description of your item..."
                required
                value={formData.description}
                onChange={handleChange}
              />

              <FileUploader 
                onFileSelected={handleFileSelected}
                onFileUploaded={handleFileUploaded}
                acceptedFileTypes="image/*"
                maxSizeMB={1}
                name="Item Image"
              />

              {imagePreview && !imageUrl && (
                <div className="space-y-4">
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setImagePreview('');
                        setSelectedFile(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleConfirmUpload}>
                      Confirm & Upload
                    </Button>
                  </div>
                </div>
              )}

              {imageUrl && httpImageUrl && (
                <div className="space-y-4">
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                    <Image
                      src={httpImageUrl}
                      alt="Uploaded image"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Image URL:</p>
                    <p className="mt-1 break-all font-mono text-sm">{httpImageUrl}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-end">
                <Button 
                  href="/dashboard/marketplace" 
                  variant="outline"
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting || !imageUrl || isContractLoading}
                >
                  {isSubmitting ? 'Creating Listing...' : isContractLoading ? 'Loading Contract...' : 'Create Listing'}
                </Button>
              </div>
            </form>
          </>
        )}
      </Card>
    </div>
  );
} 