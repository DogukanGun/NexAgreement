import Link from 'next/link';
import { Card, CardTitle, CardDescription, CardFooter } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';

export type Listing = {
  id: number;
  title: string;
  price: string;
  description: string;
  seller: string;
  createdAt: string;
  category?: string;
};

type ListingCardProps = {
  listing: Listing;
  showCategory?: boolean;
  className?: string;
};

export function ListingCard({ listing, showCategory = false, className = '' }: ListingCardProps) {
  return (
    <Card className={className}>
      <div className="flex justify-between items-start mb-4">
        {showCategory && listing.category ? (
          <span className="px-3 py-1 bg-white/10 text-white/70 rounded-full text-xs">
            {listing.category}
          </span>
        ) : (
          <CardTitle>{listing.title}</CardTitle>
        )}
        <span className="text-white bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 rounded-lg text-sm font-medium">
          {listing.price}
        </span>
      </div>
      
      {showCategory && <CardTitle className="mb-2">{listing.title}</CardTitle>}
      <CardDescription className="mb-6">{listing.description}</CardDescription>
      
      <div className="flex justify-between items-center text-sm text-white/50 mb-5">
        <span>Seller: {listing.seller}</span>
        <span>{listing.createdAt}</span>
      </div>
      
      <CardFooter>
        <Link href={`/dashboard/marketplace/${listing.id}`} className="flex-1">
          <button className="w-full bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl py-2 transition-colors">
            View Details
          </button>
        </Link>
        <Button className="flex-1">Purchase</Button>
      </CardFooter>
    </Card>
  );
} 