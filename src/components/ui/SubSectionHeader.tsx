import { cn } from "../../lib/utils";

interface PageHeaderProps {
	title: React.ReactNode | string;
	description?: string;
	level?: 1 | 2 | 3 | 4 | 5 | 6;
	children?: React.ReactNode; // Actions
	className?: string;
}

export function SubSectionHeader({ title, description, children, className, level = 1 }: PageHeaderProps) {
	const HeadingTag = `h${Math.min(level + 3, 6)}` as React.ElementType;
	const size = ['lg', 'base', 'sm']

	return (
		<div className={cn("sub-section-header", className)}>
			<div>
				<HeadingTag className={`sub-section-title text-${size[level - 1]}`}>{title}</HeadingTag>
				{description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
			</div>
			{children && <div className="flex gap-2 items-center">{children}</div>}
		</div>
	);
}	
