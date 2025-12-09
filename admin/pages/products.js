// admin/pages/products.js
import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import ProductManagement from '../components/product/ProductManagement';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      // Fetch products
      const productsRes = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const productsData = await productsRes.json();
      setProducts(productsData.products || []);
      
      // Fetch vendors for filtering
      const vendorsRes = await fetch('/api/vendors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const vendorsData = await vendorsRes.json();
      setVendors(vendorsData.vendors || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Product Management</h1>
          <p className="text-slate-400">Manage food and grocery items from vendors</p>
        </div>
        <ProductManagement 
          products={products} 
          vendors={vendors}
          loading={loading} 
          onRefresh={fetchData} 
        />
      </div>
    </Layout>
  );
}