import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import MachineDetailPage from './pages/MachineDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/machines/:id" element={<MachineDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
