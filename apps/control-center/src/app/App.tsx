import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router";
import { AppShell } from "./AppShell";
import { RouteErrorBoundary } from "./RouteErrorBoundary";
import { FoundationPage } from "../features/foundation/FoundationPage";
import { MaturityPage } from "../features/maturity/MaturityPage";
import { OverviewPage } from "../features/overview/OverviewPage";
import { EcosystemPage } from "../features/ecosystem/EcosystemPage";
import { EvidencePage } from "../features/evidence/EvidencePage";
import { OperationsPage } from "../features/operations/OperationsPage";
import { AssurancePage } from "../features/assurance/AssurancePage";
import "../features/maturity/maturity.css";

const guarded = (label: string, node: ReactNode) => (
  <RouteErrorBoundary label={label}>{node}</RouteErrorBoundary>
);

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={guarded("Overview", <OverviewPage />)} />
        <Route path="/maturity" element={guarded("Maturità", <MaturityPage />)} />
        <Route path="/ecosystem" element={guarded("Ecosistema", <EcosystemPage />)} />
        <Route path="/evidence" element={guarded("Evidenze", <EvidencePage />)} />
        <Route path="/operations" element={guarded("Operazioni", <OperationsPage />)} />
        <Route path="/assurance" element={guarded("Assurance", <AssurancePage />)} />
        <Route path="/foundation" element={guarded("Fondazione", <FoundationPage />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
