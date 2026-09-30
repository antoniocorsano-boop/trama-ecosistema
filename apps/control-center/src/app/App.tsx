import { Navigate, Route, Routes } from "react-router";
import { AppShell } from "./AppShell";
import { FoundationPage } from "../features/foundation/FoundationPage";

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<FoundationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
