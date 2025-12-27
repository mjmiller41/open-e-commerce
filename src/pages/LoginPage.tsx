import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { LogIn } from "lucide-react";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();
	const location = useLocation();

	// Redirect if already logged in can be handled here or in a wrapper helper

	const from = location.state?.from?.pathname || "/";

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			setError(error.message);
			setLoading(false);
		} else {
			// Successful login
			navigate(from, { replace: true });
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-container">
				<div className="auth-header">
					<LogIn className="auth-icon" />
					<h2 className="auth-title">
						Sign in to your account
					</h2>
					<p className="auth-subtitle">
						Or{" "}
						<Link
							to="/register"
							className="auth-link"
						>
							create a new account
						</Link>
					</p>
				</div>
				<form className="auth-form" onSubmit={handleLogin}>
					<div className="form-group-stacked">
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
						<div className="auth-error">{error}</div>
					)}

					<div>
						<button
							type="submit"
							disabled={loading}
							className="auth-submit-btn"
						>
							{loading ? "Signing in..." : "Sign in"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
