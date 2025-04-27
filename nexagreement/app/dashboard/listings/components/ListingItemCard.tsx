import { Card, CardTitle, CardDescription, CardContent, CardFooter } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { getExplorerLink } from '@/app/utils/config';
import { useState, useEffect } from 'react';

// Client-side implementation of ipfsToHttp
const clientIpfsToHttp = (ipfsUrl: string): string => {
  if (!ipfsUrl) return '';
  return ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
};

export type UserListing = {
  id: number;
  title: string;
  price: string;
  description: string;
  createdAt: string;
  status: string;
  views: number;
  sales: number;
  category: string;
  ipfsHash: string;
  address: string;
};

type ListingItemCardProps = {
  listing: UserListing;
  className?: string;
};

export function ListingItemCard({ listing, className = '' }: ListingItemCardProps) {
  const statusColors = {
    'Active': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Sold': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Inactive': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  };

  const statusColor = statusColors[listing.status as keyof typeof statusColors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  const ipfsHttpUrl = clientIpfsToHttp(listing.ipfsHash);

  return (
    <Card variant="hover" className={className}>
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <CardTitle>{listing.title}</CardTitle>
              <div className="text-white/50 text-sm mt-1">Created {listing.createdAt}</div>
              <div className="inline-block px-2 py-1 bg-blue-900/20 text-blue-400 text-xs rounded mt-2">
                {listing.category}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-white bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 rounded-lg text-sm font-medium mb-2">
                {listing.price}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                {listing.status}
              </span>
            </div>
          </div>
          <CardDescription className="mb-4">{listing.description}</CardDescription>
          
          {listing.ipfsHash && (
            <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center text-blue-400">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
            </div>
          )}
          
          <CardContent className="grid grid-cols-3 gap-4 mb-6 p-0">
            <div className="rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm p-3 text-center">
              <p className="text-sm text-white/50 mb-1">Status</p>
              <p className="text-white font-medium">{listing.status}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm p-3 text-center">
              <p className="text-sm text-white/50 mb-1">Views</p>
              <p className="text-white font-medium">{listing.views}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm p-3 text-center">
              <p className="text-sm text-white/50 mb-1">Sales</p>
              <p className="text-white font-medium">{listing.sales}</p>
            </div>
          </CardContent>
          
          <div className="text-xs text-white/50 mb-4">
            <div>Contract Address:</div>
            <a 
              href={getExplorerLink(listing.address)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-mono hover:text-blue-400"
            >
              {listing.address}
            </a>
          </div>
          
          <CardFooter className="p-0 flex-wrap gap-3">
            <Button 
              href={`/dashboard/product/${listing.id}`} 
              variant="primary"
            >
              View Details
            </Button>
            <Button 
              href={`/dashboard/marketplace`} 
              variant="secondary"
            >
              View on Marketplace
            </Button>
            <Button 
              variant="outline" 
              className="text-red-400 border-red-500/30 hover:bg-red-500/10"
              disabled={listing.status === "Sold"}
            >
              {listing.status === "Sold" ? "Sold" : "Delist"}
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
} 