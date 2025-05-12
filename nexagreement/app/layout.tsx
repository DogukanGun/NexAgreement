import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Connector from "./components/Connector";
import { WagmiProvider } from './providers/WagmiProvider';
import { BlockchainProvider } from './providers/BlockchainProvider';
import { CivicAuthProvider } from "@civic/auth-web3/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NexAgreement - Secure Product Trading with Smart Contracts",
  description: "List and trade products securely using smart contracts and NFTs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiProvider>
          <BlockchainProvider>
          <CivicAuthProvider>
            <Navbar />
            <div className="pt-16">
              <Connector>
                {children}
              </Connector>
            </div>
            </CivicAuthProvider>
          </BlockchainProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
