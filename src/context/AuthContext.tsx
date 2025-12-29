import { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import logger from "../lib/logger";

type Role = "customer" | "admin" | null;

interface AuthContextType {
	user: User | null;
	session: Session | null;
	role: Role;
	loading: boolean;
	isAdmin: boolean;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	session: null,
	role: null,
	loading: true,
	isAdmin: false,
	signOut: async () => { },
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [role, setRole] = useState<Role>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Check active session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setUser(session?.user ?? null);
			if (session?.user) {
				fetchRole(session.user.id);
			} else {
				setLoading(false);
			}
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setUser(session?.user ?? null);
			if (session?.user) {
				fetchRole(session.user.id);
			} else {
				setRole(null);
				setLoading(false);
			}
		});

		return () => subscription.unsubscribe();
	}, []);

	const fetchRole = async (userId: string) => {
		try {
			const { data, error } = await supabase
				.from("profiles")
				.select("role")
				.eq("id", userId)
				.maybeSingle();

			if (error) {
				logger.error("Error fetching role:", error);
				setRole("customer"); // Default to customer on error
			} else if (!data) {
				// Profile doesn't exist yet (likely new user race condition)
				// Default to customer and let the background trigger handle creation
				setRole("customer");
			} else {
				setRole(data.role as Role);
			}
		} catch (error) {
			logger.error("Error fetching role:", error);
			setRole("customer");
		} finally {
			setLoading(false);
		}
	};

	const signOut = async () => {
		await supabase.auth.signOut();
		setRole(null);
		setUser(null);
		setSession(null);
	};

	const value = {
		user,
		session,
		role,
		loading,
		isAdmin: role === "admin",
		signOut,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
