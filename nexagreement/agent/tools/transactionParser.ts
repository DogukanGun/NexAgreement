import { Interface } from "ethers";
import { Tool } from "langchain/tools";
import { abi } from "../../app/contracts/Product.json";


export class ParseEthereumTransactionTool extends Tool {
  name = "ParseEthereumTransaction";
  description = `Parses an Ethereum transaction that is called by product factory contract.
  
  Input:
  {
    "data": "0x1234567890abcdef"
  }
  `;

  async _call(input: string) {
    const { data } = JSON.parse(input);
    const iface = new Interface(abi);

    try {
      const parsed = iface.parseTransaction({ data });
      if (!parsed) {
        return "Error parsing transaction";
      }
      return `Function: ${parsed.name}, Args: ${JSON.stringify(parsed.args)}`;
    } catch (err) {
      return "Error parsing transaction";
    }
  }
}
