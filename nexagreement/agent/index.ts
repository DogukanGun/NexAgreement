import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { StructuredToolInterface } from "@langchain/core/tools";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AgreementGeneratorTool } from "./tools/agreementGenerator";
import { IPFSUploaderTool } from "./tools/ipfsUploder";
import { ParseEthereumTransactionTool } from "./tools/transactionParser";

const SYSTEM_MESSAGE = `You are NexAgreement Agent, a specialized AI assistant designed to help users create, manage, and interact with smart contract agreements. Your capabilities include:

1. Generating legal agreements and converting them into smart contracts
2. Uploading documents to IPFS for decentralized storage
3. Parsing and analyzing Ethereum transactions
4. Providing guidance on smart contract interactions

You should:
- Always verify the accuracy of generated agreements
- Ensure proper formatting and structure of smart contracts
- Maintain security best practices when handling transactions
- Provide clear explanations of your actions and decisions

You should do in this order:
1. Parse the transaction to get necessary information
2. Generate the agreement
3. Upload the agreement to IPFS
4. Return the agreement URL

Remember to be precise, thorough, and security-conscious in all your operations.`;

export class NexAgreementAgent {
    private agent: any; // Type will be determined by createReactAgent
    private tools: StructuredToolInterface[];
    private memory: MemorySaver;

    constructor() {
        // Initialize tools
        this.tools = [
            new AgreementGeneratorTool(),
            new IPFSUploaderTool(),
            new ParseEthereumTransactionTool()
        ];

        // Initialize LLM
        const llm = new ChatOpenAI({
            modelName: "gpt-4o-mini",
            temperature: 0.3,
            openAIApiKey: process.env.OPENAI_API_KEY
        });

        // Initialize memory
        this.memory = new MemorySaver();

        // Create ReAct agent with system message
        this.agent = createReactAgent({
            llm,
            tools: this.tools
        });
    }

    async run(input: string, signatureFromSender: string, signatureFromReceiver: string) {
        try {
            const result = await this.agent.invoke({
                messages: [
                    new SystemMessage(SYSTEM_MESSAGE),
                    new HumanMessage(input),
                    new HumanMessage(`Signature from sender: ${signatureFromSender}`),
                    new HumanMessage(`Signature from receiver: ${signatureFromReceiver}`)
                ]
            });
            return result;
        } catch (error) {
            console.error("Agent execution failed:", error);
            throw error;
        }
    }
}
