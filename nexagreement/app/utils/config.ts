/**
 * Blockchain Configuration
 * Update these values after deployment
 */

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 114, // Flare Coston2 testnet
  chainName: "Flare Coston2",
  nativeCurrency: {
    name: "Coston2 Flare",
    symbol: "C2FLR",
    decimals: 18
  },
  rpcUrls: ["https://coston2-api.flare.network/ext/bc/C/rpc"],
  blockExplorerUrls: ["https://coston2-explorer.flare.network/"]
};

// Contract addresses from deployment
export const CONTRACT_ADDRESSES = {
  productFactory: "0xd24Aa294AC0Cc64670B1350d38D2356D62D9D615", // Deployed on Flare Coston2
  // ProductNFT address is automatically created during ProductFactory deployment
  // It can be accessed via productFactory.productNFT() if needed
};

// Helper to generate explorer links
export function getExplorerLink(address: string, type: 'address' | 'tx' = 'address'): string {
  return `${NETWORK_CONFIG.blockExplorerUrls[0]}/${type}/${address}`;
}

// Helper function to add Flare Coston2 testnet to MetaMask
export async function addFlareNetworkToMetamask() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`, // Convert to hex
          chainName: NETWORK_CONFIG.chainName,
          nativeCurrency: NETWORK_CONFIG.nativeCurrency,
          rpcUrls: NETWORK_CONFIG.rpcUrls,
          blockExplorerUrls: NETWORK_CONFIG.blockExplorerUrls
        },
      ],
    });
    return true;
  } catch (error) {
    console.error('Error adding Flare network to MetaMask:', error);
    throw error;
  }
}

// Helper function to ensure user is on the right network
export async function switchToFlareNetwork() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const chainIdHex = `0x${NETWORK_CONFIG.chainId.toString(16)}`;
  
  try {
    // Try to switch to the chain
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
    return true;
  } catch (switchError: any) {
    // This error code indicates the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        return await addFlareNetworkToMetamask();
      } catch (addError) {
        console.error('Error adding Flare network:', addError);
        throw addError;
      }
    }
    console.error('Error switching to Flare network:', switchError);
    throw switchError;
  }
} 