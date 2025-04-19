// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ProductNFT.sol";
import "./Product.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProductFactory
 * @dev Factory contract for creating Product contracts and NFTs
 */
contract ProductFactory is Ownable {
    // The ProductNFT contract instance
    ProductNFT public productNFT;
    
    // Mapping of product addresses created by this factory
    mapping(address => bool) public isProductFromFactory;
    
    // Array to store all product addresses
    address[] public allProducts;
    
    // Events
    event ProductCreated(
        address indexed productContract,
        address indexed seller,
        string name,
        uint256 price,
        uint256 tokenId
    );
    
    /**
     * @dev Constructor deploys a new ProductNFT contract
     */
    constructor() Ownable(msg.sender) {
        productNFT = new ProductNFT();
    }
    
    /**
     * @dev Creates a new product with corresponding NFT
     * @param name Product name
     * @param description Product description
     * @param price Product price in wei
     * @param royaltyPercentage Royalty percentage (in basis points, e.g. 500 = 5%)
     * @param tokenURI The metadata URI for the NFT
     * @return productAddress The address of the created product contract
     * @return tokenId The ID of the minted NFT
     * @param category The category of the product
     * @param ipfsId The IPFS ID of the product
     */
    function createProduct(
        string memory name,
        string memory description,
        uint256 price,
        uint256 royaltyPercentage,
        string memory tokenURI,
        string memory category,
        string memory ipfsId
    ) external returns (address productAddress, uint256 tokenId) {
        // Create a temporary product contract
        Product tempProduct = new Product(
            name,
            description,
            price,
            royaltyPercentage,
            msg.sender,
            0, // Temporary tokenId, will be updated after minting
            address(productNFT),
            category,
            ipfsId
        );
        
        // Mint the NFT
        tokenId = productNFT.mintToken(msg.sender, tokenURI, address(tempProduct));
        
        // Create the final product contract with the correct token ID
        Product newProduct = new Product(
            name,
            description,
            price,
            royaltyPercentage,
            msg.sender,
            tokenId,
            address(productNFT),
            category,
            ipfsId
        );
        
        // Add to factory records
        productAddress = address(newProduct);
        isProductFromFactory[productAddress] = true;
        allProducts.push(productAddress);
        
        emit ProductCreated(productAddress, msg.sender, name, price, tokenId);
        
        return (productAddress, tokenId);
    }
    
    /**
     * @dev Returns the total number of products created by this factory
     * @return The count of products
     */
    function getProductCount() external view returns (uint256) {
        return allProducts.length;
    }
    
    /**
     * @dev Returns a batch of product addresses
     * @param offset The starting index
     * @param limit The number of addresses to return
     * @return Array of product addresses
     */
    function getProducts(uint256 offset, uint256 limit) external view returns (address[] memory) {
        if (offset >= allProducts.length) {
            return new address[](0);
        }
        
        uint256 end = offset + limit;
        if (end > allProducts.length) {
            end = allProducts.length;
        }
        
        uint256 size = end - offset;
        address[] memory products = new address[](size);
        
        for (uint256 i = 0; i < size; i++) {
            products[i] = allProducts[offset + i];
        }
        
        return products;
    }
    
    /**
     * @dev Returns products created by a specific seller
     * @param seller The seller address
     * @return Array of product addresses
     */
    function getProductsBySeller(address seller) external view returns (address[] memory) {
        // Count products by seller first
        uint256 count = 0;
        for (uint256 i = 0; i < allProducts.length; i++) {
            Product product = Product(allProducts[i]);
            if (product.seller() == seller) {
                count++;
            }
        }
        
        // Create array of correct size
        address[] memory sellerProducts = new address[](count);
        
        // Fill the array
        uint256 index = 0;
        for (uint256 i = 0; i < allProducts.length; i++) {
            Product product = Product(allProducts[i]);
            if (product.seller() == seller) {
                sellerProducts[index] = allProducts[i];
                index++;
            }
        }
        
        return sellerProducts;
    }
} 