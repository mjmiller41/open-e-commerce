import { Outlet, Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { LogoIcon } from './LogoIcon';
import { ThemeToggle } from './ThemeToggle';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export function Layout() {
	const cartItems = useLiveQuery(() => db.cart.toArray());
	const cartCount = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

	return (
		<div className="app-container">
			<header className="app-header">
				<div className="container header-inner">
					<Link to="/" className="logo">
						<LogoIcon />
						<span>Open E-Commerce</span>
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
					<p>&copy; {new Date().getFullYear()} Open E-Commerce. Built with Vite, React & Dexie.</p>
				</div>
			</footer>
		</div>
	);
}
