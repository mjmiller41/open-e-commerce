import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { CartPage } from './pages/CartPage';
import { CartProvider } from './context/CartContext';

function App() {
	return (
		<CartProvider>
			<BrowserRouter>
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
