import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
	const [theme, setTheme] = useState(() => {
		const saved = localStorage.getItem('theme');
		if (saved) return saved;
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	});

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme(prev => prev === 'light' ? 'dark' : 'light');
	};

	return (
		<button
			onClick={toggleTheme}
			className="btn btn-ghost"
			aria-label="Toggle theme"
			title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
		>
			{theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
		</button>
	);
}
