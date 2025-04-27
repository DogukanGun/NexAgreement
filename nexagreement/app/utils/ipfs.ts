"use server"
/**
 * IPFS Utility Functions (Mock Implementation)
 * 
 * This file provides mock implementations of IPFS-related functionality.
 * In production, these would be replaced with actual IPFS interactions.
 */

import { PinataSDK } from "pinata";

/**
 * Generates a mock CID (Content Identifier) for IPFS
 * @returns A random string that resembles an IPFS CID
 */
async function generateMockCid(): Promise<string> {
  // Generate a random string that resembles a CIDv1 (base32)
  const chars = 'abcdefghijklmnopqrstuvwxyz234567';
  let cid = 'bafybeie';
  for (let i = 0; i < 46; i++) {
    cid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return cid;
}

/**
 * Uploads a file to IPFS using Pinata
 * @param file The file to upload
 * @returns A IPFS URL for the uploaded file
 */
export async function uploadToIPFS(
  file: File
): Promise<string> {
  if (!process.env.PINATA_JWT) {
    throw new Error('PINATA_JWT environment variable is not set');
  }

  if (!process.env.NEXT_PUBLIC_GATEWAY_URL) {
    throw new Error('NEXT_PUBLIC_GATEWAY_URL environment variable is not set');
  }

  const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL
  });

  try {
    const { cid } = await pinata.upload.public.file(file);
    const url = await pinata.gateways.public.convert(cid);
    console.log(url);
    return url;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload file to IPFS');
  }
}

/**
 * Converts an IPFS URL to an HTTP URL using a public gateway
 * @param ipfsUrl The IPFS URL to convert
 * @returns The corresponding HTTP URL
 */
export async function ipfsToHttp(ipfsUrl: string): Promise<string> {
  if (!ipfsUrl) return '';
  return ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
}

/**
 * Gets the file name from an IPFS URL
 * @param ipfsUrl The IPFS URL to extract filename from
 * @returns The filename or undefined if not present
 */
export async function getFilenameFromIpfsUrl(ipfsUrl: string): Promise<string | undefined> {
  if (!ipfsUrl.startsWith('ipfs://')) {
    return undefined;
  }

  const parts = ipfsUrl.split('/');
  if (parts.length > 2) {
    return decodeURIComponent(parts[parts.length - 1]);
  }

  return undefined;
}

/**
 * Converts a base64 string to a File object compatible with Pinata SDK
 */
export async function uploadBase64ToPinata(base64String: string, filename: string): Promise<File> {
  const arr = base64String.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Client-side version of uploadToIPFS that uses fetch to call the API endpoint
 * @param file The file to upload
 * @returns A promise that resolves to the IPFS URL
 */
export async function uploadToIPFSClient(file: File): Promise<string> {
  try {
    // Create a FormData object and append the file
    const formData = new FormData();
    formData.append('file', file);

    // Call your API endpoint that uses the server-side uploadToIPFS function
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload file');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
}
