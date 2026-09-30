import { Navigate, Route, Routes } from "react-router";
import { AppShell } from "./AppShell";
import { FoundationPage } from "../features/foundation/FoundationPage";
import { MaturityPage } from "../features/maturity/MaturityPage";
import { OverviewPage } from "../features/overview/OverviewPage";
import "../features/maturity/maturity.css";

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/maturity" element={<MaturityPage />} />
        <Route path="/foundation" element={<FoundationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
