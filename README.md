# NexAgreement

NexAgreement is a decentralized marketplace for digital products using smart contracts and NFTs for ownership verification.

## Project Overview

This platform enables:
- Listing digital products with NFT ownership
- Secure transactions through smart contracts
- Royalty payments to original creators
- Decentralized ownership verification
- AI-powered verification flow using LangGraph
- Secure authentication via Civic Auth

## Project Structure

The project consists of three main components:

### `/nexagreement` - Frontend Application

Next.js web application with:
- Product browsing and search
- Listing creation interface
- Civic Auth integration for secure wallet-based authentication
- User dashboard

Tech stack:
- Next.js 15.3.0
- React
- Tailwind CSS
- ethers.js for blockchain interaction
- @civic/auth-web3 for authentication

### `/smart_contracts` - Blockchain Smart Contracts

Solidity contracts implementing:
- Factory pattern for product creation
- NFT standard for ownership
- Secure payment system
- Royalty mechanism

### `/ai_agent` - AI Verification System

LangGraph-based verification system:
- Automated verification workflow
- Multi-step transaction validation
- AI-powered agreement generation and validation
- Intelligent decision-making pipeline

## System Architecture

The NexAgreement platform uses a multi-layered architecture:

1. **Frontend Layer**:
   - React/Next.js web application
   - Civic Auth integration for secure authentication
   - Embedded wallet functionality
   - Connects to cloud services through API endpoints

2. **Cloud Infrastructure**:
   - Load Balancer: Manages incoming traffic and routes requests
   - Frontend API & Inner Gateway: Handles API requests and authentication
   - Frontend Agent: Core processing logic with specialized modules:
     - IPFS Module: For decentralized storage of agreements and metadata
     - AI Agent Module: Handles verification and agreement generation

3. **Blockchain Layer**:
   - Marketplace smart contracts for product listing and transactions
   - Products represented as smart contracts with ownership verification
   - NFTs for digital asset ownership with royalty capabilities

4. **AI Verification Layer**:
   - LangGraph-powered verification workflow
   - Multi-step transaction validation
   - Intelligent agreement generation
   - OpenAI integration for advanced processing

## Getting Started

### Prerequisites

1. Install dependencies:
```bash
npm install @civic/auth-web3
```

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

1. **Authentication Flow**:
   - User authenticates using Civic Auth
   - Embedded wallet is created/accessed
   - Secure session established

2. **Product Creation Flow**:
   - User creates listing through UI
   - ProductFactory contract deploys new Product contract
   - NFT is minted representing ownership

3. **Purchase Flow**:
   - Buyer initiates purchase through UI
   - Smart contract handles payment including royalties
   - NFT ownership is transferred to buyer
   - AI-powered verification process begins
   - Digital agreement is generated with verification details

4. **Verification Flow (LangGraph)**:
   - Transaction details submitted to AI verification system
   - Multi-step validation process
   - Agreement generation with verification proof
   - Final attestation and confirmation

## Development

For detailed development instructions, see:
- [Frontend README](/nexagreement/README.md)
- [Smart Contracts README](/smart_contracts/README.md)
- [AI Agent README](/ai_agent/README.md)

## License