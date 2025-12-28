import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
                Đã xảy ra lỗi
              </h1>
              <p className="text-neutral-600 mb-6">
                Ứng dụng đã gặp phải một lỗi không mong muốn. Vui lòng tải lại
                trang để tiếp tục.
              </p>
              {this.state.error && (
                <details className="text-left mb-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <summary className="cursor-pointer text-sm font-medium text-neutral-700 mb-2">
                    Chi tiết lỗi
                  </summary>
                  <pre className="text-xs text-neutral-600 overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              <button
                onClick={this.handleReload}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Tải lại trang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
