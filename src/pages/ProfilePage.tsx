import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase, type Order, type Profile } from "../lib/supabase";
import logger from "../lib/logger";
import { validateAddress } from "../lib/addressValidation";

export default function ProfilePage() {
	const { id } = useParams();
	const { user, role } = useAuth();
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	const targetUserId = id || user?.id;
	const isOwnProfile = !id || id === user?.id;

	// Form state
	const [formData, setFormData] = useState({
		fullName: "",
		addressLine1: "",
		addressLine2: "",
		city: "",
		state: "",
		zipCode: "",
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

			if (error && error.code !== 'PGRST116') { // PGRST116 is "Relation not found" or "No rows found"
				logger.error("Error fetching profile:", error);
			}

			if (data) {
				setProfile(data);
				setFormData({
					fullName: data.full_name || "",
					addressLine1: data.address_line1 || "",
					addressLine2: data.address_line2 || "",
					city: data.city || "",
					state: data.state || "",
					zipCode: data.zip_code || "",
					phoneNumber: data.phone_number || "",
				});
			} else {
				// Initialize from metadata if available and we are viewing our own profile
				setFormData(prev => ({
					...prev,
					fullName: (isOwnProfile && user?.user_metadata?.full_name) || ""
				}));
			}
		};

		const loadData = async () => {
			setLoading(true);
			await Promise.all([fetchOrders(), fetchProfile()]);
			setLoading(false);
		};

		loadData();
	}, [targetUserId, isOwnProfile, user]);

	const handleSaveProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMsg("");
		setSaving(true);

		try {
			// Validate Address
			const validated = await validateAddress({
				addressLine1: formData.addressLine1,
				addressLine2: formData.addressLine2,
				city: formData.city,
				state: formData.state,
				zipCode: formData.zipCode
			});

			// Update form data with normalized values
			setFormData(prev => ({
				...prev,
				addressLine1: validated.addressLine1,
				addressLine2: validated.addressLine2 || "",
				city: validated.city,
				state: validated.state,
				zipCode: validated.zipCode
			}));

			// Save to Supabase
			const updates: Partial<Profile> = {
				id: targetUserId!,
				full_name: formData.fullName,
				address_line1: validated.addressLine1,
				address_line2: validated.addressLine2 || null,
				city: validated.city,
				state: validated.state,
				zip_code: validated.zipCode,
				phone_number: formData.phoneNumber,
				updated_at: new Date().toISOString(),
			};

			const { error } = await supabase
				.from("profiles")
				.upsert(updates);

			if (error) throw error;

			// Refresh profile
			setProfile(updates as Profile);
			setIsEditing(false);
			alert("Profile updated successfully!");

		} catch (err) {
			console.error("Error saving profile:", err);
			setErrorMsg(err instanceof Error ? err.message : "Failed to save profile.");
		} finally {
			setSaving(false);
		}
	};

	if (!isOwnProfile && role !== 'admin') {
		return <div className="text-center p-8 text-destructive">You do not have permission to view this profile.</div>;
	}

	return (
		<div className="max-w-4xl mx-auto animate-in fade-in duration-500">
			<h1 className="text-3xl font-bold mb-8">{isOwnProfile ? "My Profile" : "Customer Profile"}</h1>
			<div className="card p-6 mb-8">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{(isOwnProfile || role === 'admin') && (
						<div>
							<label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
							<div className="text-base font-medium text-foreground">
								{isOwnProfile ? user?.email : "Email not stored in public profile"}
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
							<div className="col-span-full">
								<label className="block text-sm font-medium text-muted-foreground mb-1">Mailing Address</label>
								<div className="text-base font-medium text-foreground">
									{profile?.address_line1 ? (
										<>
											{profile.address_line1}<br />
											{profile.address_line2 && <>{profile.address_line2}<br /></>}
											{profile.city}, {profile.state} {profile.zip_code}
										</>
									) : "-"}
								</div>
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
							<div className="col-span-full">
								<label className="block text-sm font-medium text-muted-foreground mb-1">Address Line 1</label>
								<input
									type="text"
									value={formData.addressLine1}
									onChange={e => setFormData({ ...formData, addressLine1: e.target.value })}
									className="form-input"
									required
								/>
							</div>
							<div className="col-span-full">
								<label className="block text-sm font-medium text-muted-foreground mb-1">Address Line 2</label>
								<input
									type="text"
									value={formData.addressLine2}
									onChange={e => setFormData({ ...formData, addressLine2: e.target.value })}
									className="form-input"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-muted-foreground mb-1">City</label>
								<input
									type="text"
									value={formData.city}
									onChange={e => setFormData({ ...formData, city: e.target.value })}
									className="form-input"
									required
								/>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-muted-foreground mb-1">State</label>
									<input
										type="text"
										value={formData.state}
										onChange={e => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
										className="form-input"
										maxLength={2}
										placeholder="NY"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-muted-foreground mb-1">Zip Code</label>
									<input
										type="text"
										value={formData.zipCode}
										onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
										className="form-input"
										maxLength={10}
										required
									/>
								</div>
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
									<td className="p-3 text-sm">#{order.id}</td>
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
