import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, ChevronDown } from 'lucide-react';
import { LogoIcon } from './LogoIcon';
import { ThemeToggle } from './ThemeToggle';
import { useCart } from '../context/useCart';
import { appConfig } from '../lib/config';
import { useAuth } from '../context/AuthContext';

/**
 * The shared layout component for the application.
 * Renders the header (with logo and theme toggle), the main content outlet, and the footer.
 *
 * @returns The rendered layout structure.
 */
export function Layout() {
	const { cartCount } = useCart();
	const { user, role, isAdmin, signOut } = useAuth();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleSignOut = async () => {
		await signOut();
		setIsDropdownOpen(false);
		navigate('/');
	};

	return (
		<div className="app-container">
			<header className="app-header">
				<div className="container header-inner">
					<Link to="/" className="logo">
						<LogoIcon />
						<span>{appConfig.siteTitle}</span>
					</Link>

					<div className="header-actions">
						<ThemeToggle />

						<Link to="/cart" className="btn btn-ghost relative" aria-label="Cart">
							<ShoppingCart size={20} />
							{cartCount > 0 && (
								<span className="cart-badge">
									{cartCount}
								</span>
							)}
						</Link>

						{user ? (
							<div className="dropdown-container" ref={dropdownRef}>
								<button
									className="btn btn-ghost dropdown-trigger"
									onClick={() => setIsDropdownOpen(!isDropdownOpen)}
									aria-label="User menu"
								>
									<User size={20} />
									<ChevronDown size={16} className={`dropdown-icon-flip ${isDropdownOpen ? 'open' : ''}`} />
								</button>

								{isDropdownOpen && (
									<div className="dropdown-menu">
										<div className="dropdown-header">
											<p className="dropdown-user-email">{user.email}</p>
											<p className="dropdown-user-role">{role || 'User'}</p>
										</div>

										<Link
											to="/profile"
											className="dropdown-item"
											onClick={() => setIsDropdownOpen(false)}
										>
											My Profile
										</Link>

										{isAdmin && (
											<Link
												to="/admin"
												className="dropdown-item"
												onClick={() => setIsDropdownOpen(false)}
											>
												Admin Dashboard
											</Link>
										)}

										<div className="dropdown-divider">
											<button
												onClick={handleSignOut}
												className="dropdown-item danger"
											>
												Sign Out
											</button>
										</div>
									</div>
								)}
							</div>
						) : (
							<Link to="/login" className="btn btn-ghost" aria-label="Sign In">
								<User size={20} />
							</Link>
						)}
					</div>
				</div>
			</header>

			<main className="main-content">
				<div className="container">
					<Outlet />
				</div>
			</main>

			<footer className="app-footer">
				<div className="container">
					<p>&copy; {new Date().getFullYear()} {appConfig.footer?.text || appConfig.siteTitle}</p>
				</div>
			</footer>
		</div>
	);
}
