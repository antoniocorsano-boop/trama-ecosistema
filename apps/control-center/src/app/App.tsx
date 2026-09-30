import { Navigate, Route, Routes } from "react-router";
import { AppShell } from "./AppShell";
import { FoundationPage } from "../features/foundation/FoundationPage";
import { MaturityPage } from "../features/maturity/MaturityPage";
import "../features/maturity/maturity.css";

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<FoundationPage />} />
        <Route path="/maturity" element={<MaturityPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
