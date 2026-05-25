import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Plane, Check } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

const getStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["", "bg-danger", "bg-highlight", "bg-blue-400", "bg-success"];

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const strength = getStrength(form.password);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error("Passwords do not match");
    if (strength < 2) return toast.error("Please use a stronger password");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-10 text-center max-w-md w-full"
        >
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <Check size={36} className="text-success" />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">Check your email!</h2>
          <p className="text-muted mb-6">
            We sent a verification link to <strong>{form.email}</strong>. 
            Click it to activate your account and start planning amazing trips.
          </p>
          <Button variant="primary" onClick={() => navigate("/login")} className="w-full">
            Go to Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left: Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=1200&q=80"
          alt="Travel"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 to-primary/90 flex flex-col items-center justify-center text-white text-center p-12">
          <div className="w-16 h-16 rounded-2xl bg-highlight flex items-center justify-center mb-6 shadow-glow-amber">
            <span className="text-3xl">✈️</span>
          </div>
          <h2 className="text-4xl font-display font-bold mb-4">Join thousands of<br />smart travelers</h2>
          <p className="text-white/70 max-w-sm">Free forever. No credit card. Unlimited AI-generated itineraries.</p>
          <div className="mt-8 space-y-3 text-left">
            {["AI-powered itineraries in seconds", "Budget-aware planning in ₹", "PDF export & trip sharing", "Real hotels & restaurant picks"].map((feat, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-white/80">
                <div className="w-5 h-5 rounded-full bg-success/30 flex items-center justify-center flex-shrink-0">
                  <Check size={11} className="text-success" />
                </div>
                {feat}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
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

          <h1 className="text-3xl font-display font-bold text-primary mb-1">Create account</h1>
          <p className="text-muted mb-8 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-accent font-semibold hover:underline">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="input-group">
              <label className="label" htmlFor="reg-name">Full name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input id="reg-name" type="text" value={form.name} onChange={set("name")} placeholder="Your full name" className="input pl-10" required />
              </div>
            </div>

            <div className="input-group">
              <label className="label" htmlFor="reg-email">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input id="reg-email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" className="input pl-10" autoComplete="email" required />
              </div>
            </div>

            <div className="input-group">
              <label className="label" htmlFor="reg-password">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="reg-password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Min 8 characters"
                  className="input pl-10 pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : "bg-slate-200"}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strength >= 3 ? "text-success" : strength >= 2 ? "text-highlight" : "text-danger"}`}>
                    {strengthLabels[strength]} password
                  </p>
                </div>
              )}
            </div>

            <div className="input-group">
              <label className="label" htmlFor="reg-confirm">Confirm password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input id="reg-confirm" type="password" value={form.confirm} onChange={set("confirm")} placeholder="Re-enter password" className="input pl-10" required />
                {form.confirm && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {form.password === form.confirm ? (
                      <Check size={16} className="text-success" />
                    ) : (
                      <span className="text-danger text-xs font-semibold">✗</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full !mt-6">
              <UserPlus size={16} /> Create Account
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
