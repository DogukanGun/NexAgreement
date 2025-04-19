import { BrowserProvider, Contract, ethers } from 'ethers';
// Import from our IPFS utility file instead
import { uploadToIPFS as uploadFileToIPFS } from './ipfs';

// Mock ABI for the NexAgreement contract
// In a real app, you would import the actual ABI from a JSON file
const CONTRACT_ABI = [
  "function createListing(string memory title, string memory description, string memory category, uint256 price, string memory fileUrl) public returns (uint256)",
  "function getListing(uint256 id) public view returns (string memory, string memory, string memory, uint256, string memory, address)"
];

// Contract address - this would be the actual deployed contract address
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

// Connect to MetaMask wallet
export async function connectWallet() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error("MetaMask is not installed or not accessible");
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    return { provider, signer, address };
  } catch (error) {
    console.error("Error connecting to wallet:", error);
    throw error;
  }
}

// Create a contract instance
export function getContract(signer: ethers.Signer) {
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

// Create a new listing on the blockchain
export async function createBlockchainListing(
  signer: ethers.Signer,
  title: string,
  description: string,
  category: string,
  price: string,
  fileUrl: string
) {
  try {
    const contract = getContract(signer);
    const priceInWei = ethers.parseEther(price);
    
    const tx = await contract.createListing(
      title,
      description,
      category,
      priceInWei,
      fileUrl
    );
    
    return await tx.wait();
  } catch (error) {
    console.error("Error creating listing:", error);
    throw error;
  }
}

// Re-export the uploadToIPFS function from our IPFS utility
export const uploadToIPFS = uploadFileToIPFS;

// Add this to your window types
declare global {
  interface Window {
    ethereum?: any;
  }
} 