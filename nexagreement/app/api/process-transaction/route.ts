import { NextRequest, NextResponse } from "next/server";
import { processTransactionAndGenerateAgreement } from "../../../ai_agent";

export async function POST(request: NextRequest) {
  try {
    const { txHash } = await request.json();

    if (!txHash || typeof txHash !== 'string') {
      return NextResponse.json(
        { error: "Invalid transaction hash" },
        { status: 400 }
      );
    }

    // Get API key and provider URL from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    const providerUrl = process.env.ETHEREUM_PROVIDER_URL;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    if (!providerUrl) {
      return NextResponse.json(
        { error: "Ethereum provider URL not configured" },
        { status: 500 }
      );
    }

    // Process the transaction and generate the agreement
    const ipfsUrl = await processTransactionAndGenerateAgreement(
      txHash,
      apiKey,
      providerUrl
    );

    return NextResponse.json({ ipfsUrl });
  } catch (error) {
    console.error("Error processing transaction:", error);
    
    return NextResponse.json(
      { error: "Failed to process transaction" },
      { status: 500 }
    );
  }
} 