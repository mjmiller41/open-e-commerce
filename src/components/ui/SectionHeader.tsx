import { cn } from "../../lib/utils";

interface PageHeaderProps {
	title: React.ReactNode | string;
	description?: string;
	children?: React.ReactNode; // Actions
	className?: string;
}

export function SectionHeader({ title, description, children, className }: PageHeaderProps) {
	return (
		<div className={cn("section-header", className)}>
			<div>
				<h3 className="section-title">{title}</h3>
				{description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
			</div>
			{children && <div className="flex gap-2 items-center">{children}</div>}
		</div>
	);
}
