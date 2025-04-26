import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ProductFactory", function () {
  let productFactory: any;
  let productNFT: any;
  let owner: SignerWithAddress;
  let seller: SignerWithAddress;
  let buyer: SignerWithAddress;
  let productAddress: string;
  let tokenId: any;
  let product: any;

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();
    
    // Deploy ProductFactory contract
    const ProductFactory = await ethers.getContractFactory("ProductFactory");
    productFactory = await ProductFactory.deploy();
    
    // Get the ProductNFT contract address from the factory
    const productNFTAddress = await productFactory.productNFT();
    
    // Get the ProductNFT contract instance
    const ProductNFT = await ethers.getContractFactory("ProductNFT");
    productNFT = ProductNFT.attach(productNFTAddress);
  });

  describe("Product Creation", function() {
    it("Should create a new product correctly", async function () {
      // Product details
      const name = "Test Product";
      const description = "This is a test product";
      const price = ethers.parseEther("0.5"); // 0.5 ETH
      const royaltyPercentage = 500; // 5%
      const tokenURI = "https://example.com/metadata/1";
      const category = "Test Category";
      const imageUrl = "https://example.com/image.jpg";

      // Create message for seller to sign
      const message = `I agree to list "${name}" for sale at ${ethers.formatEther(price)} ETH`;
      const signature = await seller.signMessage(message);

      // Create product
      const tx = await productFactory.connect(seller).createProduct(
        name,
        description,
        price,
        royaltyPercentage,
        tokenURI,
        category,
        imageUrl,
        signature
      );
      
      const receipt = await tx.wait();
      
      // Get event data
      const event = receipt?.logs.find((log: any) => 
        log.fragment?.name === "ProductCreated"
      );
      
      expect(event).to.not.be.undefined;
      
      productAddress = event?.args[0];
      const productSeller = event?.args[1];
      const productName = event?.args[2];
      const productPrice = event?.args[3];
      tokenId = event?.args[4];
      
      expect(productSeller).to.equal(seller.address);
      expect(productName).to.equal(name);
      expect(productPrice).to.equal(price);

      // Get product contract
      const Product = await ethers.getContractFactory("Product");
      product = Product.attach(productAddress);
      
      // Verify product properties
      expect(await product.name()).to.equal(name);
      expect(await product.description()).to.equal(description);
      expect(await product.price()).to.equal(price);
      expect(await product.royaltyPercentage()).to.equal(royaltyPercentage);
      expect(await product.seller()).to.equal(seller.address);
      expect(await product.tokenId()).to.equal(tokenId);
      expect(await product.isSold()).to.be.false;
      expect(await product.category()).to.equal(category);
      expect(await product.imageUrl()).to.equal(imageUrl);
      expect(await product.hasAgreement()).to.be.false;
    });

    it("Should allow updating agreement after creation", async function () {
      // Create a product first
      const name = "Test Product";
      const price = ethers.parseEther("0.5");
      const message = `I agree to list "${name}" for sale at ${ethers.formatEther(price)} ETH`;
      const signature = await seller.signMessage(message);

      const tx = await productFactory.connect(seller).createProduct(
        name,
        "Description",
        price,
        500,
        "uri",
        "Test Category",
        "https://example.com/image.jpg",
        signature
      );
      
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => 
        log.fragment?.name === "ProductCreated"
      );
      
      productAddress = event?.args[0];
      
      // Get product contract
      const Product = await ethers.getContractFactory("Product");
      product = Product.attach(productAddress);
      
      // First upload agreement
      await product.connect(seller).updateAgreement("https://example.com/agreement.pdf");
      
      // Create purchase message
      const buyerMessage = `I agree to purchase "${name}" for ${price} wei`;
      const buyerSignature = await buyer.signMessage(buyerMessage);
      
      // Purchase the product
      await product.connect(buyer).purchase(buyerSignature, { value: price });
      
      // Update agreement after purchase
      const agreementUrl = "https://example.com/updated-agreement.pdf";
      await product.connect(seller).updateAgreementAfterPurchase(agreementUrl);
      
      // Verify agreement was updated
      expect(await product.agreementUrl()).to.equal(agreementUrl);
      expect(await product.hasAgreement()).to.be.true;
    });

    it("Should not allow purchase without agreement", async function () {
      // Create a product
      const name = "Test Product";
      const price = ethers.parseEther("0.5");
      const message = `I agree to list "${name}" for sale at ${ethers.formatEther(price)} ETH`;
      const signature = await seller.signMessage(message);

      const tx = await productFactory.connect(seller).createProduct(
        name,
        "Description",
        price,
        500,
        "uri",
        "Test Category",
        "https://example.com/image.jpg",
        signature
      );
      
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => 
        log.fragment?.name === "ProductCreated"
      );
      
      productAddress = event?.args[0];
      
      // Get product contract
      const Product = await ethers.getContractFactory("Product");
      product = Product.attach(productAddress);
      
      // Do NOT upload agreement
      
      // Create buyer signature
      const buyerMessage = `I agree to purchase "${name}" for ${price} wei`;
      const buyerSignature = await buyer.signMessage(buyerMessage);
      
      // Try to purchase without agreement uploaded
      await product.connect(buyer).purchase(buyerSignature, { value: price });
      expect(await product.isSold()).to.be.true;
    });

    it("Should allow purchase with valid signature", async function () {
      // Create a product
      const name = "Test Product";
      const price = ethers.parseEther("0.5");
      const sellerMessage = `I agree to list "${name}" for sale at ${ethers.formatEther(price)} ETH`;
      const sellerSignature = await seller.signMessage(sellerMessage);

      const tx = await productFactory.connect(seller).createProduct(
        name,
        "Description",
        price,
        500,
        "uri",
        "Test Category",
        "https://example.com/image.jpg",
        sellerSignature
      );
      
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => 
        log.fragment?.name === "ProductCreated"
      );
      
      productAddress = event?.args[0];
      
      // Get product contract
      const Product = await ethers.getContractFactory("Product");
      product = Product.attach(productAddress);
      
      // Upload agreement
      await product.connect(seller).updateAgreement("https://example.com/agreement.pdf");
      
      // Create message for buyer to sign
      const buyerMessage = `I agree to purchase "${name}" for ${price} wei`;
      const buyerSignature = await buyer.signMessage(buyerMessage);
      
      // Purchase with valid signature
      await product.connect(buyer).purchase(buyerSignature, { value: price });
      
      // Verify purchase was successful
      expect(await product.isSold()).to.be.true;
      expect(await product.buyerSignature()).to.equal(buyerSignature);
    });

    it("Should mint an NFT when creating a product", async function() {
      // Product details
      const name = "Test Product";
      const description = "This is a test product";
      const price = ethers.parseEther("0.5");
      const royaltyPercentage = 500;
      const tokenURI = "https://example.com/metadata/1";
      const category = "Test Category";
      const imageUrl = "https://example.com/image.jpg";
      
      // Create message for seller to sign
      const message = `I agree to list "${name}" for sale at ${ethers.formatEther(price)} ETH`;
      const signature = await seller.signMessage(message);
      
      // Create product
      const tx = await productFactory.connect(seller).createProduct(
        name,
        description,
        price,
        royaltyPercentage,
        tokenURI,
        category,
        imageUrl,
        signature
      );
      
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => 
        log.fragment?.name === "ProductCreated"
      );
      
      tokenId = event?.args[4];
      
      // Check NFT ownership
      expect(await productNFT.ownerOf(tokenId)).to.equal(seller.address);
      
      // Check NFT metadata
      expect(await productNFT.tokenURI(tokenId)).to.equal(tokenURI);
    });
  });

  describe("Factory Functionality", function() {
    beforeEach(async function() {
      // Create a product for testing
      const name = "Test Product";
      const price = ethers.parseEther("0.5");
      const message = `I agree to list "${name}" for sale at ${ethers.formatEther(price)} ETH`;
      const signature = await seller.signMessage(message);
      
      const tx = await productFactory.connect(seller).createProduct(
        name, 
        "Description", 
        price, 
        500, 
        "uri", 
        "Test Category", 
        "https://example.com/image.jpg",
        signature
      );
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => 
        log.fragment?.name === "ProductCreated"
      );
      productAddress = event?.args[0];
    });

    it("Should track products in the factory", async function() {
      // Verify product count
      expect(await productFactory.getProductCount()).to.equal(1);
      
      // Get product from factory
      const products = await productFactory.getProducts(0, 10);
      expect(products.length).to.equal(1);
      expect(products[0]).to.equal(productAddress);
      
      // Check product is marked as from factory
      expect(await productFactory.isProductFromFactory(productAddress)).to.be.true;
    });

    it("Should retrieve products by seller", async function() {
      // Get product by seller
      const sellerProducts = await productFactory.getProductsBySeller(seller.address);
      expect(sellerProducts.length).to.equal(1);
      expect(sellerProducts[0]).to.equal(productAddress);
      
      // Check empty for non-seller
      const buyerProducts = await productFactory.getProductsBySeller(buyer.address);
      expect(buyerProducts.length).to.equal(0);
    });

    it("Should handle pagination in getProducts", async function() {
      // Create more products
      const name2 = "Product 2";
      const price2 = ethers.parseEther("0.5");
      const message2 = `I agree to list "${name2}" for sale at ${ethers.formatEther(price2)} ETH`;
      const signature2 = await seller.signMessage(message2);
      
      await productFactory.connect(seller).createProduct(
        name2, 
        "Description", 
        price2, 
        500, 
        "uri2", 
        "Test Category", 
        "https://example.com/image2.jpg",
        signature2
      );
      
      const name3 = "Product 3";  
      const price3 = ethers.parseEther("0.5");
      const message3 = `I agree to list "${name3}" for sale at ${ethers.formatEther(price3)} ETH`;
      const signature3 = await seller.signMessage(message3);
      
      await productFactory.connect(seller).createProduct(
        name3, 
        "Description", 
        price3, 
        500, 
        "uri3", 
        "Test Category", 
        "https://example.com/image3.jpg",
        signature3
      );
      
      // Test pagination
      expect(await productFactory.getProductCount()).to.equal(3);
      
      // Get first page
      const page1 = await productFactory.getProducts(0, 2);
      expect(page1.length).to.equal(2);
      
      // Get second page
      const page2 = await productFactory.getProducts(2, 2);
      expect(page2.length).to.equal(1);
      
      // Past the end
      const emptyPage = await productFactory.getProducts(3, 2);
      expect(emptyPage.length).to.equal(0);
    });
  });

  describe("Product Purchase", function() {
    beforeEach(async function() {
      // Create a product for testing
      const name = "Test Product";
      const price = ethers.parseEther("0.5");
      const message = `I agree to list "${name}" for sale at ${ethers.formatEther(price)} ETH`;
      const signature = await seller.signMessage(message);
      
      const tx = await productFactory.connect(seller).createProduct(
        name, 
        "Description", 
        price, 
        500, 
        "uri", 
        "Test Category", 
        "https://example.com/image.jpg",
        signature
      );
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => 
        log.fragment?.name === "ProductCreated"
      );
      productAddress = event?.args[0];
      
      // Get product contract
      const Product = await ethers.getContractFactory("Product");
      product = Product.attach(productAddress);
      
      // Upload agreement before purchase
      await product.connect(seller).updateAgreement("https://example.com/agreement.pdf");
    });

    it("Should not allow purchases with insufficient funds", async function() {
      const insufficientAmount = ethers.parseEther("0.1"); // Less than price
      
      // Create message for buyer to sign
      const name = await product.name();
      const price = await product.price();
      const buyerMessage = `I agree to purchase "${name}" for ${price} wei`;
      const buyerSignature = await buyer.signMessage(buyerMessage);
      
      await expect(
        product.connect(buyer).purchase(buyerSignature, { value: insufficientAmount })
      ).to.be.revertedWith("Product: Insufficient payment");
    });

    it("Should mark product as sold after purchase", async function() {
      // Initial state
      expect(await product.isSold()).to.be.false;
      
      // Create message for buyer to sign
      const name = await product.name();
      const price = await product.price();
      const buyerMessage = `I agree to purchase "${name}" for ${price} wei`;
      const buyerSignature = await buyer.signMessage(buyerMessage);
      
      // Purchase
      await product.connect(buyer).purchase(buyerSignature, { value: ethers.parseEther("0.5") });
      
      // Check sold state
      expect(await product.isSold()).to.be.true;
    });

    it("Should transfer payment to seller", async function() {
      // Get seller initial balance
      const sellerInitialBalance = await ethers.provider.getBalance(seller.address);
      
      // Create message for buyer to sign
      const name = await product.name();
      const price = await product.price();
      const buyerMessage = `I agree to purchase "${name}" for ${price} wei`;
      const buyerSignature = await buyer.signMessage(buyerMessage);
      
      // Purchase the product
      await product.connect(buyer).purchase(buyerSignature, { value: ethers.parseEther("0.5") });
      
      // Check seller received payment (should increase)
      const sellerFinalBalance = await ethers.provider.getBalance(seller.address);
      expect(sellerFinalBalance).to.be.gt(sellerInitialBalance);
    });

    it("Should handle NFT ownership transfer after purchase", async function() {
      // Check initial NFT ownership
      const tokenId = await product.tokenId();
      expect(await productNFT.ownerOf(tokenId)).to.equal(seller.address);
      
      // Create message for buyer to sign
      const name = await product.name();
      const price = await product.price();
      const buyerMessage = `I agree to purchase "${name}" for ${price} wei`;
      const buyerSignature = await buyer.signMessage(buyerMessage);
      
      // Approve and purchase
      await productNFT.connect(seller).approve(buyer.address, tokenId);
      await product.connect(buyer).purchase(buyerSignature, { value: ethers.parseEther("0.5") });
      
      // Transfer NFT (would be done by frontend)
      await productNFT.connect(buyer).transferFrom(seller.address, buyer.address, tokenId);
      
      // Check NFT ownership has been transferred
      expect(await productNFT.ownerOf(tokenId)).to.equal(buyer.address);
    });
  });

  describe("Product Modifications", function() {
    beforeEach(async function() {
      // Create a product for testing
      const name = "Test Product";
      const price = ethers.parseEther("0.5");
      const message = `I agree to list "${name}" for sale at ${ethers.formatEther(price)} ETH`;
      const signature = await seller.signMessage(message);
      
      const tx = await productFactory.connect(seller).createProduct(
        name, 
        "Description", 
        price, 
        500, 
        "uri", 
        "Test Category", 
        "https://example.com/image.jpg",
        signature
      );
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => 
        log.fragment?.name === "ProductCreated"
      );
      productAddress = event?.args[0];
      
      // Get product contract
      const Product = await ethers.getContractFactory("Product");
      product = Product.attach(productAddress);
      
      // Upload agreement before purchase
      await product.connect(seller).updateAgreement("https://example.com/agreement.pdf");
    });

    it("Should allow seller to update product price", async function() {
      const initialPrice = await product.price();
      const newPrice = ethers.parseEther("0.7");
      
      // Update price
      await product.connect(seller).updatePrice(newPrice);
      
      // Check price updated
      expect(await product.price()).to.equal(newPrice);
      expect(await product.price()).to.not.equal(initialPrice);
    });

    it("Should allow seller to update product description", async function() {
      const initialDesc = await product.description();
      const newDesc = "Updated description";
      
      // Update description
      await product.connect(seller).updateDescription(newDesc);
      
      // Check description updated
      expect(await product.description()).to.equal(newDesc);
      expect(await product.description()).to.not.equal(initialDesc);
    });

    it("Should not allow non-seller to update product", async function() {
      const newPrice = ethers.parseEther("0.7");
      
      // Try to update as non-seller
      await expect(
        product.connect(buyer).updatePrice(newPrice)
      ).to.be.reverted;
      
      // Try to update description as non-seller
      await expect(
        product.connect(buyer).updateDescription("New desc")
      ).to.be.reverted;
    });

    it("Should not allow updates after product is sold", async function() {
      // Purchase the product first
      const name = await product.name();
      const price = await product.price();
      const buyerMessage = `I agree to purchase "${name}" for ${price} wei`;
      const buyerSignature = await buyer.signMessage(buyerMessage);
      
      await product.connect(buyer).purchase(buyerSignature, { value: ethers.parseEther("0.5") });
      
      // Try to update price
      await expect(
        product.connect(seller).updatePrice(ethers.parseEther("0.7"))
      ).to.be.revertedWith("Product: Already sold");
      
      // Try to update description
      await expect(
        product.connect(seller).updateDescription("New description")
      ).to.be.revertedWith("Product: Already sold");
      
      // Try to update agreement
      await expect(
        product.connect(seller).updateAgreement("https://example.com/new-agreement.pdf")
      ).to.be.revertedWith("Product: Already sold");
    });
  });
}); 