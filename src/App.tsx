import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import FindPage from './pages/FindPage';
import HomePage from './pages/HomePage';
import HouseDetailPage from './pages/HouseDetailPage';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/find" element={<FindPage />} />
        <Route path="/houses/:id" element={<HouseDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
