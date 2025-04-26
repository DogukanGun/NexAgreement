import axios from 'axios';


interface AttestationRequestResponse {
  status: string;
  abiEncodedRequest: string;
}

interface SubmitAttestationResponse {
  votingRound: string;
}

export class FlareVerifierTool {
  private verifierBaseUrl: string;

  constructor() {
    // Using testnet URLs by default - should be configurable in production
    this.verifierBaseUrl = "https://fdc-verifiers-testnet.flare.network/";
  }

  /**
   * Verifies a transaction using Flare Data Connector
   * @param txHash - The transaction hash to verify
   * @returns Attestation details including link and round ID
   */
  async _call(txHash: string): Promise<string> {
    try {
      // 1. Prepare attestation request
      const attestationRequest = await this.prepareRequest(txHash);
      if (!attestationRequest.abiEncodedRequest) {
        return JSON.stringify({
          success: false,
          error: "Failed to prepare attestation request"
        });
      }

      // 2. Submit attestation request
      const roundId = await this.submitRequest(attestationRequest.abiEncodedRequest);
      if (!roundId) {
        return JSON.stringify({
          success: false,
          error: "Failed to submit attestation request"
        });
      }

      // 3. Wait for attestation round to finalize (simplified for demo)
      await this.waitForRoundFinalization(roundId);

      // 4. Create attestation verification link
      const attestationLink = `https://fdc-explorer-testnet.flare.network/rounds/${roundId}`;

      return JSON.stringify({
        success: true,
        attestationLink,
        roundId
      });
    } catch (error) {
      console.error('Error in FlareVerifierTool:', error);
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Prepares an attestation request for a transaction
   */
  private async prepareRequest(txHash: string): Promise<AttestationRequestResponse> {
    const attestationType = "0x" + this.toHex("EVMTransaction");
    const sourceType = "0x" + this.toHex("testETH"); // Using testnet for example
    
    const requestData = {
      attestationType,
      sourceId: sourceType,
      requestBody: {
        transactionHash: txHash,
        requiredConfirmations: "1",
        provideInput: true,
        listEvents: true,
        logIndices: [],
      },
    };

    try {
      const response = await axios.post(
        `${this.verifierBaseUrl}verifier/eth/EVMTransaction/prepareRequest`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      return response.data as AttestationRequestResponse;
    } catch (error) {
      console.error("Error preparing attestation request:", error);
      throw new Error("Failed to prepare attestation request");
    }
  }

  /**
   * Submits an attestation request to the Flare Data Connector
   */
  private async submitRequest(abiEncodedRequest: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.verifierBaseUrl}verifier/submitAttestation`,
        { encodedData: abiEncodedRequest },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      const responseData = response.data as SubmitAttestationResponse;
      if (responseData && responseData.votingRound) {
        return responseData.votingRound;
      }
      
      throw new Error("No voting round ID returned");
    } catch (error) {
      console.error("Error submitting attestation request:", error);
      throw new Error("Failed to submit attestation request");
    }
  }

  /**
   * Waits for an attestation round to finalize
   * This is a simplified implementation - in production, you would poll the status or use event listeners
   */
  private async waitForRoundFinalization(roundId: string): Promise<void> {
    // Simple delay for demo purposes - in production, implement proper polling
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // In a real implementation, you would check if the round is finalized:
    // const isFinalized = await this.checkRoundFinalization(roundId);
    // if (!isFinalized) throw new Error("Round failed to finalize in time");
  }

  /**
   * Simple hex encoding helper
   */
  private toHex(data: string): string {
    let result = "";
    for (let i = 0; i < data.length; i++) {
      result += data.charCodeAt(i).toString(16);
    }
    return result.padEnd(64, "0");
  }
} 