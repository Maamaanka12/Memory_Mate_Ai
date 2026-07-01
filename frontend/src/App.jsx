import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage    from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import NotesPage    from './pages/Notes/NotesPage';
import QuizPage     from './pages/Quiz/QuizPage';
import QuizTakePage from './pages/Quiz/QuizTakePage';
import QuizReviewPage from './pages/Quiz/QuizReviewPage';
import ReportsPage  from './pages/Reports/ReportsPage';
import AppLayout    from './components/layout/AppLayout';

const Protected = ({ children }) => {
  const { isAuth, loading } = useAuth();
  if (loading) return null;
  return isAuth ? children : <Navigate to="/login" replace />;
};

const GuestOnly = ({ children }) => {
  const { isAuth, loading } = useAuth();
  if (loading) return null;
  return !isAuth ? children : <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Guest routes */}
          <Route path="/login"    element={<GuestOnly><LoginPage /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />

          {/* Protected routes inside layout */}
          <Route path="/" element={<Protected><AppLayout /></Protected>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"        element={<DashboardPage />} />
            <Route path="notes"            element={<NotesPage />} />
            <Route path="quiz"             element={<QuizPage />} />
            <Route path="quiz/:id/take"    element={<QuizTakePage />} />
            <Route path="quiz/:id/review"  element={<QuizReviewPage />} />
            <Route path="reports"          element={<ReportsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
