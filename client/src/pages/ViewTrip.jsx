import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar, Users, Share2, Download, RefreshCw, MapPin,
  Luggage, Shield, Phone, CheckSquare, Square, Globe,
  Sun, MessageSquare, Banknote, Bus, Wallet, Sparkles, Plane, Train,
  Cloud, Droplets, Wind, Thermometer
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useTrips } from "../hooks/useTrips";
import { useWeather } from "../hooks/useWeather";
import { useGemini } from "../hooks/useGemini";
import DayTimeline from "../components/trip/DayTimeline";
import BudgetChart from "../components/trip/BudgetChart";
import ChatWindow from "../components/chat/ChatWindow";
import { FullPageSpinner } from "../components/ui/Spinner";
import { formatDateRange, getCountryFlag } from "../utils/parseDates";
import toast from "react-hot-toast";

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const tabs = [
  { id: "itinerary", label: "Itinerary" },
  { id: "map",       label: "Map" },
  { id: "hotels",    label: "Hotels" },
  { id: "budget",    label: "Budget" },
  { id: "tips",      label: "Tips & Safety" },
];

const ViewTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchTrip, currentTrip: trip, toggleShare } = useTrips();
  const { weather } = useWeather(trip?.destination?.split(",")[0]);
  const { regenerateItinerary, generating } = useGemini();
  const [activeTab, setActiveTab] = useState("itinerary");
  const [selectedDay, setSelectedDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`packing_${id}`)) || []; } catch { return []; }
  });
  const tripRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try { await fetchTrip(id); }
      catch { navigate("/my-trips"); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <FullPageSpinner />;
  if (!trip) return null;

  const itinerary = trip.itinerary;
  const days = itinerary?.days || [];
  const flag = getCountryFlag(trip.country || trip.destination);

  const handleDownloadPDF = async () => {
    toast.loading("Generating PDF…", { id: "pdf" });
    try {
      const el = tripRef.current;
      const canvas = await html2canvas(el, { scale: 1.5, useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 0.8);
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      let yPos = 0;
      while (yPos < pdfH) {
        pdf.addImage(imgData, "JPEG", 0, -yPos, pdfW, pdfH);
        yPos += pdf.internal.pageSize.getHeight();
        if (yPos < pdfH) pdf.addPage();
      }
      pdf.save(`${trip.destination.replace(/\s+/g, "_")}_trip.pdf`);
      toast.success("PDF downloaded!", { id: "pdf" });
    } catch {
      toast.error("PDF generation failed", { id: "pdf" });
    }
  };

  const handleShare = async () => {
    const data = await toggleShare(trip._id);
    if (data.isPublic) {
      navigator.clipboard.writeText(data.shareUrl);
      toast.success("Share link copied to clipboard");
    } else {
      toast.success("Trip is now private");
    }
  };

  const handleRegenerate = async () => {
    if (!confirm("Regenerate the itinerary? This will replace the current plan.")) return;
    const newItinerary = await regenerateItinerary(trip._id);
    if (newItinerary) window.location.reload();
  };

  const togglePacking = (item) => {
    const updated = checkedItems.includes(item)
      ? checkedItems.filter((i) => i !== item)
      : [...checkedItems, item];
    setCheckedItems(updated);
    localStorage.setItem(`packing_${id}`, JSON.stringify(updated));
  };

  // Get hotels: prefer the new hotelOptions array, fallback to grouping daily hotels
  let displayHotels = [];
  if (itinerary?.hotelOptions && itinerary.hotelOptions.length > 0) {
    displayHotels = itinerary.hotelOptions.map(hotel => ({
      hotel,
      dayLabel: "Recommended Option"
    }));
  } else {
    // Legacy fallback: group consecutive hotel stays to prevent duplicate cards
    const uniqueHotels = [];
    days.forEach((d) => {
      if (!d.hotel) return;
      const existing = uniqueHotels.find((h) => h.hotel.name === d.hotel.name);
      if (existing) {
        existing.dayNumbers.push(d.day);
      } else {
        uniqueHotels.push({ hotel: d.hotel, dayNumbers: [d.day] });
      }
    });
    displayHotels = uniqueHotels.map(h => ({
      hotel: h.hotel,
      dayLabel: h.dayNumbers.length > 1 
        ? `Days ${h.dayNumbers[0]} - ${h.dayNumbers[h.dayNumbers.length - 1]}` 
        : `Day ${h.dayNumbers[0]}`
    }));
  }
  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-24 md:pb-8 font-sans text-[#111318]" ref={tripRef}>

      {/* ─── SCENIC EDITORIAL HEADER ─────────────────────────────────────────────── */}
      <div className="relative h-72 md:h-[400px] overflow-hidden bg-[#111318]">
        <img
          src={trip.coverImage || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"}
          alt={trip.destination}
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-[#111318]/50 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
          <div className="max-w-5xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 backdrop-blur-md mb-5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-orange-300 animate-pulse" />
                  <p className="text-white text-[10px] font-bold tracking-widest uppercase drop-shadow-sm">
                    Your Curated Itinerary
                  </p>
                </div>
                
                <div className="flex items-center gap-5 mb-5">
                  {flag && (
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-xl flex-shrink-0">
                      {flag}
                    </div>
                  )}
                  <div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight drop-shadow-md" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {trip.destination}
                    </h1>
                    {trip.country && (
                      <p className="text-indigo-50 text-lg mt-1 font-medium flex items-center gap-2 drop-shadow-sm">
                        <MapPin size={16} className="text-orange-300" />
                        {trip.country}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Meta tags */}
                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <span className="inline-flex items-center gap-2 text-[13px] font-medium text-white bg-white/15 hover:bg-white/25 transition-colors backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl shadow-sm">
                    <Calendar size={14} className="text-orange-300" />
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </span>
                  <span className="inline-flex items-center gap-2 text-[13px] font-medium text-white bg-white/15 hover:bg-white/25 transition-colors backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl shadow-sm">
                    <Users size={14} className="text-indigo-200" />
                    {trip.travelersCount} {trip.travelerType}
                  </span>
                  <span className="inline-flex items-center gap-2 text-[13px] font-medium text-white bg-white/15 hover:bg-white/25 transition-colors backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl capitalize shadow-sm">
                    <Wallet size={14} className="text-emerald-300" />
                    {trip.budgetTier} Tier
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 text-[13px] font-bold px-4 py-2 rounded-xl capitalize border backdrop-blur-md shadow-sm ${
                      trip.status === "upcoming"
                        ? "bg-indigo-400/30 text-indigo-100 border-indigo-300/40"
                        : "bg-emerald-400/30 text-emerald-100 border-emerald-300/40"
                    }`}
                  >
                    {trip.status}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 text-[13px] font-semibold text-white bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 px-5 py-3 rounded-xl transition-all shadow-sm"
                >
                  <Share2 size={16} />
                  {trip.isPublic ? "Unshare" : "Share"}
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-2 text-[13px] font-semibold text-white bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 px-5 py-3 rounded-xl transition-all shadow-sm"
                >
                  <Download size={16} />
                  PDF
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={generating}
                  className="inline-flex items-center gap-2 text-[13px] font-bold text-indigo-900 bg-white hover:bg-indigo-50 px-6 py-3 rounded-xl transition-all disabled:opacity-70 shadow-[0_4px_20px_rgba(255,255,255,0.3)] hover:shadow-[0_6px_25px_rgba(255,255,255,0.4)]"
                >
                  <RefreshCw size={16} className={generating ? "animate-spin" : ""} />
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── STATS BAR ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E8E5E0]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#F0EDE9]">
            {[
              { label: "Duration",    value: `${trip.totalDays} days` },
              { label: "Travelers",   value: `${trip.travelersCount} ${trip.travelerType}` },
              { label: "Budget",      value: `₹${trip.budgetAmount?.toLocaleString("en-IN")}` },
              weather
                ? { label: weather.description, value: `${weather.temp}°C` }
                : { label: "Est. Total", value: itinerary?.estimatedTotalCost || "—" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col py-5 px-6 md:px-8 text-center md:text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A8F9E] mb-1">
                  {stat.label}
                </span>
                <span className="font-bold text-[#111318] text-base" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── TABS ──────────────────────────────────────────────────────── */}
      <div className="bg-[#F7F5F2] border-b border-[#E8E5E0] sticky top-16 z-30 pt-2">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-semibold transition-all whitespace-nowrap rounded-t-xl ${
                  activeTab === tab.id
                    ? "bg-white text-[#111318] border border-[#E8E5E0] border-b-white"
                    : "text-[#8A8F9E] hover:text-[#111318] hover:bg-white/50 border border-transparent border-b-[#E8E5E0]"
                }`}
                style={{ marginBottom: "-1px" }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── TAB CONTENT ───────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >

          {/* ── ITINERARY TAB ── */}
          {activeTab === "itinerary" && (
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Trip Overview Card */}
              {itinerary?.tripSummary && (
                <div className="bg-white border border-[#E8E5E0] rounded-3xl p-8 shadow-[0_4px_24px_rgba(17,19,24,0.02)]">
                  <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#111318] mb-5 flex items-center gap-2">
                    <Sparkles size={16} className="text-[#D97706]" /> 
                    Curated Trip Overview
                  </h2>
                  <p className="text-[#4B5563] leading-relaxed text-[15px] mb-8">
                    {itinerary.tripSummary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: "Best Time",  value: itinerary.bestTimeToVisit, icon: Sun, color: "text-[#D97706]", bg: "bg-[#FEF3C7]" },
                      { label: "Language",   value: itinerary.localLanguage, icon: MessageSquare, color: "text-[#4F46E5]", bg: "bg-[#EEF2FF]" },
                      { label: "Currency",   value: itinerary.localCurrency, icon: Banknote, color: "text-[#059669]", bg: "bg-[#D1FAE5]" },
                      { label: "Transport",  value: itinerary.localTransport, icon: Bus, color: "text-[#6366F1]", bg: "bg-[#E0E7FF]", span: "md:col-span-2" },
                      { label: "Est. Total", value: itinerary.estimatedTotalCost, icon: Wallet, color: "text-[#E11D48]", bg: "bg-[#FFE4E6]" },
                    ].filter((i) => i.value).map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className={`flex items-start gap-4 p-5 bg-[#FEFCF9] border border-[#F0EDE9] rounded-2xl hover:border-[#E8E5E0] hover:shadow-sm transition-all ${item.span || ""}`}>
                          <div className={`p-2.5 rounded-xl ${item.bg} ${item.color} flex-shrink-0`}>
                            <Icon size={18} strokeWidth={2.5} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8F9E] mb-1.5">
                              {item.label}
                            </p>
                            <p className="text-[14px] leading-relaxed font-medium text-[#111318]">
                              {item.value}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Getting There Card */}
              {itinerary?.transportationToDestination && (
                <div className="bg-white border border-[#E8E5E0] rounded-3xl p-8 shadow-[0_4px_24px_rgba(17,19,24,0.02)] mt-8">
                  <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#111318] mb-6 flex items-center gap-2">
                    <MapPin size={16} className="text-[#4F46E5]" /> 
                    Getting There {trip.origin ? `from ${trip.origin}` : ""}
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { type: "Flight", icon: Plane, details: itinerary.transportationToDestination.flight, color: "text-sky-500", bg: "bg-sky-50" },
                      { type: "Train", icon: Train, details: itinerary.transportationToDestination.train, color: "text-amber-500", bg: "bg-amber-50" },
                      { type: "Bus / Road", icon: Bus, details: itinerary.transportationToDestination.bus, color: "text-emerald-500", bg: "bg-emerald-50" }
                    ].filter(t => t.details && t.details.trim() !== "").map((transport, i) => (
                      <div key={i} className="flex gap-4 p-5 bg-[#FEFCF9] border border-[#F0EDE9] rounded-2xl hover:border-[#E8E5E0] hover:shadow-sm transition-all">
                        <div className={`p-3 rounded-xl ${transport.bg} ${transport.color} flex-shrink-0 h-min`}>
                          <transport.icon size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                          <h3 className="text-[13px] font-bold text-[#111318] mb-1.5">{transport.type}</h3>
                          <p className="text-[14px] leading-relaxed font-medium text-[#4B5563]">{transport.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Weather Card */}
              {weather && (
                <div className="bg-white border border-[#E8E5E0] rounded-3xl p-8 shadow-[0_4px_24px_rgba(17,19,24,0.02)] mt-8">
                  <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#111318] mb-6 flex items-center gap-2">
                    <Cloud size={16} className="text-[#38BDF8]" /> 
                    Current Weather in {weather.city}
                  </h2>
                  <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="p-3 bg-sky-50 rounded-2xl">
                        <img src={weather.icon} alt={weather.description} className="w-20 h-20 drop-shadow-sm" />
                      </div>
                      <div>
                        <div className="text-5xl font-black text-[#111318] tracking-tighter">
                          {weather.temp}°<span className="text-3xl text-[#8A8F9E]">C</span>
                        </div>
                        <p className="text-[#4B5563] text-[15px] font-medium capitalize mt-1">
                          {weather.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto flex-1">
                      <div className="flex flex-col gap-1 p-4 bg-[#FEFCF9] border border-[#F0EDE9] rounded-2xl">
                        <Thermometer size={16} className="text-[#F43F5E] mb-1" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8F9E]">Feels Like</p>
                        <p className="text-[15px] font-semibold text-[#111318]">{weather.feelsLike}°C</p>
                      </div>
                      <div className="flex flex-col gap-1 p-4 bg-[#FEFCF9] border border-[#F0EDE9] rounded-2xl">
                        <Droplets size={16} className="text-[#3B82F6] mb-1" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8F9E]">Humidity</p>
                        <p className="text-[15px] font-semibold text-[#111318]">{weather.humidity}%</p>
                      </div>
                      <div className="flex flex-col gap-1 p-4 bg-[#FEFCF9] border border-[#F0EDE9] rounded-2xl col-span-2 md:col-span-1">
                        <Wind size={16} className="text-[#10B981] mb-1" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8F9E]">Wind</p>
                        <p className="text-[15px] font-semibold text-[#111318]">{weather.windSpeed} km/h</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Day Selector */}
              <div className="flex gap-2 overflow-x-auto hide-scrollbar py-2">
                {days.map((day, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(i)}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      i === selectedDay
                        ? "bg-[#111318] text-white shadow-md"
                        : "bg-white text-[#6B7280] border border-[#E8E5E0] hover:border-[#111318] hover:text-[#111318]"
                    }`}
                  >
                    Day {day.day}
                  </button>
                ))}
              </div>

              {days[selectedDay] && <DayTimeline dayData={days[selectedDay]} />}
            </div>
          )}

          {/* ── MAP TAB ── */}
          {activeTab === "map" && (
            <div className="max-w-4xl mx-auto space-y-6">
              {GOOGLE_MAPS_KEY && GOOGLE_MAPS_KEY !== "your_google_maps_api_key_here" ? (
                <div className="rounded-2xl overflow-hidden border border-[#E8E5E0] shadow-sm" style={{ height: "500px" }}>
                  <iframe
                    width="100%" height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_KEY}&q=${encodeURIComponent(trip.destination)}&zoom=12`}
                    title="Trip Map"
                  />
                </div>
              ) : (
                <div className="rounded-2xl bg-white border border-[#E8E5E0] shadow-sm flex flex-col items-center justify-center p-12 text-center" style={{ height: "400px" }}>
                  <div className="w-16 h-16 bg-[#F7F5F2] rounded-full flex items-center justify-center mb-4">
                    <MapPin size={24} className="text-[#8A8F9E]" />
                  </div>
                  <h3 className="font-bold text-[#111318] mb-2 text-xl" style={{ fontFamily: "'Outfit', sans-serif" }}>Map View</h3>
                  <p className="text-[#6B7280] text-sm max-w-sm mb-6">
                    Add your Google Maps API key in <code className="bg-[#F0EDE9] text-[#111318] px-1.5 py-0.5 rounded text-xs">client/.env</code> to enable the interactive map.
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(trip.destination)}`}
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#111318] hover:bg-[#1E2330] px-5 py-2.5 rounded-xl transition-all"
                  >
                    <Globe size={16} />
                    Open in Google Maps
                  </a>
                </div>
              )}

              {/* Places list */}
              <div className="bg-white border border-[#E8E5E0] rounded-2xl p-7 shadow-sm">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8A8F9E] mb-6">
                  Places to Visit
                </h3>
                <div className="space-y-6">
                  {days.map((day, i) => (
                    <div key={i} className="pb-6 border-b border-[#F0EDE9] last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-[#111318] text-white text-xs font-bold flex items-center justify-center">
                          {day.day}
                        </div>
                        <span className="text-base font-bold text-[#111318]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {day.theme}
                        </span>
                      </div>
                      <div className="ml-11 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {["morning", "afternoon", "evening"].map((period) =>
                          day[period] ? (
                            <a
                              key={period}
                              href={`https://www.google.com/maps/search/${encodeURIComponent(day[period].googleMapsQuery || day[period].place)}`}
                              target="_blank" rel="noreferrer"
                              className="flex items-start gap-2 text-sm text-[#4B5563] hover:text-[#111318] group bg-[#FEFCF9] border border-[#F0EDE9] hover:border-[#D1CEC9] p-3 rounded-xl transition-all"
                            >
                              <MapPin size={14} className="text-[#8A8F9E] flex-shrink-0 mt-0.5" />
                              <span className="flex-1 font-medium">{day[period].place}</span>
                              <span className="text-[#B5B0A8] group-hover:text-[#111318] text-xs">↗</span>
                            </a>
                          ) : null
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── HOTELS TAB ── */}
          {activeTab === "hotels" && (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayHotels.length > 0 ? displayHotels.map(({ hotel, dayLabel }, i) => {
                  const stars = Math.round(hotel.rating || 4);

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="bg-white border border-[#E8E5E0] rounded-2xl p-6 hover:shadow-md transition-all flex flex-col"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A8F9E] block mb-1.5">
                            {dayLabel}
                          </span>
                          <h3 className="font-bold text-[#111318] text-lg mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {hotel.name}
                          </h3>
                          <p className="text-xs font-medium text-[#6B7280] flex items-center gap-1.5">
                            <MapPin size={12} className="text-[#8A8F9E]" /> {hotel.area}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="font-bold text-[#111318] text-lg">{hotel.pricePerNight}</p>
                          <p className="text-[10px] text-[#8A8F9E]">/ night</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 mb-4">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <span key={j} className={`text-sm ${j < stars ? "text-amber-400" : "text-[#E8E5E0]"}`}>★</span>
                        ))}
                        <span className="text-xs font-semibold text-[#8A8F9E] ml-2">{hotel.rating}</span>
                      </div>

                      <p className="text-[13px] text-[#4B5563] leading-relaxed mb-6 flex-1">
                        {hotel.whyRecommended}
                      </p>

                      <div className="flex gap-3">
                        <a
                          href={`https://www.booking.com/search.html?ss=${encodeURIComponent(hotel.name)}`}
                          target="_blank" rel="noreferrer"
                          className="flex-1 text-center py-2.5 text-xs font-bold text-[#111318] border border-[#E8E5E0] bg-[#FEFCF9] hover:bg-white hover:border-[#111318] rounded-xl transition-all"
                        >
                          Booking.com
                        </a>
                        <a
                          href={`https://www.makemytrip.com/hotels/?cityCode=${encodeURIComponent(trip.destination)}`}
                          target="_blank" rel="noreferrer"
                          className="flex-1 text-center py-2.5 text-xs font-bold text-white bg-[#111318] hover:bg-[#1E2330] rounded-xl transition-all"
                        >
                          MakeMyTrip
                        </a>
                      </div>
                    </motion.div>
                  );
                }) : (
                  <div className="col-span-2 text-center py-20 bg-white border border-[#E8E5E0] rounded-2xl">
                    <p className="text-[#8A8F9E] font-medium">Hotel recommendations will appear once the itinerary is generated.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── BUDGET TAB ── */}
          {activeTab === "budget" && (
            <div className="max-w-3xl mx-auto">
              <BudgetChart
                budgetBreakdown={itinerary?.budgetBreakdown}
                totalBudget={trip.budgetAmount}
                estimatedTotal={itinerary?.estimatedTotalCost}
                days={days}
              />
            </div>
          )}

          {/* ── TIPS TAB ── */}
          {activeTab === "tips" && (
            <div className="max-w-3xl mx-auto space-y-6">

              {/* Packing List */}
              {itinerary?.packingList?.length > 0 && (
                <div className="bg-white border border-[#E8E5E0] rounded-2xl p-7 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8A8F9E] flex items-center gap-2">
                      <Luggage size={14} /> Packing List
                    </h3>
                    <span className="text-[11px] font-bold text-[#8A8F9E] bg-[#F0EDE9] px-2.5 py-1 rounded-full">
                      {checkedItems.length}/{itinerary.packingList.length} packed
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-[#F0EDE9] rounded-full mb-6 overflow-hidden">
                    <div
                      className="h-full bg-[#111318] rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${(checkedItems.length / itinerary.packingList.length) * 100}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {itinerary.packingList.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => togglePacking(item)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FEFCF9] border border-transparent hover:border-[#E8E5E0] transition-all text-left"
                      >
                        {checkedItems.includes(item) ? (
                          <CheckSquare size={18} className="text-[#4F46E5] flex-shrink-0" />
                        ) : (
                          <Square size={18} className="text-[#D1CEC9] flex-shrink-0" />
                        )}
                        <span className={`text-[13px] font-medium ${checkedItems.includes(item) ? "line-through text-[#B5B0A8]" : "text-[#111318]"}`}>
                          {item}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Must-Try Foods */}
              {itinerary?.mustTryFoods?.length > 0 && (
                <div className="bg-white border border-[#E8E5E0] rounded-2xl p-7 shadow-sm">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8A8F9E] mb-5">
                    Culinary Experiences
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {itinerary.mustTryFoods.map((food, i) => (
                      <span key={i} className="text-[13px] font-medium text-[#D97706] bg-[#FEF3C7] border border-[#FDE68A] px-4 py-2 rounded-xl">
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Travel Tips */}
              {itinerary?.travelTips?.length > 0 && (
                <div className="bg-white border border-[#E8E5E0] rounded-2xl p-7 shadow-sm">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8A8F9E] mb-5">
                    Local Insights
                  </h3>
                  <div className="space-y-4">
                    {itinerary.travelTips.map((tip, i) => (
                      <div key={i} className="flex gap-4 text-[13px] text-[#4B5563] bg-[#FEFCF9] p-4 rounded-xl border border-[#F0EDE9]">
                        <span className="text-[#8A8F9E] font-mono font-bold flex-shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Safety Tips */}
                {itinerary?.safetyTips?.length > 0 && (
                  <div className="bg-white border border-[#E8E5E0] rounded-2xl p-7 shadow-sm">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8A8F9E] mb-5 flex items-center gap-2">
                      <Shield size={14} /> Safety First
                    </h3>
                    <div className="space-y-3">
                      {itinerary.safetyTips.map((tip, i) => (
                        <div key={i} className="flex gap-3 text-[13px] text-[#4B5563]">
                          <span className="text-[#059669] font-bold flex-shrink-0">✓</span>
                          <span className="leading-relaxed">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emergency Numbers */}
                {itinerary?.emergencyNumbers && Object.keys(itinerary.emergencyNumbers).length > 0 && (
                  <div className="bg-[#111318] rounded-2xl p-7 shadow-md">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8A8F9E] mb-5 flex items-center gap-2">
                      <Phone size={14} /> Emergency Contacts
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(itinerary.emergencyNumbers).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0">
                          <p className="text-xs text-[#8A8F9E] capitalize font-medium">{key.replace(/_/g, " ")}</p>
                          <p className="text-base font-bold text-white font-mono">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </motion.div>
      </div>

      {/* Floating Chat */}
      <ChatWindow
        tripContext={{
          destination: trip.destination,
          totalDays: trip.totalDays,
          budgetTier: trip.budgetTier,
          travelerType: trip.travelerType,
          interests: trip.interests,
        }}
      />
    </div>
  );
};

export default ViewTrip;
