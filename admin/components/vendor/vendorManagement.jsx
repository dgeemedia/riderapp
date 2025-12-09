// admin/components/vendor/VendorManagement.jsx
export default function VendorManagement() {
    const [vendors, setVendors] = useState([]);
    const [pendingApprovals, setPendingApprovals] = useState([]);

    useEffect(() => {
        fetchVendors();
        setupWebSocket();
    }, []);

    const fetchVendors = async () => {
        const res = await fetch('/api/vendors', {
            headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
        });
        const data = await res.json();
        setVendors(data.vendors);
        setPendingApprovals(data.vendors.filter(v => !v.is_approved));
    };

    const approveVendor = async (vendorId) => {
        await fetch(`/api/vendors/${vendorId}/approve`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
        });
        fetchVendors();
    };

    const setupWebSocket = () => {
        const socket = io(process.env.NEXT_PUBLIC_BACKEND, {
            auth: { role: 'admin', token: localStorage.getItem('admin_token') }
        });

        socket.on('vendor:registration', (data) => {
            setPendingApprovals(prev => [...prev, data.vendor]);
            // Show notification
        });
    };

    return (
        <div className="glass-card rounded-2xl">
            <div className="p-6 border-b border-slate-700/50">
                <h3 className="text-lg font-semibold text-white">Vendor Management</h3>
                <p className="text-sm text-slate-400">
                    {pendingApprovals.length} pending approvals
                </p>
            </div>
            <div className="p-6">
                {/* Vendor list with approve buttons */}
            </div>
        </div>
    );
}