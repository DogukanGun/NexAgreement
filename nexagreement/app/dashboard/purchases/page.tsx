import Link from 'next/link';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Select } from '@/app/components/ui/Input';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { PurchaseCard, Purchase } from './components/PurchaseCard';

export default function MyPurchases() {
  // Mock data for purchases
  const purchases: Purchase[] = [
    {
      id: 101,
      title: "Premium Commercial Agreement",
      price: "2.5 ETH",
      seller: "0x1234...5678",
      purchaseDate: "May 15, 2024",
      status: "Completed",
      transactionHash: "0x8a12...3f9b"
    },
    {
      id: 102,
      title: "Standard Rental Agreement",
      price: "0.8 ETH",
      seller: "0x8765...4321",
      purchaseDate: "May 10, 2024",
      status: "Completed",
      transactionHash: "0x3d5f...9c2a"
    },
    {
      id: 103,
      title: "Employment Contract Template",
      price: "0.6 ETH",
      seller: "0x3691...2580",
      purchaseDate: "May 5, 2024",
      status: "Pending",
      transactionHash: "0x7b2e...1d4c"
    }
  ];
  
  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Purchases' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' }
  ];
  
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'price-low', label: 'Price: Low to High' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Your Purchases" 
        description="View and manage your purchased agreements"
        action={{
          label: "Browse Marketplace",
          href: "/dashboard/marketplace"
        }}
      />

      {purchases.length > 0 ? (
        <div>
          <div className="mb-8 flex items-center">
            <div className="flex gap-4">
              <Select options={statusOptions} />
              <Select options={sortOptions} />
            </div>
          </div>

          <div className="space-y-6">
            {purchases.map((purchase) => (
              <PurchaseCard 
                key={purchase.id} 
                purchase={purchase} 
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="You haven't made any purchases yet"
          description="Browse the marketplace to find legal agreements"
          action={{
            label: "Explore Marketplace",
            href: "/dashboard/marketplace"
          }}
        />
      )}
    </div>
  );
} 