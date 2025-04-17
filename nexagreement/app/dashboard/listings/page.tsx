import { PageHeader } from '@/app/components/ui/PageHeader';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { ListingItemCard, UserListing } from './components/ListingItemCard';

export default function MyListings() {
  // Mock data for user's listings
  const myListings: UserListing[] = [
    {
      id: 1,
      title: "Employment Contract Template",
      price: "0.6 ETH",
      description: "Adaptable employment contract with all legal requirements included.",
      createdAt: "2 weeks ago",
      status: "Active",
      views: 24,
      sales: 3
    },
    {
      id: 2,
      title: "Partnership Agreement",
      price: "1.5 ETH",
      description: "Comprehensive partnership contract for new business ventures.",
      createdAt: "1 month ago",
      status: "Active",
      views: 47,
      sales: 5
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Your Listings" 
        description="Manage your published legal agreements"
        action={{
          label: "Create New Listing",
          href: "/dashboard/create-listing"
        }}
      />

      {myListings.length > 0 ? (
        <div className="space-y-6">
          {myListings.map(listing => (
            <ListingItemCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="You don't have any listings yet"
          description="Create your first listing to start selling your legal agreements"
          action={{
            label: "Create Your First Listing",
            href: "/dashboard/create-listing"
          }}
        />
      )}
    </div>
  );
} 