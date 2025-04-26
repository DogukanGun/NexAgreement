import { Tool } from "@langchain/core/tools";
import { ethers } from "ethers";
import ProductABI from "../../app/contracts/Product.json";

/**
 * Tool for parsing Ethereum transaction data related to product purchases
 */
export class TxParserTool extends Tool {
  name = "txParser";
  description = `Parse an Ethereum transaction hash to extract purchase details from a product purchase transaction.
  The transaction contains a call to the purchase function of a Product contract.
  
  Input (as a JSON object):
  {
    "txHash": "0x..." // The transaction hash to parse
  }
  
  Output: JSON with purchase details including buyer address, price, product details, etc.
  `;

  private providerUrl: string;

  constructor(providerUrl: string) {
    super();
    this.providerUrl = providerUrl;
  }

  async _call(input: string): Promise<string> {
    try {
      console.log("Parsing transaction hash:", input);
      const txHash = input;
      
      if (!txHash || !txHash.startsWith("0x")) {
        return JSON.stringify({ error: "Invalid transaction hash format." });
      }

      const provider = new ethers.JsonRpcProvider(this.providerUrl);
      const tx = await provider.getTransaction(txHash);

      if (!tx) {
        return JSON.stringify({ error: "Transaction not found." });
      }

      // Get the transaction receipt to verify its success
      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt || !receipt.status) {
        return JSON.stringify({ error: "Transaction failed or is still pending." });
      }

      // Parse the transaction data
      const iface = new ethers.Interface(ProductABI.abi);
      try {
        const parsed = iface.parseTransaction({ data: tx.data, value: tx.value });
        
        if (!parsed || parsed.name !== "purchase") {
          return JSON.stringify({ error: "Transaction is not a product purchase." });
        }

        // Get the product contract instance to read product details
        const productContract = new ethers.Contract(tx.to as string, ProductABI.abi, provider);
        
        // Fetch product details
        const name = await productContract.name();
        const description = await productContract.description();
        const price = await productContract.price();
        const seller = await productContract.seller();
        const tokenId = await productContract.tokenId();
        const productNFT = await productContract.productNFT();
        const category = await productContract.category();
        const royaltyPercentage = await productContract.royaltyPercentage();
        
        // Find the ProductPurchased event in the logs
        const events = receipt.logs
          .map(log => {
            try {
              return iface.parseLog(log);
            } catch (e) {
              return null;
            }
          })
          .filter(parsed => parsed && parsed.name === "ProductPurchased");
        
        const purchaseEvent = events.length > 0 ? events[0] : null;
        const buyer = purchaseEvent?.args?.buyer || tx.from;

        return JSON.stringify({
          success: true,
          contractAddress: tx.to,
          buyer,
          seller,
          product: {
            name,
            description,
            price: ethers.formatEther(price),
            tokenId: tokenId.toString(),
            productNFTAddress: productNFT,
            category,
            royaltyPercentage: royaltyPercentage.toString()
          },
          transactionHash: txHash
        });
      } catch (err) {
        console.error("Error parsing transaction:", err);
        return JSON.stringify({ error: "Could not parse transaction data with the Product ABI." });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      return JSON.stringify({ error: "An unexpected error occurred while parsing the transaction." });
    }
  }
} 