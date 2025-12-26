import { Navigate, Route, Routes } from "react-router-dom";
import AppHeader from "./components/AppHeader";
import DashboardPage from "./pages/DashboardPage";
import ConfigPage from "./pages/ConfigPage";
import TeachingPage from "./pages/TeachingPage";
import SnapshotsPage from "./pages/SnapshotsPage";

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <AppHeader />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/config" element={<ConfigPage />} />
        <Route path="/teaching" element={<TeachingPage />} />
        <Route path="/snapshots" element={<SnapshotsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}