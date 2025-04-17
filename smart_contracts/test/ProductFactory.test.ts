import { expect } from "chai";
import { ethers } from "hardhat";

describe("ProductFactory", function () {
  let productFactory: any;
  let productNFT: any;
  let owner: any;
  let seller: any;
  let buyer: any;
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

      // Create product
      const tx = await productFactory.connect(seller).createProduct(
        name,
        description,
        price,
        royaltyPercentage,
        tokenURI
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
    });

    it("Should mint an NFT when creating a product", async function() {
      // Product details
      const name = "Test Product";
      const description = "This is a test product";
      const price = ethers.parseEther("0.5");
      const royaltyPercentage = 500;
      const tokenURI = "https://example.com/metadata/1";

      // Create product
      const tx = await productFactory.connect(seller).createProduct(
        name, description, price, royaltyPercentage, tokenURI
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
      const tx = await productFactory.connect(seller).createProduct(
        "Test Product", "Description", ethers.parseEther("0.5"), 500, "uri"
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
      await productFactory.connect(seller).createProduct(
        "Product 2", "Description", ethers.parseEther("0.5"), 500, "uri2"
      );
      
      await productFactory.connect(seller).createProduct(
        "Product 3", "Description", ethers.parseEther("0.5"), 500, "uri3"
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
      const tx = await productFactory.connect(seller).createProduct(
        "Test Product", "Description", ethers.parseEther("0.5"), 500, "uri"
      );
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => 
        log.fragment?.name === "ProductCreated"
      );
      productAddress = event?.args[0];
      tokenId = event?.args[4];
      
      // Get product contract
      const Product = await ethers.getContractFactory("Product");
      product = Product.attach(productAddress);
    });

    it("Should not allow purchases with insufficient funds", async function() {
      const insufficientAmount = ethers.parseEther("0.1"); // Less than price
      
      await expect(
        product.connect(buyer).purchase({ value: insufficientAmount })
      ).to.be.revertedWith("Product: Insufficient payment");
    });

    it("Should mark product as sold after purchase", async function() {
      // Initial state
      expect(await product.isSold()).to.be.false;
      
      // Purchase
      await product.connect(buyer).purchase({ value: ethers.parseEther("0.5") });
      
      // Check sold state
      expect(await product.isSold()).to.be.true;
    });

    it("Should transfer payment to seller", async function() {
      // Get seller initial balance
      const sellerInitialBalance = await ethers.provider.getBalance(seller.address);
      
      // Purchase the product
      await product.connect(buyer).purchase({ value: ethers.parseEther("0.5") });
      
      // Check seller received payment (should increase)
      const sellerFinalBalance = await ethers.provider.getBalance(seller.address);
      expect(sellerFinalBalance).to.be.gt(sellerInitialBalance);
    });

    it("Should handle NFT ownership transfer after purchase", async function() {
      // Check initial NFT ownership
      expect(await productNFT.ownerOf(tokenId)).to.equal(seller.address);
      
      // Approve and purchase
      await productNFT.connect(seller).approve(buyer.address, tokenId);
      await product.connect(buyer).purchase({ value: ethers.parseEther("0.5") });
      
      // Transfer NFT (would be done by frontend)
      await productNFT.connect(buyer).transferFrom(seller.address, buyer.address, tokenId);
      
      // Check NFT ownership has been transferred
      expect(await productNFT.ownerOf(tokenId)).to.equal(buyer.address);
    });
  });

  describe("Product Modifications", function() {
    beforeEach(async function() {
      // Create a product for testing
      const tx = await productFactory.connect(seller).createProduct(
        "Test Product", "Description", ethers.parseEther("0.5"), 500, "uri"
      );
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => 
        log.fragment?.name === "ProductCreated"
      );
      productAddress = event?.args[0];
      
      // Get product contract
      const Product = await ethers.getContractFactory("Product");
      product = Product.attach(productAddress);
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
      // Purchase the product
      await product.connect(buyer).purchase({ value: ethers.parseEther("0.5") });
      
      // Try to update after sold
      await expect(
        product.connect(seller).updatePrice(ethers.parseEther("0.7"))
      ).to.be.revertedWith("Product: Already sold");
      
      await expect(
        product.connect(seller).updateDescription("New desc")
      ).to.be.revertedWith("Product: Already sold");
    });
  });
}); 