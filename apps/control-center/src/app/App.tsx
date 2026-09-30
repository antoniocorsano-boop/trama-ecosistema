import { Navigate, Route, Routes } from "react-router";
import { AppShell } from "./AppShell";
import { FoundationPage } from "../features/foundation/FoundationPage";
import { MaturityPage } from "../features/maturity/MaturityPage";
import { OverviewPage } from "../features/overview/OverviewPage";
import { EcosystemPage } from "../features/ecosystem/EcosystemPage";
import { EvidencePage } from "../features/evidence/EvidencePage";
import { OperationsPage } from "../features/operations/OperationsPage";
import { AssurancePage } from "../features/assurance/AssurancePage";
import "../features/maturity/maturity.css";

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/maturity" element={<MaturityPage />} />
        <Route path="/ecosystem" element={<EcosystemPage />} />
        <Route path="/evidence" element={<EvidencePage />} />
        <Route path="/operations" element={<OperationsPage />} />
        <Route path="/assurance" element={<AssurancePage />} />
        <Route path="/foundation" element={<FoundationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
