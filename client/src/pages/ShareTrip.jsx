import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Share2, ExternalLink } from "lucide-react";
import api from "../lib/axios";
import DayTimeline from "../components/trip/DayTimeline";
import BudgetChart from "../components/trip/BudgetChart";
import Badge from "../components/ui/Badge";
import { FullPageSpinner } from "../components/ui/Spinner";
import { formatDateRange, getCountryFlag } from "../utils/parseDates";

const ShareTrip = () => {
  const { token } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("itinerary");
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/trips/share/${token}`);
        setTrip(data.trip);
      } catch {
        setError("This shared trip is not available or has been made private.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  if (loading) return <FullPageSpinner />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-primary mb-2">Trip Not Available</h2>
          <p className="text-muted mb-6">{error}</p>
          <Link to="/register" className="btn btn-primary">Plan Your Own Trip</Link>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const itinerary = trip.itinerary;
  const days = itinerary?.days || [];
  const flag = getCountryFlag(trip.country || trip.destination);

  const tabs = [
    { id: "itinerary", label: "🗺️ Itinerary" },
    { id: "budget", label: "💰 Budget" },
    { id: "tips", label: "💡 Tips" },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Shared banner */}
      <div className="bg-gradient-to-r from-accent to-accent-dark text-white py-3 px-4 text-center">
        <p className="text-sm font-medium flex items-center justify-center gap-2 flex-wrap">
          <Share2 size={14} />
          This trip was planned with AI Trip Planner
          <Link to="/register" className="underline font-bold flex items-center gap-1 hover:no-underline">
            Plan Your Own Trip <ArrowRight size={12} />
          </Link>
        </p>
      </div>

      {/* Hero */}
      <div className="relative h-64 overflow-hidden">
        {trip.coverImage ? (
          <img src={trip.coverImage} alt={trip.destination} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent to-primary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-primary/80" />
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <div className="container-custom">
            <div className="flex items-end gap-3">
              <span className="text-4xl">{flag}</span>
              <div>
                <h1 className="text-3xl font-display font-black text-white">{trip.destination}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="muted" className="bg-white/20 text-white border-0 text-xs">
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </Badge>
                  <Badge variant="muted" className="bg-white/20 text-white border-0 text-xs">
                    {trip.travelersCount} {trip.travelerType}
                  </Badge>
                  <Badge variant="highlight" className="text-xs capitalize">{trip.budgetTier}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-border sticky top-0 z-30">
        <div className="container-custom px-4">
          <div className="flex gap-1 overflow-x-auto hide-scrollbar py-2">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? "tab-active" : "tab-inactive"}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom px-4 py-8">
        <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {activeTab === "itinerary" && (
            <div className="max-w-3xl mx-auto space-y-6">
              {itinerary?.tripSummary && (
                <div className="card p-6">
                  <h2 className="font-bold text-primary mb-2">📖 Trip Overview</h2>
                  <p className="text-muted leading-relaxed">{itinerary.tripSummary}</p>
                </div>
              )}
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                {days.map((day, i) => (
                  <button key={i} onClick={() => setSelectedDay(i)} className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${i === selectedDay ? "bg-accent text-white" : "bg-white border border-border text-muted hover:border-accent"}`}>
                    Day {day.day}
                  </button>
                ))}
              </div>
              {days[selectedDay] && <DayTimeline dayData={days[selectedDay]} />}
            </div>
          )}
          {activeTab === "budget" && (
            <div className="max-w-3xl mx-auto">
              <BudgetChart budgetBreakdown={itinerary?.budgetBreakdown} totalBudget={trip.budgetAmount} estimatedTotal={itinerary?.estimatedTotalCost} days={days} />
            </div>
          )}
          {activeTab === "tips" && (
            <div className="max-w-3xl mx-auto space-y-6">
              {itinerary?.travelTips?.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-bold text-primary mb-4">💡 Travel Tips</h3>
                  <div className="space-y-3">
                    {itinerary.travelTips.map((tip, i) => (
                      <div key={i} className="flex gap-3 text-sm text-muted">
                        <span className="text-accent font-bold flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>{tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {itinerary?.mustTryFoods?.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-bold text-primary mb-4">🍜 Must-Try Foods</h3>
                  <div className="flex flex-wrap gap-2">
                    {itinerary.mustTryFoods.map((food, i) => <span key={i} className="badge badge-highlight px-3 py-1.5 text-sm">{food}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* CTA Footer */}
      <div className="bg-gradient-to-r from-primary to-primary-light py-12 text-center text-white">
        <h2 className="text-2xl font-display font-bold mb-2">Love this itinerary?</h2>
        <p className="text-white/70 mb-6 text-sm">Generate your own AI-powered travel plan in seconds — completely free!</p>
        <Link to="/register" className="btn btn-highlight btn-lg">
          Plan Your Own Trip ✈️
        </Link>
      </div>
    </div>
  );
};

export default ShareTrip;
