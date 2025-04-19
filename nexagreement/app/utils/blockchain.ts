import { ethers } from 'ethers';
import ProductFactoryABI from '../contracts/ProductFactory.json';
import ProductABI from '../contracts/Product.json';
import ProductNFTABI from '../contracts/ProductNFT.json';
import { WalletConnection } from './types';
import { CONTRACT_ADDRESSES, switchToFlareNetwork } from './config';

// Contract addresses from config
const PRODUCT_FACTORY_ADDRESS = CONTRACT_ADDRESSES.productFactory;

export async function connectWallet(): Promise<WalletConnection> {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // First ensure we're on the Flare network
      await switchToFlareNetwork();
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      return { 
        connected: true, 
        account: accounts[0],
        provider,
        signer
      };
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      return { 
        connected: false, 
        account: null,
        error: 'Error connecting to wallet'
      };
    }
  } else {
    return { 
      connected: false, 
      account: null,
      error: 'No Ethereum browser extension detected'
    };
  }
}

export async function getProductFactoryContract(signer: ethers.Signer | null = null) {
  if (typeof window !== 'undefined' && window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    if (signer) {
      return new ethers.Contract(PRODUCT_FACTORY_ADDRESS, ProductFactoryABI.abi, signer);
    } else {
      const defaultSigner = await provider.getSigner();
      return new ethers.Contract(PRODUCT_FACTORY_ADDRESS, ProductFactoryABI.abi, defaultSigner);
    }
  }
  return null;
}

export async function getProductContract(address: string, signer: ethers.Signer | null = null) {
  if (typeof window !== 'undefined' && window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    if (signer) {
      return new ethers.Contract(address, ProductABI.abi, signer);
    } else {
      const defaultSigner = await provider.getSigner();
      return new ethers.Contract(address, ProductABI.abi, defaultSigner);
    }
  }
  return null;
}

export async function getNFTContract(address: string, signer: ethers.Signer | null = null) {
  if (typeof window !== 'undefined' && window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    if (signer) {
      return new ethers.Contract(address, ProductNFTABI.abi, signer);
    } else {
      const defaultSigner = await provider.getSigner();
      return new ethers.Contract(address, ProductNFTABI.abi, defaultSigner);
    }
  }
  return null;
}

export async function createProduct(
  name: string,
  description: string,
  price: string,
  royaltyPercentage: number,
  tokenURI: string,
  signer: ethers.Signer
) {
  try {
    const factory = await getProductFactoryContract(signer);
    if (!factory) throw new Error('Could not connect to factory contract');

    // Convert price from ETH to wei
    const priceInWei = ethers.parseEther(price);
    
    // Create product
    const tx = await factory.createProduct(
      name,
      description,
      priceInWei,
      royaltyPercentage * 100, // Convert 5% to 500 basis points
      tokenURI
    );
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Get product address and token ID from event logs
    const event = receipt.logs.find(
      (log: any) => log.fragment && log.fragment.name === 'ProductCreated'
    );
    
    if (!event) throw new Error('Product creation event not found');
    
    const productAddress = event.args[0];
    const tokenId = event.args[4];
    
    return {
      success: true,
      productAddress,
      tokenId,
      txHash: receipt.hash
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getAllProducts(offset = 0, limit = 10) {
  try {
    const factory = await getProductFactoryContract();
    if (!factory) throw new Error('Could not connect to factory contract');
    
    const products = await factory.getProducts(offset, limit);
    
    return {
      success: true,
      products
    };
  } catch (error) {
    console.error('Error getting products:', error);
    return {
      success: false,
      products: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getProductsByAddress(sellerAddress: string) {
  try {
    const factory = await getProductFactoryContract();
    if (!factory) throw new Error('Could not connect to factory contract');
    
    const products = await factory.getProductsBySeller(sellerAddress);
    
    return {
      success: true,
      products
    };
  } catch (error) {
    console.error('Error getting products by seller:', error);
    return {
      success: false,
      products: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function purchaseProduct(productAddress: string, price: string, signer: ethers.Signer) {
  try {
    const product = await getProductContract(productAddress, signer);
    if (!product) throw new Error('Could not connect to product contract');
    
    // Convert price from ETH to wei
    const priceInWei = ethers.parseEther(price);
    
    // Purchase product
    const tx = await product.purchase({ value: priceInWei });
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: receipt.hash
    };
  } catch (error) {
    console.error('Error purchasing product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 