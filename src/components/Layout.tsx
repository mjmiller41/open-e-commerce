import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, ChevronDown, Facebook, Instagram, Twitter, Youtube, Pin, Ghost, Video, Type, Github } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useCart } from '../context/CartContext';
import { appConfig } from '../lib/config';
import { useAuth } from '../context/AuthContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { CartDrawer } from './CartDrawer';

/**
 * The shared layout component for the application.
 * Renders the header (with logo and theme toggle), the main content outlet, and the footer.
 *
 * @returns The rendered layout structure.
 */
export function Layout() {
	const { cartCount, openCart } = useCart();
	const { user, role, isAdmin, signOut } = useAuth();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();

	const { settings } = useStoreSettings();
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

		<div className="flex flex-col min-h-screen">
			<CartDrawer />
			<header className="sticky top-0 z-50 bg-[var(--bg-header)] backdrop-blur-md border-b border-border transition-colors duration-300">
				<div className="mx-auto px-4 h-16 flex items-center justify-between" style={{ maxWidth: 'var(--container-width, 1200px)' }}>
					<Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
						<img
							src={settings?.logo_url
								? (settings.logo_url.startsWith('http') || settings.logo_url.startsWith('data:')
									? settings.logo_url
									: `${import.meta.env.BASE_URL}${settings.logo_url.replace(/^\//, '')}`)
								: `${import.meta.env.BASE_URL}logo.png`
							}
							alt="Logo"
							className="w-8 h-8 object-contain"
						/>
						<h1 className="font-bold text-xl text-primary leading-none">{settings?.store_name || appConfig.siteTitle}</h1>
					</Link>

					<div className="flex items-center gap-4">
						<ThemeToggle />

						{settings?.cart_type === 'drawer' ? (
							<button
								onClick={() => openCart()}
								className="btn btn-ghost relative"
								aria-label="Cart"
							>
								<ShoppingCart size={20} />
								{cartCount > 0 && (
									<span className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
										{cartCount}
									</span>
								)}
							</button>
						) : (
							<Link to="/cart" className="btn btn-ghost relative" aria-label="Cart">
								<ShoppingCart size={20} />
								{cartCount > 0 && (
									<span className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
										{cartCount}
									</span>
								)}
							</Link>
						)}

						{user ? (
							<div className="relative" ref={dropdownRef}>
								<button
									className="btn btn-ghost flex items-center gap-2"
									onClick={() => setIsDropdownOpen(!isDropdownOpen)}
									aria-label="User menu"
								>
									<User size={20} />
									<ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
								</button>

								{isDropdownOpen && (
									<div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
										<div className="px-4 py-2 border-b border-border">
											<p className="text-sm font-medium truncate">{user?.email}</p>
											<p className="text-xs text-muted-foreground capitalize">{role || 'User'}</p>
										</div>

										<Link
											to="/profile"
											className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
											onClick={() => setIsDropdownOpen(false)}
										>
											My Profile
										</Link>

										{isAdmin && (
											<Link
												to="/admin"
												className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
												onClick={() => setIsDropdownOpen(false)}
											>
												Admin Dashboard
											</Link>
										)}

										<div className="border-t border-border mt-1 pt-1">
											<button
												onClick={handleSignOut}
												className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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

			<main className="flex-1 py-8">
				<div className="mx-auto px-4" style={{ maxWidth: 'var(--container-width, 1200px)' }}>
					<Outlet />
				</div>
			</main>

			<footer className="mt-auto border-t border-border py-8 bg-muted text-muted-foreground text-center text-sm">
				<div className="mx-auto px-4 space-y-4" style={{ maxWidth: 'var(--container-width, 1200px)' }}>
					<div className="flex justify-center gap-4">
						{settings?.social_facebook_link && (
							<a href={settings.social_facebook_link} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="Facebook">
								<Facebook size={20} />
							</a>
						)}
						{settings?.social_instagram_link && (
							<a href={settings.social_instagram_link} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="Instagram">
								<Instagram size={20} />
							</a>
						)}
						{settings?.social_twitter_link && (
							<a href={settings.social_twitter_link} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="Twitter">
								<Twitter size={20} />
							</a>
						)}
						{settings?.social_youtube_link && (
							<a href={settings.social_youtube_link} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="YouTube">
								<Youtube size={20} />
							</a>
						)}
						{settings?.social_pinterest_link && (
							<a href={settings.social_pinterest_link} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="Pinterest">
								<Pin size={20} />
							</a>
						)}
						{settings?.social_tiktok_link && (
							<a href={settings.social_tiktok_link} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="TikTok">
								<Video size={20} />
							</a>
						)}
						{settings?.social_snapchat_link && (
							<a href={settings.social_snapchat_link} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="Snapchat">
								<Ghost size={20} />
							</a>
						)}
						{settings?.social_tumblr_link && (
							<a href={settings.social_tumblr_link} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="Tumblr">
								<Type size={20} />
							</a>
						)}
						{settings?.social_vimeo_link && (
							<a href={settings.social_vimeo_link} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="Vimeo">
								<Video size={20} />
							</a>
						)}
						{settings?.social_github_link && (
							<a href={settings.social_github_link} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="GitHub">
								<Github size={20} />
							</a>
						)}
					</div>
					<p>&copy; {new Date().getFullYear()} {appConfig.footer?.text || appConfig.siteTitle}</p>
				</div>
			</footer>
		</div>
	);

}
