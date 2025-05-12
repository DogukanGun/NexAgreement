import { VerificationFlow } from './verification';

/**
 * Creates a reactive agent that can process transaction hashes, fill agreements, and upload them to IPFS
 * @param txHash - The transaction hash to process
 * @param apiKey - OpenAI API key
 * @param providerUrl - Ethereum provider URL
 * @returns The URL to the IPFS-stored agreement
 */
export async function processTransactionAndGenerateAgreement(
  txHash: string,
  apiKey: string,
  providerUrl: string
): Promise<string> {
  try {
    // Create verification flow
    const verificationFlow = new VerificationFlow(apiKey, providerUrl);
    
    // Execute verification flow
    const verificationResult = await verificationFlow.verify(txHash);
    
    if (verificationResult.verificationStatus !== 'completed') {
      throw new Error(verificationResult.verificationSteps.join('\n'));
    }

    return verificationResult.agreementData.ipfsUrl;
  } catch (error) {
    console.error('Error in processTransactionAndGenerateAgreement:', error);
    throw error;
  }
}
