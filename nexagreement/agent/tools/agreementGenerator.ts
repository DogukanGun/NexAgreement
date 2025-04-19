import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
import { ToolRunnableConfig, ToolReturnType } from "@langchain/core/tools";
import { Tool } from "langchain/tools";
import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import path from "path";

export class AgreementGeneratorTool extends Tool {
    name = "AgreementGenerator";
    description = `Generates a legal NFT-based ownership transfer agreement.

Input JSON:
{
  "userId": "unique id of the user",
  "tradeId": "unique id of the trade",
  "product": "product name",
  "past_owner": "past owner of the product",
  "new_owner": "new owner of the product",
  "price": "price of the product",
  "product_nft_address": "address of the product NFT",
  "product_nft_token_id": "token id of the product NFT",
  "product_sale_contract_address": "address of the product sale contract"
}
Output: {
  "path": "/mnt/data/{userId}/agreements/{tradeId}.pdf",
  "base64": "data:application/pdf;base64,..."
}
`;

    async _call(
        arg: string,
        runManager?: CallbackManagerForToolRun,
        parentConfig?: ToolRunnableConfig
    ): Promise<ToolReturnType> {
        const {
            userId,
            tradeId,
            product,
            past_owner,
            new_owner,
            price,
            product_nft_address,
            product_nft_token_id,
            product_sale_contract_address
        } = JSON.parse(arg);

        const templatePath = path.join("/mnt/data", "NexAgreement_Legal_Wallet_Signed_NoFooter.pdf");
        const existingPdfBytes = await fetch("file://" + templatePath).then(res => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const firstPage = pdfDoc.getPages()[0];
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const fill = (label: string, value: string, yOffset: number) => {
            firstPage.drawText(`${label}: ${value}`, {
                x: 50,
                y: firstPage.getHeight() - yOffset,
                size: 12,
                font,
                color: rgb(0, 0, 0),
            });
        };

        fill("Product Name", product, 170);
        fill("Past Owner", past_owner, 190);
        fill("New Owner", new_owner, 210);
        fill("Price", price, 230);
        fill("Product NFT Address", product_nft_address, 250);
        fill("NFT Token ID", product_nft_token_id, 270);
        fill("Product Sale Contract Address", product_sale_contract_address, 290);

        const pdfBytes = await pdfDoc.save();

        const outDir = path.join("/mnt/data", userId, "agreements");
        mkdirSync(outDir, { recursive: true });
        const outputPath = path.join(outDir, `${tradeId}.pdf`);
        writeFileSync(outputPath, pdfBytes);

        const fileData = readFileSync(outputPath);
        const base64 = `data:application/pdf;base64,${fileData.toString("base64")}`;

        return JSON.stringify({
            path: outputPath,
            base64
        });
    }
}
