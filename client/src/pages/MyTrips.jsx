import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, Trash2, Globe, LayoutGrid } from "lucide-react";
import { useTrips } from "../hooks/useTrips";
import { useAuth } from "../hooks/useAuth";
import TripCard from "../components/trip/TripCard";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { SkeletonTrip } from "../components/ui/Skeleton";
import toast from "react-hot-toast";

const statusFilters = ["all", "upcoming", "completed", "draft"];

const MyTrips = () => {
  const { user } = useAuth();
  const { trips, stats, loading, fetchTrips, deleteTrip, duplicateTrip } = useTrips();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTrips({ status: filter !== "all" ? filter : undefined, search });
  }, [filter, search]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteTrip(deleteId);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleDuplicate = async (id) => {
    const trip = await duplicateTrip(id);
    if (trip) navigate(`/view-trip/${trip._id}`);
  };

  return (
    <div className="min-h-screen bg-surface pt-20 pb-24 md:pb-8">
      <div className="container-custom px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary">
              Welcome back, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-muted mt-1">Your travel adventures, all in one place</p>
          </div>
          <Button variant="primary" onClick={() => navigate("/create-trip")} leftIcon={<Plus size={16} />}>
            Plan New Trip
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Trips", value: stats.total, emoji: "✈️" },
            { label: "Upcoming", value: stats.upcoming, emoji: "🗓️" },
            { label: "Completed", value: stats.completed, emoji: "✅" },
            { label: "Drafts", value: stats.draft, emoji: "📝" },
            { label: "Countries", value: stats.countries, emoji: "🌍" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="card p-4 text-center"
            >
              <span className="text-2xl block mb-1">{stat.emoji}</span>
              <p className="text-2xl font-black text-primary">{stat.value}</p>
              <p className="text-xs text-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          {/* Status tabs */}
          <div className="flex gap-1 overflow-x-auto hide-scrollbar">
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`${s === filter ? "tab-active" : "tab-inactive"} capitalize`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs ml-auto">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destination..."
              className="input pl-9 py-2 text-sm"
            />
          </div>
        </div>

        {/* Trip Grid */}
        {loading ? (
          <SkeletonTrip />
        ) : trips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-7xl mb-6 animate-float">🗺️</div>
            <h3 className="text-xl font-bold text-primary mb-2">No trips yet!</h3>
            <p className="text-muted mb-8 max-w-sm mx-auto">
              {search || filter !== "all"
                ? "No trips match your filters. Try adjusting your search."
                : "Your next adventure is just a click away. Let AI plan your perfect trip!"}
            </p>
            {!search && filter === "all" && (
              <Button variant="primary" size="lg" onClick={() => navigate("/create-trip")} leftIcon={<Plus size={16} />}>
                Plan My First Trip
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {trips.map((trip, i) => (
                <TripCard
                  key={trip._id}
                  trip={trip}
                  onDelete={(id) => setDeleteId(id)}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Trip?"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>
              <Trash2 size={14} /> Delete
            </Button>
          </div>
        }
      >
        <p className="text-muted">
          Are you sure you want to delete this trip? This action cannot be undone and all itinerary data will be permanently removed.
        </p>
      </Modal>
    </div>
  );
};

export default MyTrips;
