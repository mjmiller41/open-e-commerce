import { cn } from "../../lib/utils";

interface PageHeaderProps {
	title: React.ReactNode | string;
	description?: string;
	children?: React.ReactNode; // Actions
	className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
	return (
		<div className={cn("page-header", className)}>
			<div>
				<h1 className="page-title">{title}</h1>
				{description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
			</div>
			{children && <div className="flex gap-2 items-center">{children}</div>}
		</div>
	);
}
