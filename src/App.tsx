import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { CartPage } from './pages/CartPage';
import { CartProvider } from './context/CartContext';

/**
 * The main application component.
 * Sets up routing, context providers, and the main layout structure.
 *
 * @returns The rendered application.
 */
function App() {
	return (
		<CartProvider>
			<BrowserRouter basename={import.meta.env.BASE_URL}>
				<Routes>
					<Route path="/" element={<Layout />}>
						<Route index element={<ProductList />} />
						<Route path="product/:id" element={<ProductDetail />} />
						<Route path="cart" element={<CartPage />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</CartProvider>
	);
}

export default App;
