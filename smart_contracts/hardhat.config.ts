import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Get private key from environment variable
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Local development network
    hardhat: {
      chainId: 31337
    },
    // Flare Coston2 testnet
    flareCoston2: {
      url: process.env.TESTNET_URL || "https://coston2-api.flare.network/ext/bc/C/rpc",
      accounts: [PRIVATE_KEY],
      chainId: 114,
      gasMultiplier: 1.2
    },
    // Testnet
    sepolia: {
      url: process.env.SEPOLIA_URL || "",
      accounts: [PRIVATE_KEY]
    },
    // Polygon testnet
    mumbai: {
      url: process.env.MUMBAI_URL || "",
      accounts: [PRIVATE_KEY]
    },
    // Mainnet (use with caution)
    mainnet: {
      url: process.env.MAINNET_URL || "",
      accounts: [PRIVATE_KEY]
    }
  },
  // For contract verification
  etherscan: {
    apiKey: {
      flareCoston2: "any-value", // No API key needed for Flare's explorer
      // Keep other API keys
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || ""
    },
    customChains: [
      {
        network: "flareCoston2",
        chainId: 114,
        urls: {
          apiURL: "https://coston2-explorer.flare.network/api",
          browserURL: "https://coston2-explorer.flare.network"
        }
      }
    ]
  },
  // For gas reporting in tests
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  }
};

export default config;
