import { useSearchParams } from 'react-router-dom';
import { AdminOrders } from '../components/AdminOrders';
import { AdminCustomers } from '../components/AdminCustomers';
import { AdminInventory } from '../components/AdminInventory';
import { AdminSettings } from '../components/AdminSettings';
import { AdminReviews } from '../components/reviews/AdminReviews';

export default function AdminPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const activeTab = searchParams.get('tab') || 'orders';

	const handleTabChange = (tab: 'orders' | 'customers' | 'inventory' | 'settings' | 'reviews') => {
		setSearchParams({ tab });
	};

	return (
		<div className="max-w-6xl mx-auto animate-in fade-in duration-500">
			<h2 className="text-3xl font-bold mb-8">Admin Dashboard</h2>

			<div className="flex gap-4 mb-6">
				<div className="bg-muted p-1 rounded-lg inline-flex">
					<button
						onClick={() => handleTabChange('orders')}
						className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'orders'
							? 'bg-background text-foreground shadow-sm'
							: 'text-muted-foreground hover:text-foreground'
							}`}
					>
						Orders
					</button>
					<button
						onClick={() => handleTabChange('customers')}
						className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'customers'
							? 'bg-background text-foreground shadow-sm'
							: 'text-muted-foreground hover:text-foreground'
							}`}
					>
						Customers
					</button>
					<button
						onClick={() => handleTabChange('inventory')}
						className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'inventory'
							? 'bg-background text-foreground shadow-sm'
							: 'text-muted-foreground hover:text-foreground'
							}`}
					>
						Inventory
					</button>
					<button
						onClick={() => handleTabChange('reviews')}
						className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'reviews'
							? 'bg-background text-foreground shadow-sm'
							: 'text-muted-foreground hover:text-foreground'
							}`}
					>
						Reviews
					</button>
					<button
						onClick={() => handleTabChange('settings')}
						className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'settings'
							? 'bg-background text-foreground shadow-sm'
							: 'text-muted-foreground hover:text-foreground'
							}`}
					>
						Settings
					</button>
				</div>
			</div>

			<div className="card p-6">
				{activeTab === 'orders' && <AdminOrders />}
				{activeTab === 'customers' && <AdminCustomers />}
				{activeTab === 'inventory' && <AdminInventory />}
				{activeTab === 'reviews' && <AdminReviews />}
				{activeTab === 'settings' && <AdminSettings />}
			</div>
		</div>
	);
}
