import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
	id: string;
	message: string;
	type: ToastType;
}

interface ToastContextType {
	addToast: (message: string, type?: ToastType) => void;
	removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error('useToast must be used within a ToastProvider');
	}
	return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const addToast = useCallback((message: string, type: ToastType = 'info') => {
		const id = crypto.randomUUID();
		setToasts((prev) => [...prev, { id, message, type }]);
	}, []);

	const removeToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	}, []);

	return (
		<ToastContext.Provider value={{ addToast, removeToast }}>
			{children}
			<div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
				{toasts.map((toast) => (
					<ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
				))}
			</div>
		</ToastContext.Provider>
	);
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
	const [isVisible, setIsVisible] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout>(null);

	useEffect(() => {
		// Animate in
		requestAnimationFrame(() => setIsVisible(true));

		// Auto dismiss
		timeoutRef.current = setTimeout(() => {
			setIsVisible(false);
			// Wait for animation to finish before removing from state
			setTimeout(() => onRemove(toast.id), 300);
		}, 3000);

		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, [toast.id, onRemove]);

	const Icon = {
		success: CheckCircle,
		error: AlertCircle,
		info: Info,
	}[toast.type];

	return (
		<div
			className={`
        pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-md shadow-lg border transition-all duration-300 transform
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        ${toast.type === 'success' ? 'bg-background border-green-500/50 text-foreground' : ''}
        ${toast.type === 'error' ? 'bg-destructive/10 border-destructive/50 text-destructive' : ''}
        ${toast.type === 'info' ? 'bg-background border-blue-500/50 text-foreground' : ''}
      `}
		>
			<Icon size={18} className={
				toast.type === 'success' ? 'text-green-500' :
					toast.type === 'error' ? 'text-destructive' :
						'text-blue-500'
			} />
			<span className="text-sm font-medium">{toast.message}</span>
			<button onClick={() => {
				setIsVisible(false);
				setTimeout(() => onRemove(toast.id), 300);
			}} className="ml-2 opacity-70 hover:opacity-100">
				<X size={16} />
			</button>
		</div>
	);
}
