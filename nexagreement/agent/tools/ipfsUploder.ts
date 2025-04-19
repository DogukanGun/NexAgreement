import { Tool } from "langchain/tools";
import { PinataSDK } from "pinata"

export class IPFSUploaderTool extends Tool {
    name = "IPFSUploader";
    description = `Uploads a file to IPFS. Input is a base64 encoded string of the file.

Input:
{
  "file": "base64 encoded string of the file"
}

Output:
"https://gateway.pinata.cloud/ipfs/Qm..."
`;

    async _call(input: string) {
        const pinata = new PinataSDK({
            pinataJwt: `${process.env.PINATA_JWT}`,
            pinataGateway: `${process.env.NEXT_PUBLIC_GATEWAY_URL}`
        });

        const { file } = JSON.parse(input);
        const formFile = uploadBase64ToPinata(file, "agreement.pdf");
        const { cid } = await pinata.upload.public.file(formFile);
        const url = await pinata.gateways.public.convert(cid);
        return url;
    }
}

/**
 * Converts a base64 string to a File object compatible with Pinata SDK
 */
export function uploadBase64ToPinata(base64String: string, filename: string): File {
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
