import { Card, CardContent, CardFooter, CardTitle } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { ipfsToHttp } from '@/app/utils/ipfs';
import { getExplorerLink } from '@/app/utils/config';

export type Purchase = {
  id: number;
  title: string;
  price: string;
  seller: string;
  purchaseDate: string;
  status: 'Completed' | 'Pending' | 'Failed';
  transactionHash: string;
  productAddress: string;
  ipfsHash?: string;
  category?: string;
  description?: string;
};

type PurchaseCardProps = {
  purchase: Purchase;
  className?: string;
};

export function PurchaseCard({ purchase, className = '' }: PurchaseCardProps) {
  const statusColors = {
    Completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    Pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Failed: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <Card variant="hover" className={`${className}`}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <div>
          <CardTitle className="mb-2">{purchase.title}</CardTitle>
          <p className="text-white/70">Purchase Date: {purchase.purchaseDate}</p>
          
          {purchase.category && (
            <div className="mt-2">
              <span className="inline-block px-2 py-1 bg-blue-900/20 text-blue-400 text-xs rounded">
                {purchase.category}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-white bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 rounded-lg text-sm font-medium mb-2">
            {purchase.price}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[purchase.status]}`}>
            {purchase.status}
          </span>
        </div>
      </div>
      
      {purchase.description && (
        <div className="mb-4 px-4">
          <p className="text-white/70">{purchase.description}</p>
        </div>
      )}
      
      {purchase.ipfsHash && (
        <div className="mb-4 mx-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-center text-blue-400">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <a 
              href={ipfsToHttp(purchase.ipfsHash)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
            >
              View Agreement Document
            </a>
          </div>
        </div>
      )}
      
      <CardContent className="rounded-lg border border-white/5 bg-white/5 backdrop-blur-sm p-4 mb-5">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-3">
          <div>
            <p className="text-white/50 text-sm">Seller</p>
            <a 
              href={getExplorerLink(purchase.seller)}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/90 font-mono hover:text-blue-400"
            >
              {purchase.seller}
            </a>
          </div>
          <div>
            <p className="text-white/50 text-sm">Product Contract</p>
            <a 
              href={getExplorerLink(purchase.productAddress)}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/90 font-mono hover:text-blue-400"
            >
              {`${purchase.productAddress.slice(0, 6)}...${purchase.productAddress.slice(-4)}`}
            </a>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        {purchase.ipfsHash ? (
          <a 
            href={ipfsToHttp(purchase.ipfsHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button 
              variant="primary" 
              className="w-full"
            >
              Download Agreement
            </Button>
          </a>
        ) : (
          <Button 
            variant="primary" 
            className="flex-1"
            disabled
          >
            Download Agreement
          </Button>
        )}
        <Button 
          href={`/dashboard/product/${purchase.id}`}
          variant="outline" 
          className="flex-1"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
} 