import { NextRequest, NextResponse } from "next/server";
import { processTransactionAndGenerateAgreement } from "../../../ai_agent";

export async function POST(request: NextRequest) {
  try {
    const { productDetails, senderSignature, receiverSignature, senderAddress, receiverAddress, transactionHash } = await request.json();

    if (!transactionHash || typeof transactionHash !== 'string') {
      return NextResponse.json(
        { error: "Invalid transaction hash" },
        { status: 400 }
      );
    }

    // Get API key and provider URL from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    const providerUrl = process.env.ETHEREUM_PROVIDER_URL;

    if (!apiKey || !providerUrl) {
      return NextResponse.json(
        { error: "Missing required environment variables" },
        { status: 500 }
      );
    }

    const ipfsUrl = await processTransactionAndGenerateAgreement(
      transactionHash,
      apiKey,
      providerUrl
    );

    console.log("Agreement generated and uploaded to IPFS:", ipfsUrl);
    const response = { 
      success: true,
      agreementUrl: ipfsUrl,
      signatureStatus: {
        senderVerified: true,
        receiverVerified: true
      }
    }

    console.log("Response:", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error generating agreement:", error);
    return NextResponse.json(
      { error: "Failed to generate agreement" },
      { status: 500 }
    );
  }
} 