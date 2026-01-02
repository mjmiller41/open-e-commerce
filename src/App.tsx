import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProductList } from './pages/shop/ProductList';
import { ProductDetail } from './pages/shop/ProductDetail';
import { CartPage } from './pages/shop/CartPage';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { StoreSettingsProvider } from './context/StoreSettingsContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminPage from './pages/admin/Dashboard';
import ProfilePage from './pages/account/ProfilePage';
import ProtectedRoute from './components/features/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import OrderDetailPage from './pages/account/OrderDetailPage';
import { AdminProductDetail } from './pages/admin/ProductDetail';
import { ToastProvider } from './context/ToastContext';

/**
 * The main application component.
 * Sets up routing, context providers, and the main layout structure.
 *
 * @returns The rendered application.
 */
function App() {
	return (
		<AuthProvider>
			<StoreSettingsProvider>
				<ToastProvider>
					<ErrorBoundary>
						<BrowserRouter basename={import.meta.env.BASE_URL}>
							<CartProvider>
								<Routes>
									<Route path="/" element={<Layout />}>
										<Route index element={<ProductList />} />
										<Route path="category/*" element={<ProductList />} />
										<Route path="product/:id" element={<ProductDetail />} />
										<Route path="cart" element={<CartPage />} />
										<Route path="login" element={<LoginPage />} />
										<Route path="register" element={<RegisterPage />} />

										{/* Protected Admin Route */}
										<Route element={<ProtectedRoute requireAdmin />}>
											<Route path="admin" element={<AdminPage />} />
											<Route path="admin/product/:id" element={<AdminProductDetail />} />
										</Route>

										{/* Protected User Routes */}
										<Route element={<ProtectedRoute />}>
											<Route path="profile" element={<ProfilePage />} />
											<Route path="profile/:id" element={<ProfilePage />} />
											<Route path="order/:id" element={<OrderDetailPage />} />
										</Route>
									</Route>
								</Routes>
							</CartProvider>
						</BrowserRouter>
					</ErrorBoundary>
				</ToastProvider>
			</StoreSettingsProvider>
		</AuthProvider>
	);
}

export default App;
