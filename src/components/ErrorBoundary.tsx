import { Component, ErrorInfo, ReactNode } from 'react';


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
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="card-3d p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold text-danger mb-4">⚠️ Terjadi Kesalahan</h2>
            <div className="bg-gray-800 p-4 rounded mb-4 overflow-auto max-h-64">
              <p className="text-red-400 font-mono text-sm mb-2">
                {this.state.error?.toString()}
              </p>
              <pre className="text-gray-400 text-xs whitespace-pre-wrap">
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="btn w-full py-3"
            >
              <span className="btn-letter">M</span>
              <span className="btn-letter">u</span>
              <span className="btn-letter">a</span>
              <span className="btn-letter">t</span>
              <span className="btn-letter"> </span>
              <span className="btn-letter">U</span>
              <span className="btn-letter">l</span>
              <span className="btn-letter">a</span>
              <span className="btn-letter">n</span>
              <span className="btn-letter">g</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
