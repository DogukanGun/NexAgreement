import Image from 'next/image';
import Link from 'next/link';



export default async function ProductDetails() {
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/dashboard/marketplace" className="text-blue-600 hover:underline">
              ← Back to Marketplace
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src="/product-placeholder.jpg"
                    alt="Product"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-500"
                    >
                      <Image
                        src="/product-placeholder.jpg"
                        alt={`Product view ${i}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Product Name</h1>
                  <p className="text-gray-600">
                    Listed by{" "}
                    <span className="text-blue-600">0x1234...5678</span>
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">0.5 ETH</span>
                    <span className="text-gray-500">≈ $900 USD</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">Description</h2>
                  <p className="text-gray-600">
                    Detailed product description will go here. This should explain
                    what the product is, its condition, and any other relevant
                    details that a buyer would want to know.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">Smart Contract Details</h2>
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contract Address</span>
                      <span className="font-mono text-blue-600">0x1234...5678</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Token ID</span>
                      <span className="font-mono">#1234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Royalty</span>
                      <span>5%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition mb-4">
                    Purchase Now
                  </button>
                  <div className="text-sm text-gray-500 text-center">
                    By purchasing, you agree to our{" "}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      Terms of Service
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Process */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-6">How the Purchase Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Initiate Purchase</h3>
                  <p className="text-gray-600 text-sm">
                    Connect your wallet and confirm the transaction
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Smart Contract Execution</h3>
                  <p className="text-gray-600 text-sm">
                    The contract handles the secure transfer of assets
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Transfer Complete</h3>
                  <p className="text-gray-600 text-sm">
                    Receive your NFT and product ownership rights
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 