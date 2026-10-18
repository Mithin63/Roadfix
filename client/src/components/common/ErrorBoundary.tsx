import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Roadfix ErrorBoundary] Uncaught render error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    localStorage.removeItem('roadfix_logged_in');
    localStorage.removeItem('roadfix_token');
    localStorage.removeItem('roadfix_user_id');
    localStorage.removeItem('roadfix_user_email');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F6F3EE] dark:bg-[#080D1C] flex items-center justify-center p-4 font-sans">
          <div className="w-full max-w-lg bg-white dark:bg-[#111A2E] border-4 border-[#111215] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#111215] text-[#111215] dark:text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center border-2 border-[#111215] shadow-[2px_2px_0px_#111215] shrink-0">
                <AlertTriangle className="w-6 h-6 text-[#111215]" />
              </div>
              <div>
                <h2 className="font-headline text-2xl uppercase tracking-wider font-black">
                  Display Interrupted
                </h2>
                <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  A component error occurred during rendering.
                </p>
              </div>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-950/40 border-2 border-red-500 rounded-xl mb-4 font-mono text-xs text-red-700 dark:text-red-300 break-words">
              <strong>Error:</strong> {this.state.error?.message || 'Unknown render exception'}
            </div>

            {this.state.errorInfo && (
              <details className="mb-4">
                <summary className="font-mono text-xs text-slate-500 cursor-pointer hover:underline mb-1">
                  View Component Stack Details
                </summary>
                <pre className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-lg text-[10px] font-mono text-slate-600 dark:text-slate-400 overflow-x-auto max-h-40">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 py-3 px-4 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] border-2 border-[#111215] font-headline text-lg font-bold text-[#111215] shadow-[3px_3px_0px_#111215] active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 rounded-xl bg-white dark:bg-[#1E2638] hover:bg-slate-100 dark:hover:bg-[#28354E] border-2 border-[#111215] font-headline text-lg font-bold text-[#111215] dark:text-white shadow-[3px_3px_0px_#111215] active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Reset & Sign In</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
