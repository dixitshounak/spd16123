import { useState, useCallback } from "react";
import api from "../lib/axios";
import toast from "react-hot-toast";

/**
 * Hook for AI itinerary generation and chat.
 */
export const useGemini = () => {
  const [generating, setGenerating] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);


  const generateItinerary = useCallback(async (tripDetails) => {
    setGenerating(true);
    try {
      const { data } = await api.post("/ai/generate", tripDetails);
      return data.itinerary;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to generate itinerary";
      toast.error(msg);
      throw error;
    } finally {
      setGenerating(false);
    }
  }, []);

  const sendChatMessage = useCallback(async (message, tripContext, chatHistory) => {
    setChatLoading(true);
    try {
      const { data } = await api.post("/ai/chat", { message, tripContext, chatHistory });
      return data.response;
    } catch (error) {
      toast.error("AI chat failed. Please try again.");
      throw error;
    } finally {
      setChatLoading(false);
    }
  }, []);

  const regenerateItinerary = useCallback(async (tripId) => {
    setGenerating(true);
    try {
      const { data } = await api.post(`/ai/regenerate/${tripId}`);
      toast.success("Itinerary regenerated!");
      return data.itinerary;
    } catch (error) {
      toast.error(error.response?.data?.message || "Regeneration failed");
      throw error;
    } finally {
      setGenerating(false);
    }
  }, []);

  const estimateBudget = useCallback(async (tripDetails) => {
    setEstimating(true);
    try {
      const { data } = await api.post("/ai/estimate-budget", tripDetails);
      return data.budget;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to estimate budget");
      throw error;
    } finally {
      setEstimating(false);
    }
  }, []);

  return { generating, chatLoading, estimating, generateItinerary, sendChatMessage, regenerateItinerary, estimateBudget };
};
