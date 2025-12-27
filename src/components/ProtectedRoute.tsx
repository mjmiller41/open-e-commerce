import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
	requireAdmin?: boolean;
}

export default function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
	const { user, role, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
	}

	if (!user) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	if (requireAdmin && role !== "admin") {
		// User is logged in but not admin, redirect to home
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
}
