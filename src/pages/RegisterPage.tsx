import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const { error: signUpError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					full_name: fullName,
				},
			},
		});

		if (signUpError) {
			setError(signUpError.message);
			setLoading(false);
		} else {
			// Successful registration
			navigate("/");
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-container">
				<div className="auth-header">
					<UserPlus className="auth-icon" />
					<h2 className="auth-title">
						Create a new account
					</h2>
					<p className="auth-subtitle">
						Or{" "}
						<Link
							to="/login"
							className="auth-link"
						>
							sign in to your existing account
						</Link>
					</p>
				</div>
				<form className="auth-form" onSubmit={handleRegister}>
					<div className="form-group-stacked">
						<div>
							<input
								id="full-name"
								name="full-name"
								type="text"
								autoComplete="name"
								required
								className="form-input"
								placeholder="Full Name"
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
							/>
						</div>
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
								autoComplete="new-password"
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
							{loading ? "Creating account..." : "Sign up"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
