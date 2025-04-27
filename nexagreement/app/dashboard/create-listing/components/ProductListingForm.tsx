'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { connectWallet, createProduct } from '@/app/utils/blockchain';
import { WalletConnection } from '@/app/utils/types';
import { FileUploader } from './FileUploader';

export default function ProductListingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [wallet, setWallet] = useState<WalletConnection>({
    connected: false,
    account: null,
  });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    royaltyPercentage: 5, // Default 5%
    imageUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileUploaded = (url: string) => {
    setFormData({
      ...formData,
      imageUrl: url,
    });
  };
  
  const handleConnectWallet = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const walletConnection = await connectWallet();
      setWallet(walletConnection);
      
      if (!walletConnection.connected && walletConnection.error) {
        setError(walletConnection.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!wallet.connected || !wallet.signer) {
        throw new Error('Please connect your wallet first');
      }
      
      if (!formData.name || !formData.description || !formData.price || !formData.imageUrl) {
        throw new Error('Please fill in all required fields');
      }
      
      // Create metadata for the NFT
      const metadata = {
        name: formData.name,
        description: formData.description,
        image: formData.imageUrl,
      };
      
      // In a real app, we would upload this metadata to IPFS
      // For this example, we'll just use a placeholder URI
      const tokenURI = `ipfs://placeholder/${formData.name.replace(/\s+/g, '-').toLowerCase()}`;
      
      const result = await createProduct(
        formData.name,
        formData.description,
        formData.price,
        formData.royaltyPercentage,
        tokenURI,
        wallet.signer
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create product');
      }
      
      setSuccess(true);
      
      // Redirect to product page after a short delay
      setTimeout(() => {
        router.push(`/dashboard/product/${result.productAddress}`);
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating product listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
      <h1 className="text-2xl font-semibold mb-6">Create New Product Listing</h1>
      
      {!wallet.connected ? (
        <div className="mb-6">
          <button
            onClick={handleConnectWallet}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
      ) : (
        <div className="mb-6 bg-green-50 p-3 rounded-md">
          <p className="text-green-800">
            Connected: <span className="font-mono">{wallet.account?.substring(0, 6)}...{wallet.account?.substring(wallet.account.length - 4)}</span>
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
            required
          />
        </div>
        
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price (ETH) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.001"
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="flex-1">
            <label htmlFor="royaltyPercentage" className="block text-sm font-medium text-gray-700 mb-1">
              Royalty Percentage
            </label>
            <select
              id="royaltyPercentage"
              name="royaltyPercentage"
              value={formData.royaltyPercentage}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0">0%</option>
              <option value="2.5">2.5%</option>
              <option value="5">5%</option>
              <option value="7.5">7.5%</option>
              <option value="10">10%</option>
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Image *
          </label>
          <FileUploader name="productImage" onFileUploaded={handleFileUploaded} />
          {formData.imageUrl && (
            <div className="mt-2 relative w-full h-48 rounded-md overflow-hidden">
              <img 
                src={formData.imageUrl} 
                alt="Product preview" 
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading || !wallet.connected || !formData.imageUrl}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Listing'}
        </button>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
            Product listing created successfully! Redirecting...
          </div>
        )}
      </form>
    </div>
  );
} 