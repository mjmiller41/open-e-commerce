import { useSearchParams } from 'react-router-dom';
import { AdminOrders } from '../components/AdminOrders';
import { AdminCustomers } from '../components/AdminCustomers';
import { AdminInventory } from '../components/AdminInventory';

export default function AdminPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const activeTab = searchParams.get('tab') || 'orders';

	const handleTabChange = (tab: 'orders' | 'customers' | 'inventory') => {
		setSearchParams({ tab });
	};

	return (
		<div className="max-w-6xl mx-auto animate-in fade-in duration-500">
			<h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

			<div className="flex gap-4 mb-6">
				<button
					onClick={() => handleTabChange('orders')}
					className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'orders'
						? 'bg-primary text-primary-foreground'
						: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
						}`}
				>
					Orders
				</button>
				<button
					onClick={() => handleTabChange('customers')}
					className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'customers'
						? 'bg-primary text-primary-foreground'
						: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
						}`}
				>
					Customers
				</button>
				<button
					onClick={() => handleTabChange('inventory')}
					className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'inventory'
						? 'bg-primary text-primary-foreground'
						: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
						}`}
				>
					Inventory
				</button>
			</div>

			<div className="card p-6">
				{activeTab === 'orders' && <AdminOrders />}
				{activeTab === 'customers' && <AdminCustomers />}
				{activeTab === 'inventory' && <AdminInventory />}
			</div>
		</div>
	);
}
