import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Users, Wallet, Eye, Edit, Trash2, Copy, Globe } from "lucide-react";
import { formatDateRange, getCountryFlag } from "../../utils/parseDates";
import Badge from "../ui/Badge";

const budgetColors = {
  budget: "success",
  moderate: "highlight",
  luxury: "accent",
  custom: "primary",
};

const travelerIcons = {
  solo: "🧍",
  couple: "👫",
  family: "👨‍👩‍👧",
  friends: "👯",
};

const statusColors = {
  upcoming: "accent",
  completed: "success",
  draft: "muted",
};

const TripCard = ({ trip, onDelete, onDuplicate }) => {
  const flag = getCountryFlag(trip.country || trip.destination);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white rounded-2xl shadow-card border border-border overflow-hidden hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        {trip.coverImage ? (
          <img
            src={trip.coverImage}
            alt={trip.destination}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <span className="text-6xl">{flag}</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={statusColors[trip.status] || "muted"} className="capitalize">
            {trip.status}
          </Badge>
        </div>

        {/* Budget tier badge */}
        <div className="absolute top-3 right-3">
          <Badge variant={budgetColors[trip.budgetTier] || "muted"} className="capitalize">
            {trip.budgetTier}
          </Badge>
        </div>

        {/* Destination overlay */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{flag}</span>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">{trip.destination}</h3>
              {trip.country && <p className="text-white/70 text-xs">{trip.country}</p>}
            </div>
          </div>
        </div>

        {/* Hover action overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
          <Link
            to={`/view-trip/${trip._id}`}
            className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-xl text-sm font-semibold text-primary hover:bg-accent hover:text-white transition-colors"
          >
            <Eye size={14} /> View
          </Link>
          <button
            onClick={() => onDuplicate?.(trip._id)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/20 rounded-xl text-sm font-semibold text-white border border-white/30 hover:bg-white/30 transition-colors"
          >
            <Copy size={14} /> Copy
          </button>
          <button
            onClick={() => onDelete?.(trip._id)}
            className="flex items-center gap-1.5 px-4 py-2 bg-danger/80 rounded-xl text-sm font-semibold text-white hover:bg-danger transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-3">
        {/* Meta info */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center gap-1 px-2 py-2 bg-slate-50 rounded-xl">
            <Calendar size={14} className="text-accent" />
            <span className="text-xs text-muted font-medium">{trip.totalDays}d</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-2 py-2 bg-slate-50 rounded-xl">
            <Users size={14} className="text-accent" />
            <span className="text-xs text-muted font-medium">{trip.travelersCount}</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-2 py-2 bg-slate-50 rounded-xl">
            <span className="text-sm">{travelerIcons[trip.travelerType] || "👤"}</span>
            <span className="text-xs text-muted font-medium capitalize">{trip.travelerType}</span>
          </div>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 text-sm text-muted">
          <Calendar size={13} />
          <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
        </div>

        {/* Budget */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm">
            <Wallet size={13} className="text-highlight" />
            <span className="font-semibold text-primary">
              ₹{trip.budgetAmount?.toLocaleString("en-IN")}
            </span>
          </div>
          {trip.isPublic && (
            <span className="flex items-center gap-1 text-xs text-accent">
              <Globe size={11} /> Public
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TripCard;
