import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type Profile } from '../lib/supabase';
import logger from '../lib/logger';

export function AdminCustomers() {
	const [profiles, setProfiles] = useState<Profile[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
	const [roleFilter, setRoleFilter] = useState<string>('all');

	useEffect(() => {
		const fetchProfiles = async () => {
			setLoading(true);
			const { data, error } = await supabase
				.from('profiles')
				.select('*')
				.order('updated_at', { ascending: false });

			if (error) {
				logger.error('Error fetching profiles:', error);
			} else {
				setProfiles(data || []);
			}
			setLoading(false);
		};

		fetchProfiles();
	}, []);

	// Derive available roles dynamically
	const availableRoles = Array.from(new Set(profiles.map(p => p.role))).filter(Boolean);

	// Filter profiles
	const filteredProfiles = roleFilter === 'all'
		? profiles
		: profiles.filter(p => p.role === roleFilter);

	const updateProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingProfile) return;

		const { error } = await supabase
			.from('profiles')
			.update({
				full_name: editingProfile.full_name,
				role: editingProfile.role,
				phone_number: editingProfile.phone_number,
				address_line1: editingProfile.address_line1,
				address_line2: editingProfile.address_line2,
				city: editingProfile.city,
				state: editingProfile.state,
				zip_code: editingProfile.zip_code,
			})
			.eq('id', editingProfile.id);

		if (error) {
			logger.error('Error updating profile:', error);
			alert('Failed to update profile');
		} else {
			setProfiles(profiles.map(p => p.id === editingProfile.id ? editingProfile : p));
			setEditingProfile(null);
		}
	};

	const deleteProfile = async (id: string) => {
		if (!confirm('Are you sure you want to delete this profile? This cannot be undone.')) return;

		const { error } = await supabase
			.from('profiles')
			.delete()
			.eq('id', id);

		if (error) {
			logger.error('Error deleting profile:', error);
			alert('Failed to delete profile');
		} else {
			setProfiles(profiles.filter(p => p.id !== id));
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-bold">Customer Management</h2>
				<div className="flex items-center gap-2">
					<label className="text-sm font-medium">Filter by Role:</label>
					<select
						value={roleFilter}
						onChange={(e) => setRoleFilter(e.target.value)}
						className="h-9 px-3 rounded-md border border-input bg-background text-sm"
					>
						<option value="all">All Roles</option>
						{availableRoles.map(role => (
							<option key={role} value={role}>{role}</option>
						))}
					</select>
				</div>
			</div>

			{loading ? (
				<div className="text-center p-8">Loading customers...</div>
			) : filteredProfiles.length === 0 ? (
				<div className="text-center p-8 text-muted-foreground">No customers found.</div>
			) : (
				<div className="overflow-x-auto border border-border rounded-lg">
					<table className="w-full text-left">
						<thead>
							<tr className="bg-muted">
								<th className="p-3 text-sm font-semibold text-muted-foreground border-b border-border">Name</th>
								<th className="p-3 text-sm font-semibold text-muted-foreground border-b border-border">Role</th>
								<th className="p-3 text-sm font-semibold text-muted-foreground border-b border-border">Phone</th>
								<th className="p-3 text-sm font-semibold text-muted-foreground border-b border-border">Location</th>
								<th className="p-3 text-sm font-semibold text-muted-foreground border-b border-border">Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredProfiles.map((profile) => (
								<tr key={profile.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
									<td className="p-3 text-sm font-medium">
										<Link to={`/profile/${profile.id}`} className="hover:underline text-primary">
											{profile.full_name || <span className="text-muted-foreground italic">No Name</span>}
										</Link>
										<div className="text-xs text-muted-foreground font-mono mt-0.5">{profile.id.split('-')[0]}...</div>
									</td>
									<td className="p-3 text-sm">
										<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
											${profile.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}
										`}>
											{profile.role}
										</span>
									</td>
									<td className="p-3 text-sm">
										{profile.phone_number || '-'}
									</td>
									<td className="p-3 text-sm">
										{profile.city ? `${profile.city}, ${profile.state}` : '-'}
									</td>
									<td className="p-3 text-sm">
										<div className="flex gap-2">
											<button
												onClick={() => setEditingProfile(profile)}
												className="btn btn-secondary btn-sm"
											>
												Edit
											</button>
											<button
												onClick={() => deleteProfile(profile.id)}
												className="btn btn-danger btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
											>
												Delete
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Edit Modal */}
			{editingProfile && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
					<div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
						<h3 className="text-lg font-bold mb-4">Edit Customer</h3>
						<form onSubmit={updateProfile} className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-1">Full Name</label>
								<input
									type="text"
									value={editingProfile.full_name || ''}
									onChange={e => setEditingProfile({ ...editingProfile, full_name: e.target.value })}
									className="w-full h-9 px-3 rounded-md border border-input bg-background"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Role</label>
								<select
									value={editingProfile.role}
									onChange={e => setEditingProfile({ ...editingProfile, role: e.target.value as Profile['role'] })}
									className="w-full h-9 px-3 rounded-md border border-input bg-background"
								>
									<option value="customer">Customer</option>
									<option value="admin">Admin</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Phone</label>
								<input
									type="tel"
									value={editingProfile.phone_number || ''}
									onChange={e => setEditingProfile({ ...editingProfile, phone_number: e.target.value })}
									className="w-full h-9 px-3 rounded-md border border-input bg-background"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-1">Address Line 1</label>
								<input
									type="text"
									value={editingProfile.address_line1 || ''}
									onChange={e => setEditingProfile({ ...editingProfile, address_line1: e.target.value })}
									className="w-full h-9 px-3 rounded-md border border-input bg-background"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Address Line 2</label>
								<input
									type="text"
									value={editingProfile.address_line2 || ''}
									onChange={e => setEditingProfile({ ...editingProfile, address_line2: e.target.value })}
									className="w-full h-9 px-3 rounded-md border border-input bg-background"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium mb-1">City</label>
									<input
										type="text"
										value={editingProfile.city || ''}
										onChange={e => setEditingProfile({ ...editingProfile, city: e.target.value })}
										className="w-full h-9 px-3 rounded-md border border-input bg-background"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">State</label>
									<input
										type="text"
										value={editingProfile.state || ''}
										onChange={e => setEditingProfile({ ...editingProfile, state: e.target.value })}
										className="w-full h-9 px-3 rounded-md border border-input bg-background"
									/>
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Zip Code</label>
								<input
									type="text"
									value={editingProfile.zip_code || ''}
									onChange={e => setEditingProfile({ ...editingProfile, zip_code: e.target.value })}
									className="w-full h-9 px-3 rounded-md border border-input bg-background"
								/>
							</div>

							<div className="flex justify-end gap-3 mt-6">
								<button
									type="button"
									onClick={() => setEditingProfile(null)}
									className="btn btn-secondary"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="btn btn-primary"
								>
									Save Changes
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
