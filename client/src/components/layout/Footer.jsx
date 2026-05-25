import React from "react";
import { Link } from "react-router-dom";
import { Plane, Twitter, Github, Instagram, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="container-custom px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center">
                <Plane size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg">AI Trip Planner</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Plan smarter, travel better. Get hyper-detailed, AI-powered itineraries tailored to 
              your budget, interests, and travel style — in seconds.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-accent transition-colors flex items-center justify-center">
                <Twitter size={15} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-accent transition-colors flex items-center justify-center">
                <Instagram size={15} />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-accent transition-colors flex items-center justify-center">
                <Github size={15} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-white/80 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2.5">
              {["Features", "How It Works", "Pricing", "Blog"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-white/80 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5">
              {["Privacy Policy", "Terms of Service", "Cookie Policy", "Contact"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} AI Trip Planner. All rights reserved.
          </p>
          <p className="text-slate-500 text-xs flex items-center gap-1">
            Made with <Heart size={12} className="text-danger" /> using Google Gemini AI
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
