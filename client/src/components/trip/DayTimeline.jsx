import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, ChevronDown, ChevronUp, Lightbulb, ExternalLink, Utensils, BedDouble, Navigation } from "lucide-react";

/* Period accent system — tasteful left-border color, not background fill */
const periodConfig = {
  morning: {
    label: "Morning",
    time_label: "AM",
    dot: "#F59E0B",        // amber
    border: "#FDE68A",     // amber-200
    icon: "🌤",
  },
  afternoon: {
    label: "Afternoon",
    time_label: "PM",
    dot: "#60A5FA",        // blue-400
    border: "#BFDBFE",     // blue-200
    icon: "☀️",
  },
  evening: {
    label: "Evening",
    time_label: "Eve",
    dot: "#A78BFA",        // violet-400
    border: "#DDD6FE",     // violet-200
    icon: "🌙",
  },
};

/* ─── Activity Card ─────────────────────────────────────────────────────────── */
const ActivityCard = ({ period, data, isLast }) => {
  const [tipsOpen, setTipsOpen] = useState(false);
  if (!data) return null;

  const cfg = periodConfig[period];
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(data.googleMapsQuery || data.place)}`;

  return (
    <div className="relative flex gap-5">
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ paddingTop: 14 }}>
        <div
          className="w-3 h-3 rounded-full ring-2 ring-white shadow-md z-10 flex-shrink-0"
          style={{ backgroundColor: cfg.dot }}
        />
        {!isLast && (
          <div className="w-px flex-1 mt-2" style={{ background: "linear-gradient(to bottom, #E8E5E0, transparent)", minHeight: 48 }} />
        )}
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 mb-6"
        style={{
          background: "#FFFFFF",
          border: "1px solid #EAE7E2",
          borderLeft: `3px solid ${cfg.dot}`,
          borderRadius: "12px",
          boxShadow: "0 1px 4px rgba(17,19,24,0.05), 0 4px 16px rgba(17,19,24,0.06)",
          overflow: "hidden",
        }}
      >
        <div className="p-4">
          {/* Top row */}
          <div className="flex items-start justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">{cfg.icon}</span>
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: cfg.dot }}
              >
                {cfg.label}
              </span>
              <span className="text-[10px] text-[#B5B0A8] font-mono bg-[#F7F5F2] border border-[#E8E5E0] px-1.5 py-0.5 rounded">
                {data.time}
              </span>
            </div>
            <span className="text-sm font-bold text-[#111318]">{data.cost}</span>
          </div>

          {/* Activity name */}
          <h4 className="font-semibold text-[#111318] text-[15px] leading-snug mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {data.activity}
          </h4>

          {/* Transit Info */}
          {data.travelTo && (
            <div className="mb-4 mt-2 px-3 py-2.5 bg-[#EEF2FF] rounded-xl border border-[#E0E7FF] flex items-start gap-2.5 text-[13px] text-[#374151]">
              <Navigation size={14} className="mt-0.5 text-[#4F46E5] flex-shrink-0" />
              <span className="leading-relaxed">
                <strong className="text-[#312E81] font-semibold">Transit: </strong> 
                {data.travelTo}
              </span>
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#8A8F9E] mb-3">
            <span className="flex items-center gap-1.5 font-medium text-[#6B7280]">
              <MapPin size={11} style={{ color: cfg.dot }} />
              {data.place}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={11} />
              {data.duration}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280] bg-[#F7F5F2] hover:bg-[#F0EDE9] border border-[#E8E5E0] px-3 py-1.5 rounded-lg transition-all"
            >
              <ExternalLink size={10} />
              Open Maps
            </a>
            {data.tips && (
              <button
                onClick={() => setTipsOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280] bg-[#F7F5F2] hover:bg-[#F0EDE9] border border-[#E8E5E0] px-3 py-1.5 rounded-lg transition-all"
              >
                <Lightbulb size={10} className="text-amber-500" />
                Insider tip
                {tipsOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              </button>
            )}
          </div>

          <AnimatePresence>
            {tipsOpen && data.tips && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-[#F0EDE9] flex gap-2.5 text-xs text-[#6B7280] leading-relaxed">
                  <Lightbulb size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  {data.tips}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

/* ─── Meal Card ─────────────────────────────────────────────────────────────── */
const MealCard = ({ meal }) => (
  <div
    className="flex-1 min-w-0 p-3.5 rounded-xl"
    style={{ background: "#FEFCF9", border: "1px solid #EAE7E2" }}
  >
    <div className="flex items-center justify-between mb-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#B5B0A8]">
        {meal.type}
      </span>
      <span className="text-xs font-semibold text-[#6B7280]">{meal.cost}</span>
    </div>
    <p className="font-semibold text-[13px] text-[#111318] leading-snug">{meal.restaurant}</p>
    <p className="text-[11px] text-[#8A8F9E] mt-0.5">{meal.dish}</p>
  </div>
);

/* ─── Hotel Card ────────────────────────────────────────────────────────────── */
const HotelCard = ({ hotel }) => {
  if (!hotel) return null;
  const stars = Math.round(hotel.rating || 4);
  const bookingUrl = `https://www.booking.com/search.html?ss=${encodeURIComponent(hotel.name)}`;

  return (
    <div
      className="rounded-2xl p-5 text-white relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1a1c2e 0%, #2d2f4a 50%, #1e2035 100%)" }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Hotel · {hotel.area}
            </p>
            <h4 className="font-bold text-white text-lg leading-snug" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {hotel.name}
            </h4>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <p className="font-bold text-amber-300 text-base">{hotel.pricePerNight}</p>
            <p className="text-[10px] text-slate-400">/ night</p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-sm ${i < stars ? "text-amber-400" : "text-white/10"}`}>★</span>
          ))}
          <span className="text-xs text-slate-400 ml-2">{hotel.rating}</span>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-4">{hotel.whyRecommended}</p>

        <div className="flex gap-2">
          <a
            href={bookingUrl}
            target="_blank" rel="noreferrer"
            className="flex-1 text-center py-2 rounded-xl text-xs font-semibold text-white transition-all"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)" }}
            onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.18)"}
            onMouseLeave={e => e.target.style.background = "rgba(255,255,255,0.1)"}
          >
            Booking.com
          </a>
          <a
            href={`https://www.makemytrip.com/hotels/?cityCode=${encodeURIComponent(hotel.name)}`}
            target="_blank" rel="noreferrer"
            className="flex-1 text-center py-2 rounded-xl text-xs font-semibold text-white transition-all"
            style={{ background: "rgba(79,70,229,0.5)", border: "1px solid rgba(99,102,241,0.4)" }}
            onMouseEnter={e => e.target.style.background = "rgba(79,70,229,0.7)"}
            onMouseLeave={e => e.target.style.background = "rgba(79,70,229,0.5)"}
          >
            MakeMyTrip
          </a>
        </div>
      </div>
    </div>
  );
};

