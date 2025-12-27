import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
	const { user, role } = useAuth();

	return (
		<div className="profile-container">
			<h1 className="profile-title">My Profile</h1>
			<div className="profile-card">
				<div>
					<label className="profile-field-label">Email</label>
					<div className="profile-field-value">{user?.email}</div>
				</div>
				<div>
					<label className="profile-field-label">Role</label>
					<div className="profile-field-value capitalize">{role || 'User'}</div>
				</div>
				<div>
					<label className="profile-field-label">User ID</label>
					<div className="profile-field-value mono">{user?.id}</div>
				</div>
			</div>
		</div>
	);
}
