import { PageHeader } from '@/app/components/ui/PageHeader';
import { Button } from '@/app/components/ui/Button';
import { StatCard } from './components/StatCard';
import { ActivityItem, Activity } from './components/ActivityItem';
import { ProductCount } from '../components/ui/ProductCount';

export default function Dashboard() {
  // Mock data for statistics
  const stats = [
    { title: "Available Listings", value: "142", link: "/dashboard/marketplace" },
    { title: "Your Purchases", value: "3", link: "/dashboard/purchases" },
    { title: "Wallet Balance", value: "5.8 ETH", link: "#" },
    { title: "Total Value Locked", value: "235.7 ETH", link: "#" }
  ];

  // Mock data for recent activity
  const activities: Activity[] = [
    { 
      id: 1, 
      type: "purchase", 
      title: "Standard Rental Agreement", 
      date: "2 days ago", 
      price: "0.8 ETH",
      link: "/dashboard/purchases/102"
    },
    { 
      id: 2, 
      type: "listing-created", 
      title: "Employment Contract Template", 
      date: "1 week ago", 
      price: "0.6 ETH",
      link: "/dashboard/listings/4"
    },
    { 
      id: 3, 
      type: "transaction", 
      title: "Funds Deposited", 
      date: "2 weeks ago", 
      value: "+2.0 ETH",
      link: "#"
    }
  ];

  return (
    <div className="w-full">
      <PageHeader 
        title="Dashboard" 
        description="Manage your agreements and transactions" 
      />

      {/* Top Section with Stats and Blockchain Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        {/* Blockchain Status */}
        <div className="lg:col-span-3 xl:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-white/90">Blockchain Status</h2>
          <div className="h-[220px]">
            <ProductCount />
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="lg:col-span-9 xl:col-span-10">
          <h2 className="text-xl font-semibold mb-4 text-white/90 lg:opacity-0">Stats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 h-[220px]">
            {stats.map((stat, index) => (
              <StatCard 
                key={index}
                title={stat.title}
                value={stat.value}
                href={stat.link}
                className="h-full"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-white">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button href="/dashboard/marketplace" variant="primary">
            Browse Marketplace
          </Button>
          <Button href="/dashboard/create-listing" variant="secondary">
            Create New Listing
          </Button>
          <Button href="/dashboard/purchases" variant="outline">
            View Purchases
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-white">Recent Activity</h2>
        <div className="space-y-4 max-w-4xl">
          {activities.map((activity) => (
            <ActivityItem 
              key={activity.id}
              activity={activity}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 