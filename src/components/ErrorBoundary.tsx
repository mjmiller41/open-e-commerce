import { Component, type ErrorInfo, type ReactNode } from 'react';
import logger from '../lib/logger';

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
}

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
	};

	/**
	 * Update state so the next render will show the fallback UI.
	 *
	 * @returns The new state.
	 */
	public static getDerivedStateFromError(): State {
		return { hasError: true };
	}

	/**
	 * Log the error to the error reporting service.
	 *
	 * @param error - The error that was thrown.
	 * @param errorInfo - Component stack information.
	 */
	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		logger.error('Uncaught error:', error, errorInfo);
	}

	public render() {
		if (this.state.hasError) {
			return (
				<div style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					height: '100vh',
					padding: '20px',
					textAlign: 'center'
				}}>
					<h1>Something went wrong.</h1>
					<p>We're sorry, but an unexpected error occurred.</p>
					<button
						onClick={() => window.location.reload()}
						style={{
							padding: '10px 20px',
							marginTop: '20px',
							cursor: 'pointer',
							backgroundColor: 'var(--accent)',
							border: 'none',
							borderRadius: '4px',
							color: '#fff'
						}}
					>
						Reload Page
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
