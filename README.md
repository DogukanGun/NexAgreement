# NexAgreement

NexAgreement is a decentralized marketplace for digital products using smart contracts and NFTs for ownership verification.

## Project Overview

This platform enables:
- Listing digital products with NFT ownership
- Secure transactions through smart contracts
- Royalty payments to original creators
- Decentralized ownership verification

## Project Structure

The project consists of two main components:

### `/nexagreement` - Frontend Application

Next.js web application with:
- Product browsing and search
- Listing creation interface
- Wallet integration
- User dashboard

Tech stack:
- Next.js 15.3.0
- React
- Tailwind CSS
- ethers.js for blockchain interaction

### `/smart_contracts` - Blockchain Smart Contracts

Solidity contracts implementing:
- Factory pattern for product creation
- NFT standard for ownership
- Secure payment system
- Royalty mechanism

Tech stack:
- Solidity 0.8.20
- Hardhat development environment
- OpenZeppelin contracts
- TypeScript for testing

## Getting Started

### Smart Contracts

```bash
cd smart_contracts
npm install
npx hardhat compile
npx hardhat test
```

For local development:
```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

### Frontend

```bash
cd nexagreement
npm install
npm run dev
```

The application will be available at http://localhost:3000

## Architecture

1. **Product Creation Flow**:
   - User creates listing through UI
   - ProductFactory contract deploys new Product contract
   - NFT is minted representing ownership

2. **Purchase Flow**:
   - Buyer initiates purchase through UI
   - Smart contract handles payment including royalties
   - NFT ownership is transferred to buyer

## Development

For detailed development instructions, see:
- [Frontend README](/nexagreement/README.md)
- [Smart Contracts README](/smart_contracts/README.md)

## License