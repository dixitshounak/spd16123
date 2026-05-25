import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, LogIn, Plane } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/my-trips";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill in all fields");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back! 👋");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left: Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1200&q=80"
          alt="Travel"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 to-primary/90 flex flex-col items-center justify-center text-white text-center p-12">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-6 shadow-glow">
            <Plane size={28} />
          </div>
          <h2 className="text-4xl font-display font-bold mb-4">Welcome back,<br />explorer!</h2>
          <p className="text-white/70 max-w-sm">Your adventures await. Sign in to access your AI-powered travel plans.</p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center">
              <Plane size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-primary">AI Trip Planner</span>
          </div>

          <h1 className="text-3xl font-display font-bold text-primary mb-1">Sign in</h1>
          <p className="text-muted mb-8 text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-accent font-semibold hover:underline">
              Create one free
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="input-group">
              <label className="label" htmlFor="email">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input pl-10"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="flex items-center justify-between">
                <label className="label" htmlFor="password">Password</label>
                <Link to="/forgot-password" className="text-xs text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="input pl-10 pr-10"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
              <LogIn size={16} /> Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted">
              By signing in, you agree to our{" "}
              <a href="#" className="text-accent hover:underline">Terms</a> and{" "}
              <a href="#" className="text-accent hover:underline">Privacy Policy</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
