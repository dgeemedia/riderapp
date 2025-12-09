// admin/components/order/OrderManagement.jsx
export default function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [riders, setRiders] = useState([]);

    const assignRider = async (orderId, riderId) => {
        await fetch(`/api/orders/${orderId}/assign-rider`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('admin_token')}`
            },
            body: JSON.stringify({ riderId })
        });
    };

    return (
        <div className="glass-card rounded-2xl">
            <div className="p-6 border-b border-slate-700/50">
                <h3 className="text-lg font-semibold text-white">Order Management</h3>
                <p className="text-sm text-slate-400">
                    Manage food and grocery orders
                </p>
            </div>
            <div className="p-6">
                {/* Order list with assign to rider functionality */}
            </div>
        </div>
    );
}