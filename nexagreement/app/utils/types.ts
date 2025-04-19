import { ethers } from 'ethers';

// Wallet connection types
export interface WalletConnection {
  connected: boolean;
  account: string | null;
  provider?: ethers.BrowserProvider;
  signer?: ethers.Signer;
  error?: string;
}

// Product related types
export interface Product {
  address: string;
  name: string;
  description: string;
  price: bigint;
  royaltyPercentage: number;
  seller: string;
  tokenId: number;
  isSold: boolean;
}

// Product creation types
export interface CreateProductParams {
  name: string;
  description: string;
  price: string;
  royaltyPercentage: number;
  tokenURI: string;
}

export interface CreateProductResult {
  success: boolean;
  productAddress?: string;
  tokenId?: number;
  txHash?: string;
  error?: string;
}

// Product purchase types
export interface PurchaseProductResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

// Product listing types
export interface ProductListingResult {
  success: boolean;
  products: string[] | Product[];
  error?: string;
}

// Type to declare window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
} 