import { Component, type ErrorInfo, type ReactNode } from 'react';
import { MaterialIcon } from '@/components/MaterialIcon';
import './error-boundary.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Em produção, enviar para um serviço de observabilidade (ex: Sentry).
    console.error('[ErrorBoundary] erro não tratado:', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className="error-boundary" role="alert">
        <div className="error-boundary__icon">
          <MaterialIcon name="sentiment_dissatisfied" />
        </div>
        <h1 className="error-boundary__title">Algo deu errado</h1>
        <p className="error-boundary__text">
          Tivemos um imprevisto ao carregar esta tela. Tente recarregar o app.
        </p>
        <button className="error-boundary__button" onClick={this.handleReload} type="button">
          Recarregar
        </button>
      </div>
    );
  }
}
