import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
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

		<div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
				<div className="text-center">
					<UserPlus className="mx-auto h-12 w-12 text-primary" />
					<h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
						Create a new account
					</h2>
					<p className="mt-2 text-center text-sm text-muted-foreground">
						Or{" "}
						<Link
							to="/login"
							className="font-medium text-primary hover:text-accent transition-colors"
						>
							sign in to your existing account
						</Link>
					</p>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleRegister}>
					<div className="space-y-4">
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
						<div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive text-center">{error}</div>
					)}

					<div>
						<button
							type="submit"
							disabled={loading}
							className="btn btn-primary w-full"
						>
							{loading ? "Creating account..." : "Sign up"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
