import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, MapPin, Wallet, Hotel, Cloud, Download, Share2,
  ChevronRight, Star, ArrowRight, Plane, Globe, Zap,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import Footer from "../components/layout/Footer";

const HERO_IMAGE = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2000&q=80";

const features = [
  { icon: <Sparkles className="text-highlight" size={22} />, title: "AI-Powered Planning", desc: "Gemini AI generates hyper-detailed, personalized itineraries in seconds based on your unique preferences." },
  { icon: <Wallet className="text-success" size={22} />, title: "Budget Optimization", desc: "Smart budget breakdowns keep your entire trip costs — hotels, food, activities — within your budget." },
  { icon: <Hotel className="text-accent" size={22} />, title: "Real Hotel Picks", desc: "Get curated real hotel recommendations with booking links to MakeMyTrip and Booking.com." },
  { icon: <Cloud className="text-blue-400" size={22} />, title: "Live Weather", desc: "Real-time weather widget for your destination so you always know what to pack." },
  { icon: <Download className="text-purple-500" size={22} />, title: "PDF Export", desc: "Download your entire trip as a beautifully formatted PDF to take offline." },
  { icon: <Share2 className="text-pink-400" size={22} />, title: "Trip Sharing", desc: "Share your trip with a public link so friends and family can view the full itinerary." },
];

const steps = [
  { emoji: "🗺️", step: "01", title: "Tell us your dream", desc: "Enter your destination, dates, budget, and travel style in our guided 6-step wizard." },
  { emoji: "🤖", step: "02", title: "AI does the magic", desc: "Our Gemini-powered AI crafts a full day-by-day itinerary with real places, meals, and hotels." },
  { emoji: "✈️", step: "03", title: "Travel with confidence", desc: "Access your itinerary, maps, budget charts, and packing list — anytime, anywhere." },
];

const testimonials = [
  { name: "Priya Sharma", role: "Solo traveler", avatar: "P", text: "I planned my entire Bali trip in 5 minutes! The detail is unbelievable — real restaurants, exact times, even insider tips.", rating: 5 },
  { name: "Rahul & Meera", role: "Couple travelers", avatar: "R", text: "We used it for our Rajasthan road trip. The budget breakdown was spot on and the hotel picks were perfect for our honeymoon.", rating: 5 },
  { name: "The Singh Family", role: "Family travelers", avatar: "S", text: "Planning a trip with 4 kids is chaos. This app made it so easy — the itinerary even accounted for kid-friendly activities!", rating: 5 },
];

