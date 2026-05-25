import React, { createContext, useContext, useState, useCallback } from "react";
import api from "../lib/axios";
import toast from "react-hot-toast";

const TripContext = createContext(null);

export const TripProvider = ({ children }) => {
  const [trips, setTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0, draft: 0, countries: 0 });
  const [loading, setLoading] = useState(false);

  const fetchTrips = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/trips${params ? `?${params}` : ""}`);
      setTrips(data.trips);
      setStats(data.stats);
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load trips");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrip = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/trips/${id}`);
      setCurrentTrip(data.trip);
      return data.trip;
    } catch (error) {
      toast.error(error.response?.data?.message || "Trip not found");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTrip = useCallback(async (tripData) => {
    const { data } = await api.post("/trips", tripData);
    setTrips((prev) => [data.trip, ...prev]);
    return data.trip;
  }, []);

  const updateTrip = useCallback(async (id, tripData) => {
    const { data } = await api.put(`/trips/${id}`, tripData);
    setTrips((prev) => prev.map((t) => (t._id === id ? data.trip : t)));
    if (currentTrip?._id === id) setCurrentTrip(data.trip);
    return data.trip;
  }, [currentTrip]);

  const deleteTrip = useCallback(async (id) => {
    await api.delete(`/trips/${id}`);
    setTrips((prev) => prev.filter((t) => t._id !== id));
    setStats((prev) => ({ ...prev, total: prev.total - 1 }));
    toast.success("Trip deleted successfully");
  }, []);

  const toggleShare = useCallback(async (id) => {
    const { data } = await api.post(`/trips/${id}/share`);
    return data;
  }, []);

  const duplicateTrip = useCallback(async (id) => {
    const { data } = await api.post(`/trips/${id}/duplicate`);
    setTrips((prev) => [data.trip, ...prev]);
    toast.success("Trip duplicated!");
    return data.trip;
  }, []);

  return (
    <TripContext.Provider
      value={{
        trips, currentTrip, setCurrentTrip, stats, loading,
        fetchTrips, fetchTrip, createTrip, updateTrip, deleteTrip, toggleShare, duplicateTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTripContext = () => {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTripContext must be used within TripProvider");
  return ctx;
};

export default TripContext;
