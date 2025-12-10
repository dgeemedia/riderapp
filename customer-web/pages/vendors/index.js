// customer-web/pages/vendors/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import VendorCard from '../../components/vendor/VendorCard';
import VendorFilter from '../../components/vendor/VendorFilter';
import { getVendors } from '../../lib/api';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { search, category } = router.query;

  useEffect(() => {
    fetchVendors();
  }, [search, category]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      
      const data = await getVendors(params.toString());
      setVendors(data);
      setFilteredVendors(data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    let filtered = [...vendors];
    
    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(v => 
        v.categories?.includes(filters.category)
      );
    }
    
    // Apply rating filter
    if (filters.minRating) {
      filtered = filtered.filter(v => v.rating >= filters.minRating);
    }
    
    // Apply price filter
    if (filters.priceRange) {
      filtered = filtered.filter(v => {
        const avgPrice = v.average_price || 0;
        switch(filters.priceRange) {
          case 'low': return avgPrice < 1000;
          case 'medium': return avgPrice >= 1000 && avgPrice < 3000;
          case 'high': return avgPrice >= 3000;
          default: return true;
        }
      });
    }
    
    // Apply sort
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch(filters.sortBy) {
          case 'rating':
            return b.rating - a.rating;
          case 'delivery_time':
            return (a.delivery_time || 999) - (b.delivery_time || 999);
          case 'price_low':
            return (a.average_price || 0) - (b.average_price || 0);
          case 'price_high':
            return (b.average_price || 0) - (a.average_price || 0);
          default:
            return 0;
        }
      });
    }
    
    setFilteredVendors(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <VendorFilter onFilterChange={handleFilterChange} />
          </div>

          {/* Vendor List */}
          <div className="lg:w-3/4">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Restaurants</h1>
              {search && (
                <p className="text-gray-600 mt-2">
                  Search results for: <span className="font-medium">"{search}"</span>
                </p>
              )}
              <p className="text-gray-600 mt-1">
                {filteredVendors.length} restaurants found
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                    <div className="h-48 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredVendors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVendors.map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No restaurants found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}