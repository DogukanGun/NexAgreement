import { TxParserTool } from './tools/txParser';
import { AgreementFillerTool } from './tools/agreementFiller';
import { IpfsUploaderTool } from './tools/ipfsUploader';
import { FlareVerifierTool } from './tools/flareVerifier';

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
    // 1. Parse transaction
    const txParserTool = new TxParserTool(providerUrl);
    const txData = await txParserTool._call(txHash);
    const parsedTx = JSON.parse(txData);
    
    if (!parsedTx.success) {
      throw new Error(parsedTx.error || 'Failed to parse transaction');
    }

    // 2. Verify transaction using Flare Data Connector
    const flareVerifierTool = new FlareVerifierTool();
    const flareData = await flareVerifierTool._call(txHash);
    const flareResult = JSON.parse(flareData);
    
    if (!flareResult.success) {
      console.warn('Flare verification warning:', flareResult.error);
      // Continue without verification - could be configurable to require verification
    }

    // 3. Generate agreement with attestation info if available
    const agreementFillerTool = new AgreementFillerTool();
    const agreementInput = {
      ...parsedTx,
      flareAttestation: flareResult.success ? {
        attestationLink: flareResult.attestationLink,
        roundId: flareResult.roundId
      } : undefined
    };
    
    const agreementData = await agreementFillerTool._call(JSON.stringify(agreementInput));
    const agreement = JSON.parse(agreementData);
    
    if (!agreement.success) {
      throw new Error(agreement.error || 'Failed to generate agreement');
    }

    // 4. Upload to IPFS
    const ipfsUploaderTool = new IpfsUploaderTool();
    const ipfsData = await ipfsUploaderTool._call(JSON.stringify({
      base64: agreement.base64,
      filename: agreement.filename
    }));
    const ipfsResult = JSON.parse(ipfsData);
    
    if (!ipfsResult.success) {
      throw new Error(ipfsResult.error || 'Failed to upload to IPFS');
    }

    return ipfsResult.ipfsUrl;
  } catch (error) {
    console.error('Error in processTransactionAndGenerateAgreement:', error);
    throw error;
  }
}
