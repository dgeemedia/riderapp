// customer-web/pages/index.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SearchBar from '../components/common/SearchBar';
import ProductGrid from '../components/product/ProductGrid';
import VendorCard from '../components/vendor/VendorCard';
import { getVendors, getPopularProducts } from '../lib/api';

export default function Home() {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vendorsData, productsData] = await Promise.all([
        getVendors(),
        getPopularProducts()
      ]);
      setVendors(vendorsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Delicious Food Delivered to Your Doorstep
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Order from your favorite restaurants with fast delivery
          </p>
          <SearchBar 
            onSearch={(query) => router.push(`/vendors?search=${query}`)}
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* Featured Vendors */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Popular Restaurants</h2>
            <button 
              onClick={() => router.push('/vendors')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vendors.slice(0, 4).map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </section>

        {/* Popular Products */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Trending Now</h2>
          <ProductGrid products={products.slice(0, 8)} />
        </section>

        {/* Categories */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Pizza', 'Burger', 'Sushi', 'Chinese', 'Indian', 'Desserts', 'Healthy', 'Breakfast'].map((category) => (
              <button
                key={category}
                onClick={() => router.push(`/vendors?category=${category.toLowerCase()}`)}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
              >
                <div className="text-3xl mb-2">🍕</div>
                <span className="font-medium text-gray-900">{category}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}