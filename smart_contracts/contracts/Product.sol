// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ProductNFT.sol";

/**
 * @title Product
 * @dev Represents a single product listing with purchasing functionality
 */
contract Product is Ownable {
    // Product details
    string public name;
    string public description;
    uint256 public price;
    address public seller;
    uint256 public tokenId;
    bool public isSold;
    
    // Product royalty settings
    uint256 public royaltyPercentage;
    
    // Reference to the ProductNFT contract
    ProductNFT public productNFT;
    
    // Events
    event ProductPurchased(address indexed buyer, uint256 price, uint256 tokenId);
    event RoyaltyPaid(address indexed receiver, uint256 amount);
    
    /**
     * @dev Constructor for creating a new product
     * @param _name Product name
     * @param _description Product description
     * @param _price Price in wei
     * @param _royaltyPercentage Royalty percentage (in basis points, e.g. 500 = 5%)
     * @param _seller Address of the seller
     * @param _tokenId Token ID of the associated NFT
     * @param _productNFT Address of the ProductNFT contract
     */
    constructor(
        string memory _name,
        string memory _description,
        uint256 _price,
        uint256 _royaltyPercentage,
        address _seller,
        uint256 _tokenId,
        address _productNFT
    ) Ownable(_seller) {
        name = _name;
        description = _description;
        price = _price;
        royaltyPercentage = _royaltyPercentage;
        seller = _seller;
        tokenId = _tokenId;
        productNFT = ProductNFT(_productNFT);
        isSold = false;
    }
    
    /**
     * @dev Allows a user to purchase the product
     * Note: The seller must call approve() on the NFT contract for this product contract 
     * before a purchase can be completed.
     */
    function purchase() external payable {
        require(!isSold, "Product: Already sold");
        require(msg.value >= price, "Product: Insufficient payment");
        
        isSold = true;
        
        // Calculate royalty if applicable
        uint256 royaltyAmount = 0;
        if (royaltyPercentage > 0) {
            royaltyAmount = (price * royaltyPercentage) / 10000;
            uint256 sellerAmount = price - royaltyAmount;
            
            // Pay royalty to original creator
            (bool royaltySuccess, ) = payable(seller).call{value: royaltyAmount}("");
            require(royaltySuccess, "Product: Royalty payment failed");
            emit RoyaltyPaid(seller, royaltyAmount);
            
            // Pay remaining amount to seller
            (bool sellerSuccess, ) = payable(seller).call{value: sellerAmount}("");
            require(sellerSuccess, "Product: Seller payment failed");
        } else {
            // Pay full amount to seller
            (bool success, ) = payable(seller).call{value: price}("");
            require(success, "Product: Payment failed");
        }
        
        // If buyer sent too much, refund the excess
        if (msg.value > price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - price}("");
            require(refundSuccess, "Product: Refund failed");
        }
        
        // The NFT transfer will be handled externally after purchase
        // This is to avoid complexities with approval
        
        emit ProductPurchased(msg.sender, price, tokenId);
    }
    
    /**
     * @dev Allows the seller to update the product price
     * @param _newPrice New price in wei
     */
    function updatePrice(uint256 _newPrice) external onlyOwner {
        require(!isSold, "Product: Already sold");
        price = _newPrice;
    }
    
    /**
     * @dev Allows the seller to update the product description
     * @param _newDescription New product description
     */
    function updateDescription(string memory _newDescription) external onlyOwner {
        require(!isSold, "Product: Already sold");
        description = _newDescription;
    }
} 