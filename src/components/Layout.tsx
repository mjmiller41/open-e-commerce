import { Outlet, Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { LogoIcon } from './LogoIcon';
import { ThemeToggle } from './ThemeToggle';
import { useCart } from '../context/useCart';
import { appConfig } from '../lib/config';

/**
 * The shared layout component for the application.
 * Renders the header (with logo and theme toggle), the main content outlet, and the footer.
 *
 * @returns The rendered layout structure.
 */
export function Layout() {
	const { cartCount } = useCart();

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
