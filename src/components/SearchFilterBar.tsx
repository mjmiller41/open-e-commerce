import React, { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, X, ChevronRight, ChevronDown } from 'lucide-react';
import { type CategoryNode } from '../lib/categoryUtils';
import { supabase, type Product } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { formatCurrency } from '../lib/currency';

interface SearchFilterBarProps {
	onSearch: (searchTerm: string) => void;
	onFilterChange: (filters: FilterState) => void;
	onSortChange: (sort: SortOption) => void;
	categories?: CategoryNode[];
}

export interface FilterState {
	minPrice: string;
	maxPrice: string;
	category: string;
}

export type SortOption = 'name_asc' | 'price_asc' | 'price_desc' | 'newest';

export function SearchFilterBar({ onSearch, onFilterChange, onSortChange, categories = [] }: SearchFilterBarProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [filters, setFilters] = useState<FilterState>({ minPrice: '', maxPrice: '', category: '' });
	const [sortValue, setSortValue] = useState<SortOption>('newest');
	const [isExpanded, setIsExpanded] = useState(false);
	const [isCategoryOpen, setIsCategoryOpen] = useState(false);
	const categoryDropdownRef = useRef<HTMLDivElement>(null);

	// Predictive Search State
	const [suggestions, setSuggestions] = useState<Partial<Product>[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const searchRef = useRef<HTMLDivElement>(null);
	const { settings } = useStoreSettings();

	// Debounce search
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			onSearch(searchTerm);

			// Fetch suggestions if enabled
			if (settings?.predictive_search_enabled && searchTerm.length > 2) {
				fetchSuggestions(searchTerm);
			} else {
				setSuggestions([]);
			}
		}, 500);
		return () => clearTimeout(timeoutId);
	}, [searchTerm, onSearch, settings?.predictive_search_enabled]);

	const fetchSuggestions = async (term: string) => {
		const { data } = await supabase
			.from('products')
			.select('id, name, price, image, category')
			.ilike('name', `%${term}%`)
			.limit(5);

		if (data) {
			setSuggestions(data);
			setShowSuggestions(true);
		}
	};

	// Close suggestions on click outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
				setShowSuggestions(false);
			}
			if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
				setIsCategoryOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleFilterChange = (key: keyof FilterState, value: string) => {
		const newFilters = { ...filters, [key]: value };
		setFilters(newFilters);
		onFilterChange(newFilters);
	};

	const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value as SortOption;
		setSortValue(value);
		onSortChange(value);
	};

	const clearFilters = () => {
		setSearchTerm('');
		setFilters({ minPrice: '', maxPrice: '', category: '' });
		setSortValue('newest');
		onSearch('');
		onFilterChange({ minPrice: '', maxPrice: '', category: '' });
		onSortChange('newest');
	};

	const hasActiveFilters = searchTerm || filters.minPrice || filters.maxPrice || filters.category || sortValue !== 'newest';

	// Recursive component for category menu items
	const CategoryMenuItem = ({ node, depth = 0 }: { node: CategoryNode, depth?: number }) => {
		const [isOpen, setIsOpen] = useState(false);
		const hasChildren = node.children && node.children.length > 0;

		const handleSelect = (e: React.MouseEvent) => {
			e.stopPropagation();
			handleFilterChange('category', node.fullName);
			setIsCategoryOpen(false);
		};

		const toggleSubmenu = (e: React.MouseEvent) => {
			e.stopPropagation();
			setIsOpen(!isOpen);
		};

		return (
			<div className="relative">
				<div
					className={`flex items-center group cursor-pointer ${filters.category === node.fullName ? 'bg-secondary/50 font-medium' : 'hover:bg-secondary'} `}
					style={{ paddingLeft: `${depth * 12 + 16}px` }}
				>
					{/* Label Area - triggers selection */}
					<div
						className="flex-1 py-2 pr-2"
						onClick={handleSelect}
						title={`Filter by ${node.name}`}
					>
						<span className="whitespace-nowrap block">{node.name}</span>
					</div>

					{/* Expand Button - distinct area */}
					{hasChildren && (
						<div
							className="border-l border-border h-full flex items-center px-2 hover:bg-muted/50 transition-colors"
							onClick={toggleSubmenu}
							title={isOpen ? "Collapse subcategories" : "Expand subcategories"}
						>
							{isOpen ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
						</div>
					)}
				</div>
				{isOpen && hasChildren && (
					<div className="border-l border-border ml-4">
						{node.children.map(child => (
							<CategoryMenuItem key={child.fullName} node={child} depth={depth + 1} />
						))}
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="bg-card border border-border rounded-lg shadow-sm p-4 mb-8">
			<div className="flex flex-col md:flex-row gap-4">
				{/* Search Field */}
				<div className="flex-1 relative" ref={searchRef}>
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
					<input
						type="text"
						placeholder="Search products..."
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value);
							if (e.target.value.length <= 2) setShowSuggestions(false);
						}}
						onFocus={() => {
							if (suggestions.length > 0) setShowSuggestions(true);
						}}
						className="w-full pl-9 pr-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
					/>

					{/* Predictive Search Suggestions */}
					{showSuggestions && suggestions.length > 0 && (
						<div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden">
							<div className="p-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">Suggestions</div>
							{suggestions.map(product => (
								<Link
									key={product.id}
									to={`/product/${product.id}`}
									className="flex items-center gap-3 p-2 hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0"
									onClick={() => setShowSuggestions(false)}
								>
									<div className="w-10 h-10 rounded bg-muted overflow-hidden shrink-0">
										<img
											src={product.image || `${import.meta.env.BASE_URL}logo.png`}
											alt={product.name}
											className="w-full h-full object-cover"
										/>
									</div>
									<div className="flex-1 min-w-0">
										<div className="font-medium truncate text-sm">{product.name}</div>
										<div className="text-xs text-muted-foreground truncate">{product.category}</div>
									</div>
									<div className="font-semibold text-sm whitespace-nowrap">
										{product.price !== undefined ? formatCurrency(product.price, settings) : ''}
									</div>
								</Link>
							))}
						</div>
					)}
				</div>

				{/* Category Dropdown (Desktop) */}
				<div className="relative hidden md:block" ref={categoryDropdownRef}>
					<button
						className="flex items-center gap-2 px-3 py-2 border border-input rounded-md bg-background text-sm min-w-[150px] justify-between"
						onClick={() => setIsCategoryOpen(!isCategoryOpen)}
					>
						<span className="truncate max-w-[120px]">
							{filters.category ? filters.category.split(' > ').pop() : 'All Categories'}
						</span>
						<ChevronDown size={14} className={`transition - transform ${isCategoryOpen ? 'rotate-180' : ''} `} />
					</button>

					{isCategoryOpen && (
						<div className="absolute top-full right-0 mt-2 min-w-[16rem] w-max max-w-[80vw] bg-card border border-border rounded-lg shadow-lg py-2 z-50 max-h-[300px] overflow-y-auto">
							<div
								className={`px - 4 py - 2 hover: bg - secondary cursor - pointer border - b border - border ${filters.category === '' ? 'bg-secondary/50 font-medium' : ''} `}
								onClick={() => { handleFilterChange('category', ''); setIsCategoryOpen(false); }}
							>
								All Categories
							</div>
							{categories.map(node => (
								<CategoryMenuItem key={node.fullName} node={node} />
							))}
							{categories.length === 0 && (
								<div className="px-4 py-2 text-sm text-muted-foreground text-center">Loading categories...</div>
							)}
						</div>
					)}
				</div>

				{/* Desktop Filters Row */}
				<div className="hidden md:flex items-center gap-4">
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium whitespace-nowrap">Price:</span>
						<input
							type="number"
							placeholder="Min"
							value={filters.minPrice}
							onChange={(e) => handleFilterChange('minPrice', e.target.value)}
							className="w-20 px-2 py-1 text-sm rounded-md border border-input bg-background"
							min="0"
						/>
						<span className="text-muted-foreground">-</span>
						<input
							type="number"
							placeholder="Max"
							value={filters.maxPrice}
							onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
							className="w-20 px-2 py-1 text-sm rounded-md border border-input bg-background"
							min="0"
						/>
					</div>

					<div className="flex items-center gap-2">
						<span className="text-sm font-medium whitespace-nowrap">Sort:</span>
						<select
							value={sortValue}
							onChange={handleSortChange}
							className="px-2 py-1 text-sm rounded-md border border-input bg-background focus:outline-none"
						>
							<option value="newest">Newest</option>
							<option value="price_asc">Price: Low to High</option>
							<option value="price_desc">Price: High to Low</option>
							<option value="name_asc">Name: A-Z</option>
						</select>
					</div>

					{hasActiveFilters && (
						<button
							onClick={clearFilters}
							className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
						>
							<X size={14} /> Clear
						</button>
					)}
				</div>

				{/* Mobile Filter Toggle */}
				<div className="md:hidden flex justify-between items-center">
					<button
						onClick={() => setIsExpanded(!isExpanded)}
						className="flex items-center gap-2 text-sm font-medium"
					>
						<SlidersHorizontal size={16} />
						Filters
					</button>

					{hasActiveFilters && (
						<button
							onClick={clearFilters}
							className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
						>
							<X size={14} /> Clear All
						</button>
					)}
				</div>
			</div>

			{/* Mobile Filters Content */}
			{isExpanded && (
				<div className="md:hidden mt-4 pt-4 border-t border-border space-y-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">Category</label>
						<select
							value={filters.category}
							onChange={(e) => handleFilterChange('category', e.target.value)}
							className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
						>
							<option value="">All Categories</option>
							{categories.map(node => (
								<React.Fragment key={node.fullName}>
									<option value={node.fullName}>{node.name}</option>
									{node.children.map(child => (
										<option key={child.fullName} value={child.fullName}>&nbsp;&nbsp;{child.name}</option>
									))}
								</React.Fragment>
							))}
							{/* Note: Simplified mobile view (only 1 level deep for standard select) 
								If deeper nesting is needed, a custom mobile menu is better, but this suffices for "Electronics > Keyboards" 
							*/}
						</select>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Price Range</label>
						<div className="flex items-center gap-2">
							<input
								type="number"
								placeholder="Min"
								value={filters.minPrice}
								onChange={(e) => handleFilterChange('minPrice', e.target.value)}
								className="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background"
							/>
							<span className="text-muted-foreground">-</span>
							<input
								type="number"
								placeholder="Max"
								value={filters.maxPrice}
								onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
								className="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Sort By</label>
						<select
							value={sortValue}
							onChange={handleSortChange}
							className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none"
						>
							<option value="newest">Newest</option>
							<option value="price_asc">Price: Low to High</option>
							<option value="price_desc">Price: High to Low</option>
							<option value="name_asc">Name: A-Z</option>
						</select>
					</div>
				</div>
			)}
		</div>
	);
}
