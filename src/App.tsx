import { Navigate, Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Dashboard</div>} />
      <Route path="/config" element={<div>Config</div>} />
      <Route path="/teaching" element={<div>Teaching</div>} />
      <Route path="/snapshots" element={<div>Snapshots</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}