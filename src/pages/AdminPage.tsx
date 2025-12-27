import { AdminOrders } from '../components/AdminOrders';

export default function AdminPage() {
	return (
		<div className="admin-container fade-in">
			<h1 className="admin-title" style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>

			<div className="card" style={{ padding: '1.5rem' }}>
				<AdminOrders />
			</div>
		</div>
	);
}
