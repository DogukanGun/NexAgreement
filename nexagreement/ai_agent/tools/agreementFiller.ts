import { Tool } from "@langchain/core/tools";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/**
 * Tool for filling in agreement templates with purchase data
 */
export class AgreementFillerTool extends Tool {
  name = "agreementFiller";
  description = `Fill in an agreement template with purchase data extracted from a transaction.
  
  Input:
  {
    "buyer": "0x...",
    "seller": "0x...",
    "product": {
      "name": "Product Name",
      "description": "Product Description",
      "price": "1.0",
      "tokenId": "1",
      "productNFTAddress": "0x...",
      "category": "Category",
      "royaltyPercentage": "10"
    },
    "contractAddress": "0x...",
    "transactionHash": "0x...",
    "flareAttestation": {
      "attestationLink": "https://...",
      "roundId": "123"
    }
  }
  
  Output: Base64-encoded PDF of the filled agreement
  `;

  async _call(input: string): Promise<string> {
    try {
      console.log("Filling agreement template:", input);
      const data = JSON.parse(input);
      const { buyer, seller, product, contractAddress, transactionHash, flareAttestation } = data;
      
      if (!buyer || !seller || !product || !contractAddress || !transactionHash) {
        return JSON.stringify({ 
          error: "Missing required data for agreement generation." 
        });
      }

      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]); // US Letter size
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Set positioning variables
      const { width, height } = page.getSize();
      const margin = 50;
      let currentY = height - margin;
      const lineHeight = 20;

      // Function to add text to the PDF
      const addText = (text: string, y: number, options = {}) => {
        page.drawText(text, {
          x: margin,
          y,
          size: 12,
          font,
          color: rgb(0, 0, 0),
          ...options
        });
      };

      // Add title and header
      addText("DIGITAL ASSET OWNERSHIP TRANSFER AGREEMENT", currentY, {
        font: boldFont,
        size: 16
      });
      currentY -= lineHeight * 2;

      // Add date
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      addText(`Date: ${today}`, currentY);
      currentY -= lineHeight * 2;

      // Add introduction
      addText("This Digital Asset Ownership Transfer Agreement (the \"Agreement\") is entered into on the date above by and between:", currentY);
      currentY -= lineHeight;
      addText(`${seller} (the \"Seller\")`, currentY);
      currentY -= lineHeight;
      addText(`${buyer} (the \"Buyer\")`, currentY);
      currentY -= lineHeight * 2;

      // Add asset details
      addText("1. ASSET DETAILS", currentY, { font: boldFont });
      currentY -= lineHeight;
      addText(`   Product Name: ${product.name}`, currentY);
      currentY -= lineHeight;
      addText(`   Category: ${product.category}`, currentY);
      currentY -= lineHeight;
      addText(`   Description: ${product.description}`, currentY);
      currentY -= lineHeight * 2;

      // Add transaction details
      addText("2. TRANSACTION DETAILS", currentY, { font: boldFont });
      currentY -= lineHeight;
      addText(`   Purchase Price: ${product.price} ETH`, currentY);
      currentY -= lineHeight;
      addText(`   NFT Contract Address: ${product.productNFTAddress}`, currentY);
      currentY -= lineHeight;
      addText(`   NFT Token ID: ${product.tokenId}`, currentY);
      currentY -= lineHeight;
      addText(`   Product Sale Contract Address: ${contractAddress}`, currentY);
      currentY -= lineHeight;
      addText(`   Transaction Hash: ${transactionHash}`, currentY);
      currentY -= lineHeight * 2;

      // Add ownership transfer section
      addText("3. OWNERSHIP TRANSFER", currentY, { font: boldFont });
      currentY -= lineHeight;
      addText("   The Seller hereby transfers all rights, title, and interest in the digital asset to the Buyer.", currentY);
      currentY -= lineHeight;
      addText("   The Buyer acknowledges receipt of the digital asset and accepts all rights and responsibilities associated with ownership.", currentY);
      currentY -= lineHeight * 2;

      // Add representations and warranties
      addText("4. REPRESENTATIONS AND WARRANTIES", currentY, { font: boldFont });
      currentY -= lineHeight;
      addText("   The Seller represents and warrants that they are the lawful owner of the digital asset and have the right to transfer it.", currentY);
      currentY -= lineHeight;
      addText("   The Buyer acknowledges that they have inspected the digital asset and are satisfied with its condition.", currentY);
      currentY -= lineHeight * 2;

      // Add royalty information if applicable
      if (product.royaltyPercentage && Number(product.royaltyPercentage) > 0) {
        addText("5. ROYALTY PROVISIONS", currentY, { font: boldFont });
        currentY -= lineHeight;
        addText(`   The Buyer acknowledges that a royalty of ${product.royaltyPercentage}% will be paid to the original creator`, currentY);
        currentY -= lineHeight;
        addText("   upon any subsequent sale of this digital asset, as encoded in the smart contract.", currentY);
        currentY -= lineHeight * 2;
      }

      // Add blockchain verification
      addText("6. BLOCKCHAIN VERIFICATION", currentY, { font: boldFont });
      currentY -= lineHeight;
      addText("   This transfer is verified and recorded on the blockchain through the transaction referenced above.", currentY);
      currentY -= lineHeight;
      addText("   Both parties acknowledge that this blockchain record serves as proof of this ownership transfer agreement.", currentY);
      currentY -= lineHeight * 2;

      // Add Flare attestation information if available
      if (flareAttestation && flareAttestation.attestationLink) {
        addText("7. CROSS-CHAIN ATTESTATION", currentY, { font: boldFont });
        currentY -= lineHeight;
        addText("   This transaction has been verified by Flare Data Connector (FDC), providing cross-chain attestation", currentY);
        currentY -= lineHeight;
        addText("   of the transaction's authenticity and immutability.", currentY);
        currentY -= lineHeight;
        addText(`   Attestation Round ID: ${flareAttestation.roundId}`, currentY);
        currentY -= lineHeight;
        addText(`   Verification Link: ${flareAttestation.attestationLink}`, currentY);
        currentY -= lineHeight * 2;
      }

      // Add signature section
      addText("SELLER SIGNATURE:", currentY);
      currentY -= lineHeight;
      addText(`Address: ${seller}`, currentY);
      currentY -= lineHeight * 2;

      addText("BUYER SIGNATURE:", currentY);
      currentY -= lineHeight;
      addText(`Address: ${buyer}`, currentY);
      currentY -= lineHeight * 2;

      // Add footer with transaction hash
      currentY = margin;
      addText(`Transaction Hash: ${transactionHash.substring(0, 40)}...`, currentY, {
        size: 8,
        color: rgb(0.5, 0.5, 0.5)
      });

      // Convert to PDF bytes and then to base64
      const pdfBytes = await pdfDoc.save();
      const base64 = Buffer.from(pdfBytes).toString('base64');
      const dataUri = `data:application/pdf;base64,${base64}`;

      return JSON.stringify({
        success: true,
        base64: dataUri,
        filename: `agreement_${product.name.replace(/\s+/g, '_')}_${today.replace(/\s+/g, '_')}.pdf`
      });
    } catch (err) {
      console.error("Error generating agreement:", err);
      return JSON.stringify({ 
        error: "Failed to generate agreement document." 
      });
    }
  }
} 