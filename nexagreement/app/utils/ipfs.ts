/**
 * IPFS Utility Functions (Mock Implementation)
 * 
 * This file provides mock implementations of IPFS-related functionality.
 * In production, these would be replaced with actual IPFS interactions.
 */

/**
 * Generates a mock CID (Content Identifier) for IPFS
 * @returns A random string that resembles an IPFS CID
 */
function generateMockCid(): string {
  // Generate a random string that resembles a CIDv1 (base32)
  const chars = 'abcdefghijklmnopqrstuvwxyz234567';
  let cid = 'bafybeie';
  for (let i = 0; i < 46; i++) {
    cid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return cid;
}

/**
 * Mock implementation of uploadToIPFS function
 * @param file The file to upload
 * @returns A mock IPFS URL for the uploaded file
 */
export async function uploadToIPFS(
  file: File
): Promise<string> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock error for very large files to test error handling
  if (file.size > 100 * 1024 * 1024) { // 100MB
    throw new Error('File size too large for mock IPFS upload');
  }
  
  // Generate a mock CID
  const cid = generateMockCid();
  
  // Create a mock IPFS URL
  return cid;
}

/**
 * Converts an IPFS URL to an HTTP URL using a public gateway
 * @param ipfsUrl The IPFS URL to convert
 * @returns The corresponding HTTP URL
 */
export function ipfsToHttp(ipfsUrl: string): string {
  if (!ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl; // Not an IPFS URL, return as is
  }
  
  // Extract the CID and path
  const ipfsPath = ipfsUrl.substring(7); // Remove 'ipfs://'
  
  // Use the Cloudflare IPFS gateway (can be changed to other gateways if needed)
  return `https://cloudflare-ipfs.com/ipfs/${ipfsPath}`;
}

/**
 * Gets the file name from an IPFS URL
 * @param ipfsUrl The IPFS URL to extract filename from
 * @returns The filename or undefined if not present
 */
export function getFilenameFromIpfsUrl(ipfsUrl: string): string | undefined {
  if (!ipfsUrl.startsWith('ipfs://')) {
    return undefined;
  }
  
  const parts = ipfsUrl.split('/');
  if (parts.length > 2) {
    return decodeURIComponent(parts[parts.length - 1]);
  }
  
  return undefined;
}

// This is a mock implementation that will be replaced with a real one later
// For now, it provides the same interface but doesn't actually use IPFS
console.log('[IPFS] Using mock implementation. Replace with real IPFS integration in production.'); 