import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ProductFactoryModule", (m) => {
  const productFactory = m.contract("ProductFactory", []);
  return { productFactory };
}); 