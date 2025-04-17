'use client'
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-3xl animate-pulse -top-48 -left-24" />
          <div className="absolute w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000 top-48 -right-24" />
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-8 animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                The Future of Product Trading is Here
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                Transform your products into smart contract-backed NFTs. Experience secure, 
                trustless trading with instant ownership transfer and automated payments.
              </p>
              <div className="pt-8">
                <Link
                  href="/dashboard"
                  className="relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl transition-all duration-400 ease-in-out hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(79,70,229,0.3)]"
                >
                  <span className="relative z-10">Launch App</span>
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                </Link>
              </div>
            </div>
            <div className="flex-1 relative animate-float">
              <div className="relative w-full aspect-square max-w-[600px] mx-auto">
                <Image
                  src="/hero-illustration.svg"
                  alt="Platform illustration"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-24 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Revolutionary Features
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="relative bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 hover:bg-gray-800/80 transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl opacity-0 -hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-16 h-16 mb-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl -top-96 -right-96" />
          <div className="absolute w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl bottom-0 -left-48" />
        </div>
        
        <div className="container mx-auto px-6 relative">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-24 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            How It Works
          </h2>
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform -translate-y-1/2" />
            <div className="grid md:grid-cols-3 gap-16 relative">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="relative bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 hover:bg-gray-800/80 transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xl font-bold">
                    {index + 1}
                  </div>
                  <div className="pt-6">
                    <h3 className="text-xl font-semibold mb-4 text-white">{step.title}</h3>
                    <p className="text-gray-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const features = [
  {
    title: 'Smart Contract Security',
    description: 'Every transaction is protected by audited smart contracts, ensuring complete security and transparency.',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: 'NFT Ownership',
    description: 'Products are represented as unique NFTs, providing verifiable proof of ownership and authenticity.',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
      </svg>
    ),
  },
  {
    title: 'Instant Transfers',
    description: 'Experience seamless ownership transfers and instant payments in a single transaction.',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

const steps = [
  {
    title: 'Connect & List',
    description: 'Connect your wallet and create your product listing with detailed information and images.',
  },
  {
    title: 'Smart Contract Creation',
    description: 'Your product is automatically tokenized as an NFT with a secure smart contract.',
  },
  {
    title: 'Secure Trading',
    description: 'Buyers can purchase your product with instant ownership transfer and secure payment.',
  },
];
