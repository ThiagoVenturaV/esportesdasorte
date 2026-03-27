import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import HomePage from '@/pages/HomePage';
import LivePage from '@/pages/LivePage';
import ApostasPage from '@/pages/ApostasPage';
import AnalysisPage from '@/pages/AnalysisPage';
import MatchBettingPage from '@/pages/MatchBettingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import RegisterSuccessPage from '@/pages/RegisterSuccessPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import { BetSlipProvider } from '@/components/BetSlip/BetSlipContext';
import BetSlipModal from '@/components/BetSlip/BetSlipModal';
import { ROUTES } from '@/config/routes';

/** Inner router — needs to be inside BrowserRouter to use useLocation */
function AppRoutes() {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <>
      {/* Main app — uses backgroundLocation when modal is open so site stays visible */}
      <Routes location={backgroundLocation ?? location}>
        {/* Auth as full page (direct URL access, no background) */}
        <Route path={ROUTES.LOGIN}           element={<LoginPage />} />
        <Route path={ROUTES.REGISTER}        element={<RegisterPage />} />
        <Route path={ROUTES.REGISTER_SUCCESS} element={<RegisterSuccessPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />

        {/* App with layout */}
        <Route element={<Layout />}>
          <Route path={ROUTES.HOME}       element={<HomePage />}    />
          <Route path={ROUTES.LIVE}       element={<LivePage />}    />
          <Route path={ROUTES.APOSTAS}    element={<ApostasPage />} />
          <Route path={ROUTES.ANALYSIS()} element={<AnalysisPage />} />
          <Route path={ROUTES.BETTING()}  element={<MatchBettingPage />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>

      {/* Modal overlay — rendered on top of site when navigating from within app */}
      {backgroundLocation && (
        <Routes>
          <Route path={ROUTES.LOGIN}           element={<LoginPage />} />
          <Route path={ROUTES.REGISTER}        element={<RegisterPage />} />
          <Route path={ROUTES.REGISTER_SUCCESS} element={<RegisterSuccessPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        </Routes>
      )}

      {/* Global Bet Slip */}
      <BetSlipModal />
    </>
  );
}

export default function App() {
  return (
    <BetSlipProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </BetSlipProvider>
  );
}

