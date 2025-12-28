import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { CartPage } from './pages/CartPage';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import OrderDetailPage from './pages/OrderDetailPage';



/**
 * The main application component.
 * Sets up routing, context providers, and the main layout structure.
 *
 * @returns The rendered application.
 */
function App() {
	return (
		<AuthProvider>
			<CartProvider>
				<ErrorBoundary>
					<BrowserRouter basename={import.meta.env.BASE_URL}>
						<Routes>
							<Route path="/" element={<Layout />}>
								<Route index element={<ProductList />} />
								<Route path="product/:id" element={<ProductDetail />} />
								<Route path="cart" element={<CartPage />} />
								<Route path="login" element={<LoginPage />} />
								<Route path="register" element={<RegisterPage />} />

								{/* Protected Admin Route */}
								<Route element={<ProtectedRoute requireAdmin />}>
									<Route path="admin" element={<AdminPage />} />
								</Route>

								{/* Protected User Routes */}
								<Route element={<ProtectedRoute />}>
									<Route path="profile" element={<ProfilePage />} />
									<Route path="profile/:id" element={<ProfilePage />} />
									<Route path="order/:id" element={<OrderDetailPage />} />
								</Route>
							</Route>
						</Routes>
					</BrowserRouter>
				</ErrorBoundary>
			</CartProvider>

		</AuthProvider>
	);
}

export default App;
