// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProductNFT
 * @dev ERC721 token representing a product with metadata
 */
contract ProductNFT is ERC721URIStorage, Ownable {
    // Token ID counter
    uint256 private _nextTokenId;
    
    // Mapping from token ID to product contract address
    mapping(uint256 => address) public productContracts;
    
    constructor() ERC721("NexAgreement Product", "NAP") Ownable(msg.sender) {}
    
    /**
     * @dev Mints a new NFT token for a product
     * @param recipient The address that will own the NFT
     * @param tokenURI The metadata URI for the NFT
     * @param productContract The address of the associated product contract
     * @return The ID of the newly minted token
     */
    function mintToken(
        address recipient, 
        string memory tokenURI, 
        address productContract
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        _mint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
        productContracts[tokenId] = productContract;
        
        return tokenId;
    }
    
    /**
     * @dev Returns the product contract associated with a token ID
     * @param tokenId The token ID to query
     * @return The address of the product contract
     */
    function getProductContract(uint256 tokenId) external view returns (address) {
        require(_exists(tokenId), "ProductNFT: Query for nonexistent token");
        return productContracts[tokenId];
    }
    
    /**
     * @dev Internal function to check if a token exists
     * @param tokenId The token ID to check
     * @return bool Whether the token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
} 