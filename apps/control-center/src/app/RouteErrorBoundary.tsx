import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode; label: string };
type State = { error: Error | null };

export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("TRAMA_ROUTE_ERROR", this.props.label, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <section className="route-error" role="alert">
          <p className="section-kicker">Errore isolato</p>
          <h2>{this.props.label} non è disponibile</h2>
          <p>La navigazione principale resta attiva. Ricarica la vista o torna a Overview.</p>
        </section>
      );
    }
    return this.props.children;
  }
}
