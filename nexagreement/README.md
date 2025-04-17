# NexAgreement Frontend

Next.js application for the NexAgreement decentralized marketplace.

## Features

- Dashboard for user listings and purchases
- Product creation and management
- Marketplace for browsing and purchasing products
- Wallet integration for blockchain transactions
- NFT ownership verification

## Directory Structure

- `/app` - Next.js application routes and components
  - `/components` - Reusable UI components
  - `/dashboard` - User dashboard pages
  - `/marketplace` - Product browsing pages
  - `/product` - Product detail pages
- `/public` - Static assets

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Smart Contract Integration

The frontend integrates with Ethereum smart contracts for:
- Creating product listings
- Processing purchases
- Managing NFT ownership
- Handling royalty payments

See the `/smart_contracts` directory for contract implementations.

## Wallet Connection

The application uses ethers.js to connect to user wallets for:
- Authenticating users
- Signing transactions
- Viewing owned NFTs
- Managing listings

## Development

```bash
# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```
