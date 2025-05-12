import { ChatOpenAI } from '@langchain/openai';
import { TxParserTool } from '../tools/txParser';
import { AgreementFillerTool } from '../tools/agreementFiller';
import { IpfsUploaderTool } from '../tools/ipfsUploader';

interface VerificationState {
  transactionDetails: any;
  verificationStatus: 'pending' | 'completed' | 'failed';
  verificationSteps: string[];
  currentStep: number;
  agreementData: any;
}

class VerificationFlow {
  private model: ChatOpenAI;
  private txParser: TxParserTool;
  private agreementFiller: AgreementFillerTool;
  private ipfsUploader: IpfsUploaderTool;

  constructor(
    apiKey: string,
    providerUrl: string
  ) {
    this.model = new ChatOpenAI({ 
      openAIApiKey: apiKey,
      modelName: 'gpt-4-turbo-preview'
    });
    this.txParser = new TxParserTool(providerUrl);
    this.agreementFiller = new AgreementFillerTool();
    this.ipfsUploader = new IpfsUploaderTool();
  }

  private async validateTransaction(state: VerificationState): Promise<VerificationState> {
    try {
      const txData = await this.txParser._call(state.transactionDetails.hash);
      const parsedTx = JSON.parse(txData);

      if (!parsedTx.success) {
        return {
          ...state,
          verificationStatus: 'failed',
          verificationSteps: [...state.verificationSteps, 'Transaction validation failed']
        };
      }

      return {
        ...state,
        transactionDetails: { ...state.transactionDetails, ...parsedTx },
        verificationSteps: [...state.verificationSteps, 'Transaction validated'],
        currentStep: state.currentStep + 1
      };
    } catch (err) {
      const error = err as Error;
      console.error('Error in validateTransaction:', error);
      return {
        ...state,
        verificationStatus: 'failed',
        verificationSteps: [...state.verificationSteps, `Transaction validation error: ${error.message}`]
      };
    }
  }

  private async generateAgreement(state: VerificationState): Promise<VerificationState> {
    try {
      const agreementData = await this.agreementFiller._call(
        JSON.stringify(state.transactionDetails)
      );
      const agreement = JSON.parse(agreementData);

      if (!agreement.success) {
        return {
          ...state,
          verificationStatus: 'failed',
          verificationSteps: [...state.verificationSteps, 'Agreement generation failed']
        };
      }

      // Upload to IPFS
      const ipfsData = await this.ipfsUploader._call(JSON.stringify({
        base64: agreement.base64,
        filename: agreement.filename
      }));
      const ipfsResult = JSON.parse(ipfsData);

      if (!ipfsResult.success) {
        return {
          ...state,
          verificationStatus: 'failed',
          verificationSteps: [...state.verificationSteps, 'IPFS upload failed']
        };
      }

      return {
        ...state,
        agreementData: { ...agreement, ipfsUrl: ipfsResult.ipfsUrl },
        verificationStatus: 'completed',
        verificationSteps: [
          ...state.verificationSteps, 
          'Agreement generated',
          'Agreement uploaded to IPFS'
        ],
        currentStep: state.currentStep + 1
      };
    } catch (err) {
      const error = err as Error;
      console.error('Error in generateAgreement:', error);
      return {
        ...state,
        verificationStatus: 'failed',
        verificationSteps: [...state.verificationSteps, `Agreement generation error: ${error.message}`]
      };
    }
  }

  public async verify(transactionHash: string): Promise<VerificationState> {
    const initialState: VerificationState = {
      transactionDetails: { hash: transactionHash },
      verificationStatus: 'pending',
      verificationSteps: [],
      currentStep: 0,
      agreementData: {}
    };

    // Execute the verification flow sequentially
    let state = await this.validateTransaction(initialState);
    
    if (state.verificationStatus !== 'failed') {
      state = await this.generateAgreement(state);
    }

    return state;
  }
}

export { VerificationFlow, type VerificationState }; 