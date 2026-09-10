import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./pages/Dashboard";
import Cryptobot from "./pages/Cryptobot";
import LearningHub from "./pages/Learninghub";
import Feedback from "./pages/Feedback";
import Subscription from "./pages/Subscription";

import AdminDashboard from "./pages/AdminDashboard";
import AdminSubscriptions from "./pages/Adminsubscriptions";
import AdminMarketingTeam from "./pages/AdminMarketingTeam";
import AdminFeedback from "./pages/AdminFeedback";

import MarketingDashboard from "./pages/MarketingDashboard";
import MarketingStrategyMaker from "./pages/MarketingStrategyMaker";
import MarketingGrowthTracking from "./pages/MarketingGrowthTracking";
import MarketingMediaUploads from "./pages/MarketingMediaUploads";

import Privacy from "./pages/Privacy";
import TermsOfService from "./pages/TermsOfService";
import Support from "./pages/Support";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/privacy-policy" element={<Privacy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/support" element={<Support />} />

        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cryptobot" element={<Cryptobot />} />
          <Route path="/learninghub" element={<LearningHub />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/subscription" element={<Subscription />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-subscriptions" element={<Adminsubscriptions />} />
          <Route path="/admin-marketing" element={<AdminMarketingTeam />} />
          <Route path="/admin-feedback" element={<AdminFeedback />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["marketing"]} />}>
          <Route path="/marketing-dashboard" element={<MarketingDashboard />} />
          <Route path="/marketing-strategy" element={<MarketingStrategyMaker />} />
          <Route path="/marketing-growth" element={<MarketingGrowthTracking />} />
          <Route path="/marketing-media" element={<MarketingMediaUploads />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;