const sampleItinerary = {
  destination: "Goa, India",
  days: 4,
  budget: "₹25,000",
  days_preview: [
    { day: 1, theme: "Beaches & Sunsets", activities: ["Calangute Beach", "Baga Beach Shacks", "Saturday Night Market"] },
    { day: 2, theme: "Heritage & Culture", activities: ["Old Goa Churches", "Panjim City Walk", "Fontainhas Latin Quarter"] },
  ],
};

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="Beautiful travel destination" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-primary/90" />
        </div>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-white/30"
            animate={{ y: [-20, -60, -20], opacity: [0, 1, 0] }}
            transition={{ duration: 3 + i, delay: i * 0.7, repeat: Infinity }}
            style={{ left: `${15 + i * 15}%`, top: `${60 + (i % 3) * 10}%` }}
          />
        ))}

        <div className="relative z-10 container-custom px-4 text-center text-white pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6">
              <Sparkles size={14} className="text-highlight" />
              Powered by Google Gemini AI
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-black mb-6 leading-tight text-balance">
              Plan Smarter.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-light to-highlight">
                Travel Better.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              Generate complete, hyper-detailed travel itineraries for any destination — with real hotels, 
              restaurants, activities, and budget breakdowns. All in under 60 seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Button
                  variant="highlight"
                  size="lg"
                  onClick={() => navigate("/create-trip")}
                  rightIcon={<ArrowRight size={18} />}
                >
                  Plan Your Next Trip
                </Button>
              ) : (
                <>
                  <Button
                    variant="highlight"
                    size="lg"
                    onClick={() => navigate("/register")}
                    rightIcon={<ArrowRight size={18} />}
                  >
                    Start Planning Free
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-white/60 text-sm">
              <span className="flex items-center gap-1.5"><Zap size={14} /> Instant generation</span>
              <span className="flex items-center gap-1.5"><Globe size={14} /> 100+ destinations</span>
              <span className="flex items-center gap-1.5"><Star size={14} className="text-highlight" /> All costs in ₹</span>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-2.5 rounded-full bg-white/60" />
          </div>
        </motion.div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="container-custom px-4">
          <div className="text-center mb-14">
            <span className="badge badge-accent mb-3">Simple Process</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-primary">
              Your dream trip in 3 steps
            </h2>
            <p className="text-muted mt-3 max-w-xl mx-auto">
              No travel agent needed. No hours of research. Just tell us what you want.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative text-center p-8 rounded-2xl bg-surface border border-border hover:border-accent/30 transition-all group hover:shadow-card"
              >
                <div className="text-5xl mb-5 animate-bounce-soft" style={{ animationDelay: `${i * 0.2}s` }}>
                  {step.emoji}
                </div>
                <div className="absolute top-5 right-5 text-4xl font-black text-border group-hover:text-accent/20 transition-colors">
                  {step.step}
                </div>
                <h3 className="font-bold text-xl text-primary mb-2">{step.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-border" size={24} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ──────────────────────────────────────────────────── */}
      <section className="section bg-surface dot-pattern">
        <div className="container-custom px-4">
          <div className="text-center mb-14">
            <span className="badge badge-highlight mb-3">Everything You Need</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-primary">
              Built for serious travelers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="card-hover p-6 group"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-primary mb-2">{feature.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SAMPLE ITINERARY PREVIEW ───────────────────────────────────── */}
      <section className="section bg-white">
        <div className="container-custom px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge badge-accent mb-3">Live Example</span>
              <h2 className="text-4xl font-display font-bold text-primary mb-4">
                See what AI creates
              </h2>
              <p className="text-muted leading-relaxed mb-6">
                Here's a sample of what our AI generates — complete day-by-day plans with real venues, 
                timings, costs, and insider tips tailored to your preferences.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(isAuthenticated ? "/create-trip" : "/register")}
                rightIcon={<ArrowRight size={16} />}
              >
                Generate Your Itinerary
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="card p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-primary">{sampleItinerary.destination}</h3>
                  <p className="text-muted text-sm">{sampleItinerary.days} days • {sampleItinerary.budget} budget</p>
                </div>
                <span className="text-3xl">🇮🇳</span>
              </div>

              <div className="divider" />

              {sampleItinerary.days_preview.map((day, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-accent text-white text-xs font-bold flex items-center justify-center">
                      {day.day}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-primary">Day {day.day}</p>
                      <p className="text-xs text-muted">{day.theme}</p>
                    </div>
                  </div>
                  <div className="ml-9 space-y-1.5">
                    {day.activities.map((act, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm text-primary-lighter">
                        <MapPin size={11} className="text-accent flex-shrink-0" />
                        {act}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted text-center">+ Restaurants, hotels, tips, maps & budget breakdown</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ───────────────────────────────────────────────── */}
      <section className="section bg-gradient-to-br from-primary to-primary-light">
        <div className="container-custom px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-display font-bold text-white mb-3">
              Travelers love AI Trip Planner
            </h2>
            <p className="text-white/60">Join thousands of happy travelers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-white space-y-4"
              >
                <div className="flex">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-highlight fill-highlight" />
                  ))}
                </div>
                <p className="text-white/80 text-sm leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-white/50 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─────────────────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="container-custom px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-6xl mb-6 animate-float">✈️</div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
              Ready to travel smarter?
            </h2>
            <p className="text-muted max-w-xl mx-auto mb-8">
              Join thousands of travelers who plan better trips in minutes, not hours.
            </p>
            <Button
              variant="highlight"
              size="lg"
              onClick={() => navigate(isAuthenticated ? "/create-trip" : "/register")}
              rightIcon={<ArrowRight size={18} />}
            >
              {isAuthenticated ? "Plan a New Trip" : "Get Started — It's Free"}
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