/* ─── Day Timeline ──────────────────────────────────────────────────────────── */
const DayTimeline = ({ dayData }) => {
  if (!dayData) return null;

  const periods = ["morning", "afternoon", "evening"].filter(p => dayData[p]);

  return (
    <motion.div
      key={dayData.day}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Day Header */}
      <div
        className="flex items-center justify-between px-5 py-4 rounded-2xl"
        style={{ background: "linear-gradient(135deg, #111318 0%, #1E2330 100%)", border: "1px solid #2A2D3E" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "white" }}
          >
            {dayData.day}
          </div>
          <div>
            <h3 className="font-bold text-white text-[15px]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Day {dayData.day}
            </h3>
            {dayData.theme && (
              <p className="text-xs text-slate-400 mt-0.5">{dayData.theme}</p>
            )}
          </div>
        </div>
        {dayData.dailyCost && (
          <span className="text-xs font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-lg">
            {dayData.dailyCost}
          </span>
        )}
      </div>

      {/* Activities Timeline */}
      <div className="pl-1">
        {periods.map((period, i) => (
          <ActivityCard
            key={period}
            period={period}
            data={dayData[period]}
            isLast={i === periods.length - 1}
          />
        ))}
      </div>

      {/* Meals */}
      {dayData.meals?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Utensils size={12} className="text-[#8A8F9E]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A8F9E]">Dining</span>
          </div>
          <div className="flex gap-2 flex-wrap md:flex-nowrap">
            {dayData.meals.map((meal, i) => <MealCard key={i} meal={meal} />)}
          </div>
        </div>
      )}

      {/* Hotel */}
      {dayData.hotel && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BedDouble size={12} className="text-[#8A8F9E]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A8F9E]">Where You'll Stay</span>
          </div>
          <HotelCard hotel={dayData.hotel} />
        </div>
      )}
    </motion.div>
  );
};

export { ActivityCard, MealCard, HotelCard };
export default DayTimeline;
