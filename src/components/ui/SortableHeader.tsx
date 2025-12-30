import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from "../../lib/utils";

interface SortableHeaderProps {
	label: string;
	sortKey: string;
	currentSort?: { key: string; direction: string } | null;
	onSort: (key: string) => void;
	className?: string;
	align?: 'left' | 'center' | 'right';
}

export function SortableHeader({
	label,
	sortKey,
	currentSort,
	onSort,
	className,
	align = 'left'
}: SortableHeaderProps) {
	const isActive = currentSort?.key === sortKey;
	const direction = currentSort?.direction;

	const alignClass = {
		left: 'justify-start',
		center: 'justify-center',
		right: 'justify-end'
	}[align];

	return (
		<th
			className={cn("table-header cursor-pointer hover:text-foreground transition-colors", className)}
			onClick={() => onSort(sortKey)}
		>
			<div className={cn("flex items-center gap-1", alignClass)}>
				{label}
				{isActive && (
					direction === 'ascending' ? <ArrowUp size={14} className="inline ml-1" /> : <ArrowDown size={14} className="inline ml-1" />
				)}
			</div>
		</th>
	);
}
