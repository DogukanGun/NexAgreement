import { PageHeader } from '@/app/components/ui/PageHeader';
import { Button } from '@/app/components/ui/Button';
import { StatCard } from './components/StatCard';
import { ActivityItem, Activity } from './components/ActivityItem';

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
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Dashboard" 
        description="Manage your agreements and transactions" 
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <StatCard 
            key={index}
            title={stat.title}
            value={stat.value}
            href={stat.link}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6 text-white">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button href="/dashboard/marketplace">
            Browse Marketplace
          </Button>
          <Button href="/dashboard/create-listing" variant="secondary">
            Create New Listing
          </Button>
          <Button href="/dashboard/purchases" variant="secondary">
            View Purchases
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-white">Recent Activity</h2>
        <div className="space-y-4">
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