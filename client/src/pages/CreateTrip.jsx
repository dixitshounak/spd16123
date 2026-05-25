import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Wallet, Users, Sparkles, ChevronRight, ChevronLeft, Search, Calculator } from "lucide-react";
import axios from "axios";
import StepWizard, { InterestPicker } from "../components/forms/StepWizard";
import { AirplaneLoader } from "../components/ui/Spinner";
import { useGemini } from "../hooks/useGemini";
import { useTrips } from "../hooks/useTrips";
import toast from "react-hot-toast";

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

const budgetTiers = [
  { id: "budget",   label: "Budget",   range: "₹5K – ₹15K",  desc: "Hostels, street food, local transport" },
  { id: "moderate", label: "Moderate", range: "₹15K – ₹40K", desc: "3-star hotels, restaurants, cabs" },
  { id: "luxury",   label: "Luxury",   range: "₹40K+",        desc: "5-star hotels, fine dining, private tours" },
  { id: "custom",   label: "Custom",   range: "Any",          desc: "Set your own exact spending limit" },
];

const travelerTypes = [
  { id: "solo",    label: "Solo",    desc: "Just me, exploring freely" },
  { id: "couple",  label: "Couple",  desc: "Romantic getaway" },
  { id: "family",  label: "Family",  desc: "Family fun for all ages" },
  { id: "friends", label: "Friends", desc: "Group adventure" },
];

const fetchUnsplashImage = async (query) => {
  if (!UNSPLASH_KEY || UNSPLASH_KEY === "your_unsplash_access_key_here") return null;
  try {
    const { data } = await axios.get(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
    );
    return data.results?.[0]?.urls?.regular || null;
  } catch {
    return null;
  }
};

