import { PageHeader } from '@/app/components/ui/PageHeader';
import { Button } from '@/app/components/ui/Button';
import { Select } from '@/app/components/ui/Input';
import { ListingCard, Listing } from './components/ListingCard';
import { CategoryCard } from './components/CategoryCard';

export default function Marketplace() {
  // Mock data for marketplace listings
  const listings: Listing[] = [
    {
      id: 1,
      title: "Premium Commercial Agreement",
      price: "2.5 ETH",
      description: "High-value commercial contract with comprehensive terms and conditions.",
      seller: "0x1234...5678",
      createdAt: "2 days ago",
      category: "Commercial"
    },
    {
      id: 2,
      title: "Standard Rental Agreement",
      price: "0.8 ETH",
      description: "Legally vetted rental agreement template with customizable terms.",
      seller: "0x8765...4321",
      createdAt: "5 days ago",
      category: "Rental"
    },
    {
      id: 3,
      title: "Partnership Agreement",
      price: "1.5 ETH",
      description: "Comprehensive partnership contract for new business ventures.",
      seller: "0x2468...1357",
      createdAt: "1 week ago",
      category: "Partnership"
    },
    {
      id: 4,
      title: "Employment Contract Template",
      price: "0.6 ETH",
      description: "Adaptable employment contract with all legal requirements included.",
      seller: "0x3691...2580",
      createdAt: "2 weeks ago",
      category: "Employment"
    },
    {
      id: 5,
      title: "SaaS Service Agreement",
      price: "1.8 ETH",
      description: "Complete SaaS service agreement with data protection clauses.",
      seller: "0x5792...1634",
      createdAt: "2 weeks ago",
      category: "Commercial"
    },
    {
      id: 6,
      title: "Real Estate Purchase Contract",
      price: "3.0 ETH",
      description: "Comprehensive real estate purchase agreement with legal validity.",
      seller: "0x9021...3765",
      createdAt: "3 weeks ago",
      category: "Real Estate"
    }
  ];

  // Featured listings (first 3)
  const featuredListings = listings.slice(0, 3);
  // Recent listings (last 6)
  const recentListings = listings.slice(0, 6);
  
  // Available categories
  const categories = ['Commercial', 'Rental', 'Employment', 'Partnership'];

  // Options for selects
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'rental', label: 'Rental' },
    { value: 'employment', label: 'Employment' },
    { value: 'partnership', label: 'Partnership' }
  ];
  
  const sortOptions = [
    { value: '', label: 'Sort By: Latest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Marketplace" 
        description="Discover and purchase legally verified agreements"
      />

      {/* Featured Listings */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Featured Agreements</h2>
          <Button href="/dashboard/create-listing">
            Create Listing
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredListings.map(listing => (
            <ListingCard 
              key={listing.id} 
              listing={listing} 
              showCategory
            />
          ))}
        </div>
      </section>

      {/* Browse Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <CategoryCard key={index} category={category} />
          ))}
        </div>
      </section>

      {/* Recent Listings */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Recent Listings</h2>
          <div className="flex gap-4">
            <Select 
              options={categoryOptions} 
              className="py-2 px-4 text-sm"
            />
            <Select 
              options={sortOptions}
              className="py-2 px-4 text-sm"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentListings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Button variant="secondary">
            Load More
          </Button>
        </div>
      </section>
    </div>
  );
} 