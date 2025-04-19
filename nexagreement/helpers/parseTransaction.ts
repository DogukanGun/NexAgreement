import { ethers } from "ethers";

export async function parseTxHash(txHash: string, abi: any, providerUrl: string) {
  const provider = new ethers.JsonRpcProvider(providerUrl);
  const tx = await provider.getTransaction(txHash);
  const iface = new ethers.Interface(abi);

  if (!tx) {
    return { error: "Transaction not found." };
  }

  try {
    const parsed = iface.parseTransaction({ data: tx.data, value: tx.value });
    if (!parsed) {
      return { error: "Could not parse transaction data with given ABI." };
    }
    return {
      to: tx.to,
      function: parsed.name,
      args: parsed.args,
    };
  } catch (err) {
    return { error: "Could not parse transaction data with given ABI." };
  }
}
