import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type Profile } from '../lib/supabase';
import logger from '../lib/logger';
import { useAuth } from '../context/AuthContext';
import { X, ArrowUp, ArrowDown } from 'lucide-react';
import { useSortableData } from '../hooks/useSortableData';

export function AdminCustomers() {
	const { isAdmin } = useAuth();
	const [profiles, setProfiles] = useState<Profile[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
	const [roleFilter, setRoleFilter] = useState<string[]>([]);
	const [verificationFilter, setVerificationFilter] = useState<string[]>([]);

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
	const filteredProfiles = profiles.filter(p => {
		const matchesRole = roleFilter.length === 0 || roleFilter.includes(p.role);
		const matchesVerification = verificationFilter.length === 0
			? true
			: verificationFilter.includes(p.email_verified ? 'verified' : 'unverified');
		return matchesRole && matchesVerification;
	});

	const { items: sortedProfiles, requestSort, sortConfig } = useSortableData(
		filteredProfiles,
		{ key: 'full_name', direction: 'ascending' },
		{
			email_verified_status: (p) => p.email_verified ? 'Verified' : 'Unverified'
		}
	);

	const renderSortIcon = (key: string) => {
		if (sortConfig?.key !== key) return null;
		return sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
	};

	const renderSortableHeader = (label: string, sortKey: string, className = "") => (
		<th
			className={`p-3 text-sm font-semibold text-muted-foreground border-b border-border cursor-pointer hover:text-foreground transition-colors select-none ${className}`}
			onClick={() => requestSort(sortKey)}
		>
			<div className="flex items-center gap-1">
				{label}
				{renderSortIcon(sortKey)}
			</div>
		</th>
	);

	const addFilter = <T extends string>(
		currentFilters: T[],
		setFilter: (filters: T[]) => void,
		value: T
	) => {
		if (value && value !== 'all' && !currentFilters.includes(value)) {
			setFilter([...currentFilters, value]);
		}
	};

	const removeFilter = <T extends string>(
		currentFilters: T[],
		setFilter: (filters: T[]) => void,
		value: T
	) => {
		setFilter(currentFilters.filter(item => item !== value));
	};

	const updateProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingProfile) return;

		const updates: Partial<Profile> = {
			full_name: editingProfile.full_name,
			phone_number: editingProfile.phone_number,
		};

		if (isAdmin) {
			updates.role = editingProfile.role;
		}

		const { error } = await supabase
			.from('profiles')
			.update(updates)
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

		const { error, data } = await supabase
			.from('profiles')
			.delete()
			.eq('id', id)
			.select('*');

		if (error) {
			logger.error('Error deleting profile:', error);
			alert('Failed to delete profile');
		} else if (data.length > 0) {
			setProfiles(profiles.filter(p => p.id !== id));
		} else {
			logger.error('Profile not found', id);
			alert('Profile not found');
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-bold">Customer Management</h2>
			</div>

			<div className="flex flex-col sm:flex-row gap-4 items-start">
				<div className="space-y-2 w-full sm:flex-1">
					<label className="text-sm font-medium text-muted-foreground">Filter by Role</label>
					<select
						value=""
						onChange={(e) => addFilter(roleFilter, setRoleFilter, e.target.value)}
						className="input"
					>
						<option value="">Select Role...</option>
						{availableRoles
							.filter(r => !roleFilter.includes(r))
							.map(role => (
								<option key={role} value={role}>{role}</option>
							))}
					</select>
					{roleFilter.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{roleFilter.map(role => (
								<button
									key={role}
									onClick={() => removeFilter(roleFilter, setRoleFilter, role)}
									className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-foreground/10 hover:bg-destructive/15 hover:text-destructive text-foreground text-xs font-medium transition-colors cursor-pointer group"
								>
									{role}
									<X size={14} className="opacity-50 group-hover:opacity-100" />
								</button>
							))}
						</div>
					)}
				</div>

				<div className="space-y-2 w-full sm:flex-1">
					<label className="text-sm font-medium text-muted-foreground">Status</label>
					<select
						value=""
						onChange={(e) => addFilter(verificationFilter, setVerificationFilter, e.target.value)}
						className="input"
					>
						<option value="">Select Status...</option>
						{['verified', 'unverified']
							.filter(s => !verificationFilter.includes(s))
							.map(status => (
								<option key={status} value={status} className="capitalize">{status}</option>
							))}
					</select>
					{verificationFilter.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{verificationFilter.map(status => (
								<button
									key={status}
									onClick={() => removeFilter(verificationFilter, setVerificationFilter, status)}
									className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-foreground/10 hover:bg-destructive/15 hover:text-destructive text-foreground text-xs font-medium transition-colors cursor-pointer group"
								>
									<span className="capitalize">{status}</span>
									<X size={14} className="opacity-50 group-hover:opacity-100" />
								</button>
							))}
						</div>
					)}
				</div>

				<button
					onClick={() => {
						setRoleFilter([]);
						setVerificationFilter([]);
					}}
					className="btn btn-primary h-[38px] whitespace-nowrap shrink-0 mt-[28px]"
				>
					Clear Filters
				</button>
			</div>

			{
				loading ? (
					<div className="text-center p-8">Loading customers...</div>
				) : filteredProfiles.length === 0 ? (
					<div className="text-center p-8 text-muted-foreground">No customers found.</div>
				) : (
					<div className="overflow-x-auto border border-border rounded-lg">
						<table className="w-full text-left">
							<thead>
								<tr className="bg-muted">
									{renderSortableHeader("Name", "full_name")}
									{renderSortableHeader("Email", "email")}
									{renderSortableHeader("Role", "role")}
									{renderSortableHeader("Phone", "phone_number")}
									{renderSortableHeader("Status", "email_verified_status")}
									<th className="p-3 text-sm font-semibold text-muted-foreground border-b border-border">Actions</th>
								</tr>
							</thead>
							<tbody>
								{sortedProfiles.map((profile) => (
									<tr key={profile.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
										<td className="p-3 text-sm font-medium">
											<Link to={`/profile/${profile.id}`} className="hover:underline text-primary">
												{profile.full_name || <span className="text-muted-foreground italic">No Name</span>}
											</Link>
											<div className="text-xs text-muted-foreground font-mono mt-0.5">{profile.id.split('-')[0]}...</div>
										</td>
										<td className="p-3 text-sm">
											<div className="flex flex-col">
												<span>{profile.email || <span className="text-muted-foreground italic">Hidden</span>}</span>
											</div>
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
											<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
											${profile.email_verified ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}
										`}>
												{profile.email_verified ? 'Verified' : 'Unverified'}
											</span>
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
				)
			}

			{/* Edit Modal */}
			{
				editingProfile && (
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
									<label className="block text-sm font-medium mb-1">Email Status</label>
									<div className="flex items-center h-9 px-3 rounded-md border border-input bg-muted/50 text-sm text-muted-foreground">
										<span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium mr-2
										${editingProfile.email_verified ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}
									`}>
											{editingProfile.email_verified ? 'Verified' : 'Unverified'}
										</span>
										{editingProfile.email}
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Role</label>
									{isAdmin ? (
										<select
											value={editingProfile.role}
											onChange={e => setEditingProfile({ ...editingProfile, role: e.target.value as Profile['role'] })}
											className="w-full h-9 px-3 rounded-md border border-input bg-background"
										>
											<option value="customer">Customer</option>
											<option value="admin">Admin</option>
										</select>
									) : (
										<div className="h-9 px-3 flex items-center rounded-md border border-input bg-muted text-sm text-muted-foreground capitalize">
											{editingProfile.role}
										</div>
									)}
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
				)
			}
		</div >
	);
}
