import React from "react";
import { Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

// Layout
import Navbar from "./components/layout/Navbar.jsx";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";

// Pages
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import CreateTrip from "./pages/CreateTrip.jsx";
import ViewTrip from "./pages/ViewTrip.jsx";
import MyTrips from "./pages/MyTrips.jsx";
import ShareTrip from "./pages/ShareTrip.jsx";
import Profile from "./pages/Profile.jsx";

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.25 }}
  >
    {children}
  </motion.div>
);

const App = () => {
  const location = useLocation();

  // Pages where Navbar should NOT appear
  const noNavbar = ["/login", "/register", "/forgot-password"].some((p) =>
    location.pathname.startsWith(p)
  );

  return (
    <div className="App">
      {!noNavbar && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
          <Route path="/share/:token" element={<PageWrapper><ShareTrip /></PageWrapper>} />

          {/* Protected Routes */}
          <Route path="/my-trips" element={<ProtectedRoute><PageWrapper><MyTrips /></PageWrapper></ProtectedRoute>} />
          <Route path="/create-trip" element={<ProtectedRoute><PageWrapper><CreateTrip /></PageWrapper></ProtectedRoute>} />
          <Route path="/view-trip/:id" element={<ProtectedRoute><PageWrapper><ViewTrip /></PageWrapper></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><PageWrapper><Profile /></PageWrapper></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
              <div className="text-7xl mb-6 animate-float">🗺️</div>
              <h1 className="text-4xl font-display font-bold text-primary mb-3">Page Not Found</h1>
              <p className="text-muted mb-6">Looks like you've wandered off the map!</p>
              <a href="/" className="btn btn-primary">Go Home</a>
            </div>
          } />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

export default App;
