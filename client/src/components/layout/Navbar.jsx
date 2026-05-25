import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Menu, X, Map, User, Plus, LogOut, LayoutDashboard, ChevronDown,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Button from "../ui/Button";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const isLanding = location.pathname === "/";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled || !isLanding
            ? "bg-white/95 backdrop-blur-lg shadow-soft border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="container-custom flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center shadow-sm group-hover:shadow-glow transition-shadow">
              <Plane size={18} className="text-white" />
            </div>
            <span
              className={`font-display font-bold text-lg transition-colors ${
                scrolled || !isLanding ? "text-primary" : "text-white"
              }`}
            >
              AI Trip Planner
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/my-trips"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-accent/10 text-accent"
                        : scrolled || !isLanding
                        ? "text-primary-lighter hover:bg-slate-100"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`
                  }
                >
                  <LayoutDashboard size={15} />
                  My Trips
                </NavLink>
                <NavLink
                  to="/create-trip"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-accent/10 text-accent"
                        : scrolled || !isLanding
                        ? "text-primary-lighter hover:bg-slate-100"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`
                  }
                >
                  <Plus size={15} />
                  Plan Trip
                </NavLink>

                {/* Profile Dropdown */}
                <div className="relative ml-2">
                  <button
                    onClick={() => setProfileOpen((v) => !v)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                      scrolled || !isLanding
                        ? "hover:bg-slate-100 text-primary"
                        : "hover:bg-white/10 text-white"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar.startsWith("/uploads") ? `http://localhost:5000${user.avatar}` : user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.charAt(0)?.toUpperCase() || "U"
                      )}
                    </div>
                    <span className="text-sm font-medium hidden lg:block">{user?.name?.split(" ")[0]}</span>
                    <ChevronDown size={14} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 bg-white rounded-2xl shadow-2xl border border-border w-52 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-border">
                          <p className="font-semibold text-sm text-primary">{user?.name}</p>
                          <p className="text-xs text-muted truncate">{user?.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-primary-lighter hover:bg-slate-50 transition-colors"
                        >
                          <User size={15} /> Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                    scrolled || !isLanding
                      ? "text-primary-lighter hover:bg-slate-100"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Log In
                </Link>
                <Button variant="primary" size="sm" onClick={() => navigate("/register")}>
                  Get Started Free
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-xl"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X size={22} className={scrolled || !isLanding ? "text-primary" : "text-white"} />
            ) : (
              <Menu size={22} className={scrolled || !isLanding ? "text-primary" : "text-white"} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-border overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-3 border-b border-border mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white font-bold">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{user?.name}</p>
                        <p className="text-xs text-muted">{user?.email}</p>
                      </div>
                    </div>
                    <NavLink to="/my-trips" className="mobile-nav-link">
                      <LayoutDashboard size={16} /> My Trips
                    </NavLink>
                    <NavLink to="/create-trip" className="mobile-nav-link">
                      <Plus size={16} /> Plan New Trip
                    </NavLink>
                    <NavLink to="/profile" className="mobile-nav-link">
                      <User size={16} /> Profile
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="mobile-nav-link">Log In</Link>
                    <Link
                      to="/register"
                      className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold bg-accent text-white"
                    >
                      Get Started Free
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      {isAuthenticated && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border safe-area-pb">
          <div className="grid grid-cols-3 h-16">
            <NavLink
              to="/my-trips"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                  isActive ? "text-accent" : "text-muted"
                }`
              }
            >
              <LayoutDashboard size={20} />
              My Trips
            </NavLink>
            <NavLink
              to="/create-trip"
              className="flex flex-col items-center justify-center -mt-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center shadow-glow">
                <Plus size={24} className="text-white" />
              </div>
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                  isActive ? "text-accent" : "text-muted"
                }`
              }
            >
              <User size={20} />
              Profile
            </NavLink>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
