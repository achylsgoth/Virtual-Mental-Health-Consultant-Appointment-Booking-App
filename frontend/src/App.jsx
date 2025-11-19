import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import Forgotpassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";
import VerifyEmail from "./pages/verifyEmail";
import RoleSelection from "./pages/RoleSelection";
import { colors, CssBaseline, GlobalStyles } from "@mui/material";
import ClientDashboardPage from "./pages/ClientDashboard.jsx";
import TherapistDashboardPage from "./pages/Therapistdashboard.jsx";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore.js";
import CircularProgress from '@mui/material/CircularProgress';
import OnboardingFlow from "./pages/onboardingtherapist";
import AppointmentBooking from "./pages/booking.jsx";
import ClientOnboarding from "./pages/OnBoardingClient.jsx";
import FindTherapist from "./pages/therapistSearch.jsx";
import HomePage from "./pages/homepage.jsx";
import AvailabilityManagement from "./therapistDash/setAvailability.jsx";
import SessionsManagement from "./therapistDash/sessionList.jsx";
import PatientSessionsManagement from "./clientDash/upcomingSession";
import JournalManagement from "./clientDash/journal.jsx";
import MoodTracker from "./clientDash/moodtracker.jsx";
import HealNestAdminDashboard from "./admindashboard/dashboard";
import MindShareFeed from "./pages/feedPage.jsx";
import PaymentSuccessPage from "./components/paymentSuccess.jsx";
import AdminLoginPage from "./admindashboard/adminlogin.jsx";
import ProfileEditPage from "./therapistDash/profile.jsx";
import HowItWorksPage from "./pages/howitworks.jsx";
import AboutMePage from "./pages/aboutus.jsx";
import AvailabilityPage from "./therapistDash/availabilityPage.jsx";
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user, isCheckingAuth } = useAuthStore();

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width:'100%' }}>
        <CircularProgress />
      </div>
    );
  }

  // Redirect based on role if authenticated and verified
  if (isAuthenticated) {
    if (!user.isVerified) {
      return <Navigate to="/verify-email" replace />;
    }

    // Redirect users to onboarding if they haven't completed it
    if (user.role === "therapist" && !user.isOnboarded) {
      return <Navigate to="/therapist/onboarding" replace />;
    }
    if (user.role === "client" && !user.isOnboarded) {
      return <Navigate to="/client/onboarding" replace />;
    }

    // Redirect based on role
    switch (user.role) {
      case "client":
        return <Navigate to="/client-dashboard" replace />;
      case "therapist":
        return <Navigate to="/therapist-dashboard" replace />;
      case "admin":
        return <Navigate to="/admin-dashboard" replace />;
      default:
        return <Navigate to="/select-role" replace />;
    }
  }

  // If not authenticated, render children
  return children;
};

const App = () => {
  const { isCheckingAuth, checkAuth } = useAuthStore();

  // Check authentication on component mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <Router>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            margin: 0,
            padding: 0,
           
            justifyContent: "center",
            alignItems: "center",
          
          },
          "#root": {
            width: "100%",
            height: "100%",
          },
        }}
      />
      <Routes>
      <Route path="/home" element={<HomePage />} />
        <Route
          path="/signup"
          element={
            <RedirectAuthenticatedUser>
              <SignUpPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/signin"
          element={
            <RedirectAuthenticatedUser>
              <LoginPage />
            </RedirectAuthenticatedUser>
          }
        />

        <Route path="/forgotpassword" element={<Forgotpassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/therapist/onboarding" element={<OnboardingFlow />} />
        <Route path="/client/onboarding" element={<ClientOnboarding />} />
        <Route path="/booking/:id" element={<AppointmentBooking />} />
        <Route path="/therapist-search" element={<FindTherapist />} />
        <Route path="/availability" element={<AvailabilityPage/>} />
        <Route path="/sessionList" element={<SessionsManagement/>} />
        <Route path="/sessionList/:id" element={<SessionsManagement/>} />
        <Route path="/clientsessionList" element={<PatientSessionsManagement/>} />
        <Route path="/clientsessionList/:id" element={<PatientSessionsManagement/>} />
        


        <Route path="/howitworks" element={<HowItWorksPage/>} />
        <Route path="/about" element={<AboutMePage/>} />
        <Route path="/journal" element={<JournalManagement/>} />
        <Route path="/journal/:id" element={<JournalManagement/>} />

        <Route path="/moodtracker" element={<MoodTracker/>} />

        <Route path="/admin" element={<AdminLoginPage/>}/>

        <Route path="/adminDash" element={<HealNestAdminDashboard/>} />
        <Route path="/feed" element={<MindShareFeed/>}/>

        <Route path="/paymentSuccess" element={<PaymentSuccessPage/>}/>

        <Route path="/profile" element={<ProfileEditPage/>}/>

        <Route
          path="/select-role"
          element={
            <RedirectAuthenticatedUser>
              <RoleSelection />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/client-dashboard"
          element={
            
              <ClientDashboardPage />
         
          }
        />
        <Route
          path="/therapist-dashboard"
          element={
           
              <TherapistDashboardPage />
            
          }
        />
        {/* Fallback route for unknown paths */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;