// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./ProductNFT.sol";

/**
 * @title Product
 * @dev Represents a single product listing with purchasing functionality
 */
contract Product is Ownable {
    using ECDSA for bytes32;

    // Product details
    string public name;
    string public category;
    string public description;
    string public imageUrl;
    string public agreementUrl;
    uint256 public price;
    address public seller;
    uint256 public tokenId;
    bool public isSold;
    bool public hasAgreement;
    
    // Product royalty settings
    uint256 public royaltyPercentage;
    
    // Reference to the ProductNFT contract
    ProductNFT public productNFT;
    
    // Signature verification
    bytes public sellerSignature;
    bytes public buyerSignature;
    
    // Events
    event ProductPurchased(address indexed buyer, uint256 price, uint256 tokenId);
    event RoyaltyPaid(address indexed receiver, uint256 amount);
    event AgreementUpdated(string newAgreementUrl);
    event SignatureUpdated(address indexed signer, bool isSeller);
    
    /**
     * @dev Constructor for creating a new product
     * @param _name Product name
     * @param _description Product description
     * @param _price Price in wei
     * @param _royaltyPercentage Royalty percentage (in basis points, e.g. 500 = 5%)
     * @param _seller Address of the seller
     * @param _tokenId Token ID of the associated NFT
     * @param _productNFT Address of the ProductNFT contract
     * @param _imageUrl Image URL of the product
     * @param _sellerSignature Seller's signature for the listing
     */
    constructor(
        string memory _name,
        string memory _description,
        uint256 _price,
        uint256 _royaltyPercentage,
        address _seller,
        uint256 _tokenId,
        address _productNFT,
        string memory _category,
        string memory _imageUrl,
        bytes memory _sellerSignature
    ) Ownable(_seller) {
        name = _name;
        description = _description;
        price = _price;
        royaltyPercentage = _royaltyPercentage;
        seller = _seller;
        tokenId = _tokenId;
        productNFT = ProductNFT(_productNFT);
        isSold = false;
        category = _category;
        imageUrl = _imageUrl;
        hasAgreement = false;
        sellerSignature = _sellerSignature;
    }

    /**
     * @dev Verifies a signature for a given message
     * @param message The message that was signed
     * @param signature The signature to verify
     * @param signer The address that should have signed the message
     * @return bool Whether the signature is valid
     */
    function verifySignature(
        string memory message,
        bytes memory signature,
        address signer
    ) public pure returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(message));
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        address recovered = ECDSA.recover(ethSignedMessageHash, signature);
        return recovered == signer;
    }

    /**
     * @dev Allows a user to purchase the product
     * @param _buyerSignature The buyer's signature for the purchase
     */
    function purchase(bytes memory _buyerSignature) external payable {
        require(!isSold, "Product: Already sold");
        require(msg.value >= price, "Product: Insufficient payment");
        
        // Store signature regardless of verification
        buyerSignature = _buyerSignature;
        
        // To enable agreement requirement, uncomment this line
        // require(hasAgreement, "Product: Agreement not uploaded");
        
        // Signature verification is handled off-chain by the agent
        // We'll just store the signature for verification later
        
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
        
        emit ProductPurchased(msg.sender, price, tokenId);
    }

    /**
     * @dev Allows the seller to update the agreement URL
     * @param _agreementUrl New agreement URL
     */
    function updateAgreement(string memory _agreementUrl) external onlyOwner {
        require(!isSold, "Product: Already sold");
        agreementUrl = _agreementUrl;
        hasAgreement = true;
        emit AgreementUpdated(_agreementUrl);
    }

    /**
     * @dev Allows the buyer to update the agreement URL after purchase
     * @param _agreementUrl New agreement URL
     */
    function updateAgreementAfterPurchase(string memory _agreementUrl) external {
        require(isSold, "Product: Not sold yet");
        require(msg.sender == seller || msg.sender == owner(), "Product: Not authorized");
        agreementUrl = _agreementUrl;
        hasAgreement = true;
        emit AgreementUpdated(_agreementUrl);
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