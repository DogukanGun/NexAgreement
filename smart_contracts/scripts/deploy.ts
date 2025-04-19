import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contracts to Flare Coston2 testnet (chain ID 114)...");

  // Get the contract factory
  const ProductFactory = await ethers.getContractFactory("ProductFactory");
  
  // Deploy the contract
  console.log("Deploying ProductFactory...");
  const productFactory = await ProductFactory.deploy();

  // Wait for deployment to finish
  await productFactory.waitForDeployment();
  
  // Get the deployed contract address
  const productFactoryAddress = await productFactory.getAddress();
  console.log(`ProductFactory deployed to: ${productFactoryAddress}`);


  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log(`Network: Flare Coston2 Testnet`);
  console.log(`ProductFactory: ${productFactoryAddress}`);
  console.log("\nMake sure to update your frontend configuration with these addresses!");
  console.log("\nTo verify contracts:");
  console.log(`npx hardhat verify --network flareCoston2 ${productFactoryAddress}`);
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  }); 