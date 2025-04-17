# NexAgreement Smart Contracts

Smart contracts for the NexAgreement NFT marketplace platform.

## Contracts

- **ProductFactory** - Creates new products and NFTs
- **Product** - Handles individual product listings and purchases
- **ProductNFT** - ERC721 NFT for product ownership

## Architecture

ProductFactory implements a factory pattern:
- Creates Product contracts on demand
- Mints NFTs representing products
- Tracks all products and provides lookup

When a purchase occurs:
- Payment to seller (with optional royalties)
- NFT ownership can be transferred

## Development

```shell
# Setup
npm install

# Compile
npx hardhat compile

# Test
npx hardhat test

# Local node
npx hardhat node

# Deploy
npx hardhat ignition deploy ./ignition/modules/ProductFactory.ts
```

## API

### ProductFactory
```solidity
function createProduct(
    string memory name,
    string memory description,
    uint256 price,
    uint256 royaltyPercentage,
    string memory tokenURI
) external returns (address productAddress, uint256 tokenId);

function getProducts(uint256 offset, uint256 limit) external view returns (address[] memory);
function getProductsBySeller(address seller) external view returns (address[] memory);
```

### Product
```solidity
function purchase() external payable;
function updatePrice(uint256 _newPrice) external onlyOwner;
function updateDescription(string memory _newDescription) external onlyOwner;
```
