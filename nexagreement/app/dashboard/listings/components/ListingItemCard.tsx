import Link from 'next/link';
import { Card, CardTitle, CardDescription, CardContent, CardFooter } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';

export type UserListing = {
  id: number;
  title: string;
  price: string;
  description: string;
  createdAt: string;
  status: string;
  views: number;
  sales: number;
};

type ListingItemCardProps = {
  listing: UserListing;
  className?: string;
};

export function ListingItemCard({ listing, className = '' }: ListingItemCardProps) {
  return (
    <Card className={className}>
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <CardTitle>{listing.title}</CardTitle>
            <span className="text-white bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 rounded-lg text-sm font-medium">
              {listing.price}
            </span>
          </div>
          <CardDescription className="mb-4">{listing.description}</CardDescription>
          
          <CardContent className="grid grid-cols-3 gap-4 mb-6 p-0">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-sm text-white/50 mb-1">Status</p>
              <p className="text-white font-medium">{listing.status}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-sm text-white/50 mb-1">Views</p>
              <p className="text-white font-medium">{listing.views}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-sm text-white/50 mb-1">Sales</p>
              <p className="text-white font-medium">{listing.sales}</p>
            </div>
          </CardContent>
          
          <CardFooter className="p-0 flex-wrap">
            <Button 
              href={`/dashboard/listings/${listing.id}/edit`} 
              variant="secondary" 
              className="mr-3"
            >
              Edit Listing
            </Button>
            <Button 
              href={`/dashboard/marketplace/${listing.id}`} 
              variant="secondary" 
              className="mr-3"
            >
              View on Marketplace
            </Button>
            <Button variant="danger">
              Delist
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
} 