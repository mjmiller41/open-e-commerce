import { cn } from "../../lib/utils";

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple' | 'orange';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	variant?: BadgeVariant;
	children: React.ReactNode;
}

export function Badge({ variant = 'neutral', className, children, ...props }: BadgeProps) {
	const variantClass = {
		success: 'badge-success',
		warning: 'badge-warning',
		error: 'badge-error',
		info: 'badge-info',
		neutral: 'badge-neutral',
		purple: 'badge-purple',
		orange: 'badge-orange',
	}[variant];

	return (
		<span className={cn("badge", variantClass, className)} {...props}>
			{children}
		</span>
	);
}
