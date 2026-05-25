import React from "react";
import { Loader2 } from "lucide-react";

const Spinner = ({ size = 24, className = "" }) => (
  <Loader2 size={size} className={`animate-spin text-accent ${className}`} />
);

export const FullPageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center text-2xl">✈️</span>
      </div>
      <p className="text-muted text-sm font-medium">Loading your adventure...</p>
    </div>
  </div>
);

export const AirplaneLoader = ({ message = "Generating your perfect itinerary..." }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-6">
    <div className="relative">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center shadow-glow animate-bounce-soft">
        <span className="text-4xl animate-plane">✈️</span>
      </div>
      <div className="absolute -inset-2 rounded-full border-2 border-accent/30 animate-ping" />
    </div>
    <div className="text-center space-y-2">
      <p className="font-bold text-primary text-lg">{message}</p>
      <p className="text-muted text-sm">Powered by Gemini AI 🤖</p>
    </div>
    <div className="flex gap-1.5">
      <div className="typing-dot" />
      <div className="typing-dot" />
      <div className="typing-dot" />
    </div>
  </div>
);

export default Spinner;
