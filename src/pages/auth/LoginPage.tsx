import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { LogIn } from "lucide-react";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	// Redirect if already logged in can be handled here or in a wrapper helper


	// Redirect if already logged in can be handled here or in a wrapper helper

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);


		const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (authError) {
			setError(authError.message);
			setLoading(false);
		} else {
			// Successful login
			// Fetch role to determine redirect
			const { data: profile } = await supabase
				.from("profiles")
				.select("role")
				.eq("id", authData.user?.id) // Use optional chaining just in case
				.single();

			if (profile?.role === "admin") {
				navigate("/admin", { replace: true });
			} else {
				navigate("/", { replace: true });
			}
		}
	};

	return (

		<div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
				<div className="text-center">
					<LogIn className="mx-auto h-12 w-12 text-primary" />
					<h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
						Sign in to your account
					</h2>
					<p className="mt-2 text-center text-sm text-muted-foreground">
						Or{" "}
						<Link
							to="/register"
							className="font-medium text-primary hover:text-accent transition-colors"
						>
							create a new account
						</Link>
					</p>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleLogin}>
					<div className="space-y-4">
						<div>
							<input
								id="email-address"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="form-input"
								placeholder="Email address"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								className="form-input"
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
					</div>

					{error && (
						<div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive text-center">{error}</div>
					)}

					<div>
						<button
							type="submit"
							disabled={loading}
							className="btn btn-primary w-full"
						>
							{loading ? "Signing in..." : "Sign in"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
