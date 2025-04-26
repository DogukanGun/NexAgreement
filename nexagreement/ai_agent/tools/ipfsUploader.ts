import { Tool } from "@langchain/core/tools";
import { uploadBase64ToPinata, uploadToIPFS } from "../../app/utils/ipfs";

/**
 * Tool for uploading documents to IPFS
 */
export class IpfsUploaderTool extends Tool {
  name = "ipfsUploader";
  description = `Upload a document to IPFS.
  
  Input:
  {
    "base64": "data:application/pdf;base64,...", // Base64-encoded data URI
    "filename": "agreement.pdf" // Desired filename
  }
  
  Output: IPFS URL of the uploaded document
  `;

  async _call(input: string): Promise<string> {
    try {
      console.log("Uploading document to IPFS:", input);
      const data = JSON.parse(input);
      const { base64, filename } = data;
      
      if (!base64 || !filename) {
        return JSON.stringify({ 
          error: "Missing required data for IPFS upload." 
        });
      }

      if (!base64.startsWith('data:')) {
        return JSON.stringify({ 
          error: "Invalid base64 data URI format." 
        });
      }

      // Convert the base64 string to a File object
      const file = await this.base64ToFile(base64, filename);
      
      // Upload the file to IPFS
      const ipfsUrl = await uploadToIPFS(file);
      
      return JSON.stringify({
        success: true,
        ipfsUrl
      });
    } catch (err) {
      console.error("Error uploading to IPFS:", err);
      return JSON.stringify({ 
        error: "Failed to upload document to IPFS." 
      });
    }
  }

  /**
   * Converts a base64 data URI to a File object
   */
  private async base64ToFile(base64String: string, filename: string): Promise<File> {
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
   * Alternative method that uses the existing utility in ipfs.ts
   */
  private async uploadWithExistingUtil(base64String: string, filename: string): Promise<string> {
    try {
      // Use the existing utility to create a File object
      const file = await uploadBase64ToPinata(base64String, filename);
      
      // Upload the file to IPFS
      return await uploadToIPFS(file);
    } catch (error) {
      console.error("Error using existing IPFS upload utility:", error);
      throw error;
    }
  }
} 