const CreateTrip = () => {
  const navigate = useNavigate();
  const { generateItinerary, generating, estimateBudget, estimating } = useGemini();
  const { createTrip } = useTrips();

  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    country: "",
    startDate: "",
    endDate: "",
    budgetTier: "moderate",
    budgetAmount: 25000,
    travelerType: "couple",
    travelersCount: 2,
    interests: [],
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const totalDays = form.startDate && form.endDate
    ? Math.max(1, Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1)
    : 0;

  // ─── Step 1: Destination ─────────────────────────────────────────────────
  const DestinationStep = (
    <div className="space-y-6">
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8A8F9E] mb-3">
          Where are you starting from? <span className="font-normal normal-case text-[#B5B0A8]">(Optional)</span>
        </label>
        <div className="relative group">
          <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B5B0A8] group-focus-within:text-[#111318] transition-colors" />
          <input
            type="text"
            value={form.origin}
            onChange={(e) => set("origin", e.target.value)}
            placeholder="e.g. Mumbai, New York, London..."
            className="w-full pl-11 pr-4 py-4 text-base border border-[#E8E5E0] rounded-2xl bg-[#FEFCF9] text-[#111318] placeholder-[#B5B0A8] focus:outline-none focus:ring-2 focus:ring-[#111318]/10 focus:border-[#111318] transition-all shadow-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8A8F9E] mb-3">
          Where are you dreaming of?
        </label>
        <div className="relative group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B5B0A8] group-focus-within:text-[#111318] transition-colors" />
          <input
            type="text"
            value={form.destination}
            onChange={(e) => set("destination", e.target.value)}
            placeholder="e.g. Kyoto, Paris, Bali..."
            className="w-full pl-11 pr-4 py-4 text-base border border-[#E8E5E0] rounded-2xl bg-[#FEFCF9] text-[#111318] placeholder-[#B5B0A8] focus:outline-none focus:ring-2 focus:ring-[#111318]/10 focus:border-[#111318] transition-all shadow-sm"
            id="destination-input"
          />
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8A8F9E] mb-3">
          Country <span className="font-normal normal-case text-[#B5B0A8]">(Optional)</span>
        </label>
        <div className="relative group">
          <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B5B0A8] group-focus-within:text-[#111318] transition-colors" />
          <input
            type="text"
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
            placeholder="e.g. Japan, France, Indonesia..."
            className="w-full pl-11 pr-4 py-4 text-base border border-[#E8E5E0] rounded-2xl bg-[#FEFCF9] text-[#111318] placeholder-[#B5B0A8] focus:outline-none focus:ring-2 focus:ring-[#111318]/10 focus:border-[#111318] transition-all shadow-sm"
          />
        </div>
      </div>
      
      <AnimatePresence>
        {form.destination && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="relative h-40 mt-2 rounded-2xl overflow-hidden bg-[#E8E5E0]">
              <img
                src={`https://source.unsplash.com/featured/800x400/?${encodeURIComponent(form.destination)},travel,architecture`}
                alt={form.destination}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=60"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111318]/80 via-[#111318]/20 to-transparent flex items-end p-5">
                <span className="text-white font-bold text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Destination: {form.destination}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ─── Step 2: Dates ───────────────────────────────────────────────────────
  const today = new Date().toISOString().split("T")[0];
  const DatesStep = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { label: "Arrival", key: "startDate", min: today },
          { label: "Departure", key: "endDate",   min: form.startDate || today },
        ].map(({ label, key, min }) => (
          <div key={key}>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8A8F9E] mb-3">
              {label}
            </label>
            <div className="relative group">
              <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B5B0A8] pointer-events-none" />
              <input
                type="date"
                value={form[key]}
                min={min}
                onChange={(e) => set(key, e.target.value)}
                className="w-full pl-11 pr-4 py-4 text-base border border-[#E8E5E0] rounded-2xl bg-[#FEFCF9] text-[#111318] focus:outline-none focus:ring-2 focus:ring-[#111318]/10 focus:border-[#111318] transition-all shadow-sm cursor-pointer"
              />
            </div>
          </div>
        ))}
      </div>
      
      <AnimatePresence>
        {totalDays > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-4 p-5 bg-[#111318] rounded-2xl shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex flex-col items-center justify-center text-white flex-shrink-0">
              <span className="text-sm font-bold leading-none">{totalDays}</span>
              <span className="text-[9px] uppercase tracking-wider text-white/70 mt-1">Days</span>
            </div>
            <div>
              <p className="font-bold text-white text-base" style={{ fontFamily: "'Outfit', sans-serif" }}>
                A {totalDays}-day journey
              </p>
              <p className="text-xs text-[#D1CEC9] mt-0.5">
                {totalDays <= 3 ? "A perfect weekend escape." : totalDays <= 7 ? "An immersive week-long exploration." : "A grand adventure awaits."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ─── Step 3: Budget ──────────────────────────────────────────────────────
  const BudgetStep = (
    <div className="space-y-6">
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8A8F9E] mb-3">
          Travel Style
        </label>
        <div className="space-y-3">
          {budgetTiers.map((tier) => (
            <button
              key={tier.id}
              type="button"
              onClick={() => set("budgetTier", tier.id)}
              className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                form.budgetTier === tier.id
                  ? "border-[#111318] bg-[#111318] text-white shadow-md"
                  : "border-[#E8E5E0] bg-[#FEFCF9] text-[#111318] hover:border-[#C8C3BB] hover:shadow-sm"
              }`}
            >
              <div>
                <p className={`font-bold text-base ${form.budgetTier === tier.id ? "text-white" : "text-[#111318]"}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {tier.label}
                </p>
                <p className={`text-[13px] mt-1 ${form.budgetTier === tier.id ? "text-[#D1CEC9]" : "text-[#6B7280]"}`}>
                  {tier.desc}
                </p>
              </div>
              <span className={`text-sm font-semibold flex-shrink-0 ml-4 px-3 py-1.5 rounded-lg ${
                form.budgetTier === tier.id 
                  ? "bg-white/10 text-white border border-white/20" 
                  : "bg-[#F0EDE9] text-[#6B7280]"
              }`}>
                {tier.range}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8A8F9E] mb-3">
          Maximum Total Budget (₹)
        </label>
        <div className="relative group">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#111318] font-bold text-base">₹</span>
          <input
            type="number"
            value={form.budgetAmount === "" ? "" : form.budgetAmount}
            onChange={(e) => set("budgetAmount", e.target.value === "" ? "" : parseInt(e.target.value))}
            className="w-full pl-10 pr-4 py-4 text-base font-medium border border-[#E8E5E0] rounded-2xl bg-[#FEFCF9] text-[#111318] focus:outline-none focus:ring-2 focus:ring-[#111318]/10 focus:border-[#111318] transition-all shadow-sm"
            min={1000}
            step={1000}
          />
        </div>
      </div>
    </div>
  );

  // ─── Step 4: Travelers ───────────────────────────────────────────────────
  const TravelersStep = (
    <div className="space-y-6">
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8A8F9E] mb-3">
          Who's going?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {travelerTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => {
                set("travelerType", type.id);
                if (type.id === "solo") set("travelersCount", 1);
                if (type.id === "couple") set("travelersCount", 2);
              }}
              className={`flex flex-col items-start p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                form.travelerType === type.id
                  ? "border-[#111318] bg-[#111318] text-white shadow-md"
                  : "border-[#E8E5E0] bg-[#FEFCF9] hover:border-[#C8C3BB] hover:shadow-sm"
              }`}
            >
              <p className={`font-bold text-base ${form.travelerType === type.id ? "text-white" : "text-[#111318]"}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                {type.label}
              </p>
              <p className={`text-xs mt-1 ${form.travelerType === type.id ? "text-[#D1CEC9]" : "text-[#6B7280]"}`}>
                {type.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8A8F9E] mb-3">
          Party Size
        </label>
        <div className="flex items-center gap-5 bg-[#FEFCF9] border border-[#E8E5E0] p-3 rounded-2xl w-max shadow-sm">
          <button
            type="button"
            onClick={() => set("travelersCount", Math.max(1, form.travelersCount - 1))}
            className="w-12 h-12 rounded-xl border border-[#E8E5E0] bg-white flex items-center justify-center text-xl text-[#111318] hover:border-[#111318] hover:bg-[#F0EDE9] transition-all"
          >
            −
          </button>
          <div className="w-12 text-center">
            <span className="text-3xl font-bold text-[#111318]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {form.travelersCount}
            </span>
          </div>
          <button
            type="button"
            onClick={() => set("travelersCount", Math.min(20, form.travelersCount + 1))}
            className="w-12 h-12 rounded-xl border border-[#E8E5E0] bg-white flex items-center justify-center text-xl text-[#111318] hover:border-[#111318] hover:bg-[#F0EDE9] transition-all"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Step 5: Interests ───────────────────────────────────────────────────
  const InterestsStep = (
    <div className="space-y-5">
      <p className="text-[13px] text-[#6B7280] leading-relaxed">
        Select what excites you. Our AI will curate activities, dining, and sights specifically aligned with your tastes.
      </p>
      <div className="bg-[#FEFCF9] border border-[#E8E5E0] p-5 rounded-2xl shadow-sm">
        <InterestPicker selected={form.interests} onChange={(v) => set("interests", v)} />
      </div>
      {form.interests.length > 0 && (
        <p className="text-xs font-bold text-[#4F46E5] uppercase tracking-widest">
          {form.interests.length} Curated Interest{form.interests.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );

  // ─── Step 6: Review & Generate ───────────────────────────────────────────
  const ReviewStep = (
    <div className="space-y-6">
      <p className="text-[13px] text-[#6B7280]">
        Please review your travel profile. If everything looks perfect, we'll begin crafting your bespoke itinerary.
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Destination", value: form.destination },
          { label: "Duration",    value: totalDays ? `${totalDays} Days` : "—" },
          { label: "Budget",      value: `₹${form.budgetAmount?.toLocaleString("en-IN")}` },
          { label: "Travelers",   value: `${form.travelersCount} ${form.travelerType}` },
        ].map((item, i) => (
          <div key={i} className="p-4 bg-[#FEFCF9] border border-[#E8E5E0] rounded-xl shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8F9E] mb-1">{item.label}</p>
            <p className="font-bold text-[#111318] text-[15px] capitalize">{item.value}</p>
          </div>
        ))}
      </div>

      {form.interests.length > 0 && (
        <div className="p-5 bg-[#FEFCF9] border border-[#E8E5E0] rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8F9E] mb-3">Interests</p>
          <div className="flex flex-wrap gap-2">
            {form.interests.map((i) => (
              <span key={i} className="text-xs font-semibold text-[#111318] bg-white border border-[#E8E5E0] px-3 py-1.5 rounded-lg capitalize shadow-sm">
                {i}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="p-6 bg-[#111318] rounded-2xl shadow-md relative overflow-hidden">
        {/* Subtle grid bg */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white font-bold text-[15px] mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <Sparkles size={16} className="text-[#D97706]" /> Designing your experience...
          </div>
          <ul className="text-[13px] text-[#D1CEC9] space-y-2.5">
            <li className="flex items-start gap-2.5">
              <div className="mt-0.5 text-[#059669]">✓</div> 
              <span>Curating a bespoke day-by-day itinerary with exact timings.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="mt-0.5 text-[#059669]">✓</div> 
              <span>Sourcing premium accommodation tailored to your budget.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="mt-0.5 text-[#059669]">✓</div> 
              <span>Selecting exceptional culinary and dining experiences.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="mt-0.5 text-[#059669]">✓</div> 
              <span>Compiling local insights, essential packing list, and safety protocols.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const steps = [
    { title: "Destination", subtitle: "The foundation of your journey.",      component: DestinationStep },
    { title: "Timeline",    subtitle: "When will you be travelling?",         component: DatesStep },
    { title: "Budget",      subtitle: "Define your spending parameters.",     component: BudgetStep },
    { title: "Party",       subtitle: "Who will be experiencing this?",       component: TravelersStep },
    { title: "Preferences", subtitle: "Tailor the experience to your tastes.", component: InterestsStep },
    { title: "Review",      subtitle: "Finalise your travel profile.",        component: ReviewStep },
  ];

  const validateStep = () => {
    if (currentStep === 0 && !form.destination.trim()) { toast.error("Please provide a destination."); return false; }
    if (currentStep === 1 && (!form.startDate || !form.endDate)) { toast.error("Please specify your travel dates."); return false; }
    if (currentStep === 2 && form.budgetAmount < 1000) { toast.error("Budget must be at least ₹1,000."); return false; }
    return true;
  };

  const handleNext = () => { if (validateStep()) setCurrentStep((s) => s + 1); };
  const handlePrev = () => setCurrentStep((s) => s - 1);

  const handleGenerate = async () => {
    if (!form.destination) return toast.error("Destination is required.");
    if (!form.startDate || !form.endDate) return toast.error("Please select travel dates.");
    try {
      const coverImagePromise = fetchUnsplashImage(form.destination);
      const itinerary = await generateItinerary({
        origin: form.origin,
        destination: form.destination,
        totalDays,
        budgetTier: form.budgetTier,
        budgetAmount: form.budgetAmount,
        travelerType: form.travelerType,
        travelersCount: form.travelersCount,
        interests: form.interests,
        startDate: form.startDate,
      });
      const coverImage = await coverImagePromise;
      const trip = await createTrip({
        origin: form.origin,
        destination: form.destination,
        country: form.country,
        coverImage,
        startDate: form.startDate,
        endDate: form.endDate,
        totalDays,
        budgetTier: form.budgetTier,
        budgetAmount: form.budgetAmount,
        travelersCount: form.travelersCount,
        travelerType: form.travelerType,
        interests: form.interests,
        itinerary,
        status: "upcoming",
      });
      toast.success("Your itinerary has been crafted.");
      navigate(`/view-trip/${trip._id}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "An error occurred while generating the trip.");
    }
  };

  if (generating) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center pt-16">
        <AirplaneLoader message={`Crafting your bespoke ${form.destination} experience...`} />
      </div>
    );
  }

  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#F7F5F2] pt-24 pb-24 px-4 font-sans text-[#111318]">
      <div className="max-w-xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#111318] mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Design Your Journey
          </h1>
          <p className="text-[15px] text-[#6B7280]">
            Provide a few details, and our AI will orchestrate the perfect itinerary.
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A8F9E]">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-[10px] font-bold text-[#111318]">{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full h-1.5 bg-[#E8E5E0] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#111318]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Wizard Card */}
        <div className="bg-white border border-[#E8E5E0] rounded-3xl p-8 md:p-10 shadow-[0_4px_24px_rgba(17,19,24,0.04)]">
          <div className="mb-8 border-b border-[#F0EDE9] pb-6">
            <h2 className="text-2xl font-bold text-[#111318]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {steps[currentStep].title}
            </h2>
            <p className="text-[13px] text-[#8A8F9E] mt-1.5 font-medium uppercase tracking-wider">
              {steps[currentStep].subtitle}
            </p>
          </div>

          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-[280px]"
          >
            {steps[currentStep].component}
          </motion.div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#E8E5E0]">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-[#8A8F9E] hover:text-[#111318] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            {isLastStep ? (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-white bg-[#111318] hover:bg-[#1E2330] disabled:opacity-60 px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Sparkles size={16} className="text-[#D97706]" />
                Generate Itinerary
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-white bg-[#111318] hover:bg-[#1E2330] px-7 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Next
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Minimalist dot indicators below card */}
        <div className="flex justify-center gap-2 mt-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                i === currentStep ? "w-8 bg-[#111318]" : i < currentStep ? "w-2 bg-[#B5B0A8]" : "w-2 bg-[#E8E5E0]"
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default CreateTrip;
