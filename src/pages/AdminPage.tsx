import { AdminOrders } from '../components/AdminOrders';

export default function AdminPage() {
	return (
		<div className="max-w-6xl mx-auto animate-in fade-in duration-500">
			<h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

			<div className="card p-6">
				<AdminOrders />
			</div>
		</div>
	);
}
