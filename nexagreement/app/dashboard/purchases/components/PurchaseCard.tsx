import Link from 'next/link';
import { Card, CardContent, CardFooter, CardTitle } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';

export type Purchase = {
  id: number;
  title: string;
  price: string;
  seller: string;
  purchaseDate: string;
  status: 'Completed' | 'Pending' | 'Failed';
  transactionHash: string;
};

type PurchaseCardProps = {
  purchase: Purchase;
  className?: string;
};

export function PurchaseCard({ purchase, className = '' }: PurchaseCardProps) {
  const statusColors = {
    Completed: 'bg-green-500/20 text-green-400',
    Pending: 'bg-yellow-500/20 text-yellow-400',
    Failed: 'bg-red-500/20 text-red-400'
  };

  return (
    <Card className={className}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <CardTitle className="mb-2">{purchase.title}</CardTitle>
          <p className="text-white/70">Purchase Date: {purchase.purchaseDate}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-white bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 rounded-lg text-sm font-medium mb-2">
            {purchase.price}
          </span>
          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${statusColors[purchase.status]}`}>
            {purchase.status}
          </span>
        </div>
      </div>
      
      <CardContent className="bg-white/5 rounded-xl p-4 mb-5">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-3">
          <div>
            <p className="text-white/50 text-sm">Seller</p>
            <p className="text-white/90">{purchase.seller}</p>
          </div>
          <div>
            <p className="text-white/50 text-sm">Transaction Hash</p>
            <p className="text-white/90">{purchase.transactionHash}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="primary" className="flex-1">Download Agreement</Button>
      </CardFooter>
    </Card>
  );
} 