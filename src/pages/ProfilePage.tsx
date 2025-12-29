import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase, type Order, type Profile, type Address } from "../lib/supabase";
import logger from "../lib/logger";

export default function ProfilePage() {
	const { id } = useParams();
	const { user, role } = useAuth();
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [addresses, setAddresses] = useState<Address[]>([]);
	const [isEditing, setIsEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	const targetUserId = id || user?.id;
	const isOwnProfile = !id || id === user?.id;

	// Form state
	const [formData, setFormData] = useState({
		fullName: "",
		phoneNumber: "",
	});

	useEffect(() => {
		if (!targetUserId) return;

		const fetchOrders = async () => {
			const { data, error } = await supabase
				.from("orders")
				.select("*")
				.eq("user_id", targetUserId)
				.order("created_at", { ascending: false });

			if (error) {
				logger.error("Error fetching orders:", error);
			} else {
				setOrders(data || []);
			}
		};

		const fetchProfile = async () => {
			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", targetUserId)
				.single();

			if (error && error.code !== 'PGRST116') {
				logger.error("Error fetching profile:", error);
			}

			if (data) {
				setProfile(data);
				setFormData({
					fullName: data.full_name || "",
					phoneNumber: data.phone_number || "",
				});
			} else {
				setFormData(prev => ({
					...prev,
					fullName: (isOwnProfile && user?.user_metadata?.full_name) || ""
				}));
			}
		};

		const fetchAddresses = async () => {
			const { data, error } = await supabase
				.from("addresses")
				.select("*")
				.eq("user_id", targetUserId)
				.order("is_default", { ascending: false })
				.order("created_at", { ascending: false });

			if (error) {
				logger.error("Error fetching addresses", error);
			} else {
				setAddresses(data || []);
			}
		};

		const loadData = async () => {
			setLoading(true);
			await Promise.all([fetchOrders(), fetchProfile(), fetchAddresses()]);
			setLoading(false);
		};

		loadData();
	}, [targetUserId, isOwnProfile, user]);

	const handleSaveProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMsg("");
		setSaving(true);

		try {
			const updates: Partial<Profile> = {
				id: targetUserId!,
				full_name: formData.fullName,
				phone_number: formData.phoneNumber,
				updated_at: new Date().toISOString(),
			};

			const { error } = await supabase
				.from("profiles")
				.upsert(updates);

			if (error) throw error;

			setProfile(prev => prev ? { ...prev, ...updates } : updates as Profile);
			setIsEditing(false);
			alert("Profile updated successfully!");

		} catch (err) {
			console.error("Error saving profile:", err);
			setErrorMsg(err instanceof Error ? err.message : "Failed to save profile.");
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteAddress = async (addressId: string) => {
		if (!window.confirm("Are you sure you want to delete this address?")) return;
		try {
			const { error } = await supabase.from('addresses').delete().eq('id', addressId);
			if (error) throw error;
			setAddresses(prev => prev.filter(a => a.id !== addressId));
		} catch (err) {
			logger.error("Failed to delete address", err);
			alert("Failed to delete address");
		}
	};

	const handleSetDefaultAddress = async (addressId: string) => {
		try {
			// First set all others to false (this part is tricky to do atomically without a stored proc, but we'll doing separate updates for now)
			// Better approach: Call a specific RPC or just update locally and rely on server trigger?
			// Simplest approach: Update logic.

			// 1. Set current default to false (if any)
			const currentDefault = addresses.find(a => a.is_default);
			if (currentDefault) {
				await supabase.from('addresses').update({ is_default: false }).eq('id', currentDefault.id);
			}

			// 2. Set new default
			const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', addressId);
			if (error) throw error;

			// Refresh addresses
			const { data } = await supabase.from('addresses').select('*').eq('user_id', targetUserId).order('is_default', { ascending: false });
			if (data) setAddresses(data);

		} catch (err) {
			logger.error("Failed to set default address", err);
			alert("Failed to set default address");
		}
	};

	if (!isOwnProfile && role !== 'admin') {
		return <div className="text-center p-8 text-destructive">You do not have permission to view this profile.</div>;
	}

	return (
		<div className="max-w-4xl mx-auto animate-in fade-in duration-500">
			<h1 className="text-3xl font-bold mb-8">{isOwnProfile ? "My Profile" : "Customer Profile"}</h1>

			{/* Profile Info Card */}
			<div className="card p-6 mb-8">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{(isOwnProfile || role === 'admin') && (
						<div>
							<label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
							<div className="flex items-center gap-2">
								<div className="text-base font-medium text-foreground">
									{isOwnProfile ? user?.email : profile?.email || "Email not public"}
								</div>
								{((isOwnProfile && user?.email) || (profile?.email)) && (
									<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
										${(profile?.email_verified) ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}
									`}>
										{(profile?.email_verified) ? 'Verified' : 'Unverified'}
									</span>
								)}
							</div>
						</div>
					)}
					<div>
						<label className="block text-sm font-medium text-muted-foreground mb-1">Role</label>
						<div className="text-base font-medium text-foreground capitalize">{role || "User"}</div>
					</div>
				</div>

				<hr className="my-4 border-gray-200" />

				{!isEditing ? (
					<div>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold">Contact Information</h3>
							<button
								onClick={() => setIsEditing(true)}
								className="btn btn-secondary text-sm"
							>
								Edit Profile
							</button>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
								<div className="text-base font-medium text-foreground">{profile?.full_name || "-"}</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-muted-foreground mb-1">Phone Number</label>
								<div className="text-base font-medium text-foreground">{profile?.phone_number || "-"}</div>
							</div>
						</div>
					</div>
				) : (
					<form onSubmit={handleSaveProfile} className="space-y-4">
						{errorMsg && (
							<div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
								{errorMsg}
							</div>
						)}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
								<input
									type="text"
									value={formData.fullName}
									onChange={e => setFormData({ ...formData, fullName: e.target.value })}
									className="form-input"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-muted-foreground mb-1">Phone Number</label>
								<input
									type="tel"
									value={formData.phoneNumber}
									onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
									className="form-input"
									placeholder="123-456-7890"
								/>
							</div>
						</div>
						<div className="flex justify-end gap-3 mt-6">
							<button
								type="button"
								onClick={() => setIsEditing(false)}
								className="btn btn-secondary"
								disabled={saving}
							>
								Cancel
							</button>
							<button
								type="submit"
								className="btn btn-primary"
								disabled={saving}
							>
								{saving ? "Validating & Saving..." : "Save Profile"}
							</button>
						</div>
					</form>
				)}
			</div>

			{/* Saved Addresses Section */}
			<div className="mb-8">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-2xl font-bold">Saved Addresses</h2>
					{/* Add Address Logic would be here, but for now we rely on Checkout flow or could add a button opening a modal */}
				</div>

				{addresses.length === 0 ? (
					<div className="card p-6 text-center text-muted-foreground">
						No addresses saved. Add one during checkout.
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{addresses.map((addr) => (
							<div key={addr.id} className="card p-4 relative group">
								{addr.is_default && (
									<span className="absolute top-2 right-2 bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
										Default
									</span>
								)}
								<div className="font-medium text-lg mb-1">{addr.address_line1}</div>
								{addr.address_line2 && <div className="text-muted-foreground">{addr.address_line2}</div>}
								<div className="text-muted-foreground mb-3">{addr.city}, {addr.state} {addr.zip_code}</div>

								<div className="flex gap-2 text-sm">
									{!addr.is_default && (
										<button
											onClick={() => handleSetDefaultAddress(addr.id)}
											className="text-primary hover:underline"
										>
											Make Default
										</button>
									)}
									<button
										onClick={() => handleDeleteAddress(addr.id)}
										className="text-destructive hover:underline"
									>
										Delete
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			<div className="flex justify-between items-center mt-12 mb-4">
				<h2 className="text-2xl font-bold">{isOwnProfile ? "My Orders" : "Customer Orders"}</h2>
			</div>

			{loading ? (
				<div className="text-center p-8">Loading orders...</div>
			) : orders.length === 0 ? (
				<div className="card p-8 text-center text-muted-foreground">
					You haven't placed any orders yet.
				</div>
			) : (
				<div className="overflow-x-auto border border-border rounded-lg">
					<table className="w-full text-left">
						<thead>
							<tr className="bg-muted">
								<th className="p-3 text-sm font-semibold text-muted-foreground border-b border-border">Order ID</th>
								<th className="p-3 text-sm font-semibold text-muted-foreground border-b border-border">Date</th>
								<th className="p-3 text-sm font-semibold text-muted-foreground border-b border-border">Total</th>
								<th className="p-3 text-sm font-semibold text-muted-foreground border-b border-border">Status</th>
								<th className="p-3 text-sm font-semibold text-muted-foreground border-b border-border">Shipping Address</th>
							</tr>
						</thead>
						<tbody>
							{orders.map((order) => (
								<tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
									<td className="p-3 text-sm">
										<Link to={`/order/${order.id}`} className="hover:underline text-primary">
											#{order.id}
										</Link>
									</td>
									<td className="p-3 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
									<td className="p-3 text-sm font-medium">${order.total_amount.toFixed(2)}</td>
									<td className="p-3 text-sm">
										<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
											${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
											${order.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
											${order.status === 'shipped' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
											${order.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' : ''}
										`}>
											{order.status}
										</span>
									</td>
									<td className="p-3 text-sm max-w-[200px] truncate">
										{order.shipping_address}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
