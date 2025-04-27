import Link from 'next/link';
import { Button } from '@/app/components/ui/Button';
// import { ipfsToHttp } from '@/app/utils/ipfs';

// Client-side implementation of ipfsToHttp
const clientIpfsToHttp = (ipfsUrl: string): string => {
  if (!ipfsUrl) return '';
  return ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
};

export type Listing = {
  id: number;
  title: string;
  price: string;
  description: string;
  seller: string;
  createdAt: string;
  category: string;
  ipfsHash: string;
};

export function ListingCard({ 
  listing, 
  showCategory = false 
}: { 
  listing: Listing;
  showCategory?: boolean;
}) {
  const ipfsHttpUrl = clientIpfsToHttp(listing.ipfsHash);
  
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-colors">
      <div className="p-6">
        {showCategory && (
          <div className="mb-2">
            <span className="inline-block bg-blue-900/20 text-blue-400 text-xs px-2 py-1 rounded">
              {listing.category}
            </span>
          </div>
        )}
        
        <h3 className="text-xl font-semibold mb-2">
          <Link href={`/dashboard/product/${listing.id}`} className="hover:text-blue-500 transition-colors">
            {listing.title}
          </Link>
        </h3>
        
        <p className="text-white/70 mb-4 line-clamp-2">
          {listing.description}
        </p>
        
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-semibold">{listing.price}</div>
          <div className="text-white/50 text-sm">{listing.createdAt}</div>
        </div>
        
        <div className="text-xs text-white/50 mb-4">
          Seller: {listing.seller}
        </div>
        
        {listing.ipfsHash && (
          <div className="mb-4 flex items-center text-xs text-blue-400">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <a 
              href={ipfsHttpUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
            >
              View Document
            </a>
          </div>
        )}
        
        <Button 
          href={`/dashboard/product/${listing.id}`}
          className="w-full"
          variant="secondary"
        >
          View Details
        </Button>
      </div>
    </div>
  );
} 