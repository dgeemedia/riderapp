// customer-web/components/vendor/VendorCard.jsx
import { useRouter } from 'next/router';
import RatingStars from '../common/RatingStars';

export default function VendorCard({ vendor }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/vendors/${vendor.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
    >
      {/* Vendor Image */}
      <div className="relative h-48">
        <img
          src={vendor.cover_image || '/images/restaurant-placeholder.jpg'}
          alt={vendor.business_name}
          className="w-full h-full object-cover"
        />
        {vendor.is_open !== false && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
            OPEN
          </span>
        )}
      </div>

      {/* Vendor Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-900">{vendor.business_name}</h3>
          <div className="flex items-center">
            <RatingStars rating={vendor.rating} />
            <span className="ml-1 text-sm text-gray-600">
              ({vendor.total_orders || 0})
            </span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {vendor.description || 'No description available'}
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          {vendor.categories?.slice(0, 3).map((category, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
            >
              {category}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>{vendor.distance ? `${vendor.distance} km` : 'Nearby'}</span>
          </div>
          <div className="flex items-center">
            <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{vendor.delivery_time || 30}-{vendor.delivery_time + 10 || 40} min</span>
          </div>
          <div className="font-medium">
            ₦{vendor.min_order_amount || 1000}+
          </div>
        </div>
      </div>
    </div>
  );
}