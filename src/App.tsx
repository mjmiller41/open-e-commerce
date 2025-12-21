import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { CartPage } from './pages/CartPage';
import { seedDatabase } from './db/seed';

function App() {
	useEffect(() => {
		seedDatabase();
	}, []);

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<ProductList />} />
					<Route path="product/:id" element={<ProductDetail />} />
					<Route path="cart" element={<CartPage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
