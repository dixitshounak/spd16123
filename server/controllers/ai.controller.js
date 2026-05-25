const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── BUILD ITINERARY PROMPT ───────────────────────────────────────────────────
const buildItineraryPrompt = ({ origin, destination, totalDays, budgetTier, budgetAmount, travelerType, travelersCount, interests, startDate }) => `
You are a world-class travel planner with deep expertise in destinations globally.
Generate a hyper-detailed, realistic, budget-aware trip itinerary.

Trip Details:
- Origin: ${origin || "Not specified (Provide general travel advice to the destination)"}
- Destination: ${destination}
- Duration: ${totalDays} days
- Start Date: ${startDate}
- Budget Tier: ${budgetTier} (Total budget: ₹${budgetAmount})
- Travelers: ${travelersCount} ${travelerType}
- Interests: ${interests.join(", ")}

STRICT RULES:
1. Return ONLY raw valid JSON — zero markdown, zero explanation, no code fences, no backticks
2. All costs in Indian Rupees ₹
3. Use REAL place names, REAL restaurants, REAL hotels that exist
4. Tailor experiences to traveler type and interests
5. Keep total estimated cost within the given budget
6. Prioritize authentic local experiences over tourist traps
7. All text fields must be descriptive and detailed (no generic placeholders)
8. CRITICAL: You MUST include 'travelTo' for EVERY morning, afternoon, and evening activity. The 'travelTo' MUST contain exact local bus routes, expected timings, or taxi fares to travel from the PREVIOUS destination (or hotel) to this new destination. DO NOT omit this field under any circumstances.
9. Provide exactly 4 diverse 'hotelOptions' (varying in price, area, or style) to give the traveler plenty of choices.

Return this exact JSON structure (do NOT add extra fields or change keys):
{
  "tripSummary": "2-3 sentence immersive overview of the trip experience",
  "bestTimeToVisit": "string describing ideal season and weather",
  "localLanguage": "string",
  "localCurrency": "string",
  "estimatedTotalCost": "₹XX,XXX",
  "transportationToDestination": {
    "flight": "Details on flights/nearest airport from Origin. E.g., 'Take a direct flight from [Origin] to [Destination Airport] (approx. 2 hours, ₹5,000)'. If not applicable, write 'Not recommended/Available'.",
    "train": "Details on train routes from Origin to the nearest railway station. If not applicable, write 'Not recommended/Available'.",
    "bus": "Details on bus routes, driving options, and highways from Origin. If not applicable, write 'Not recommended/Available'."
  },
  "localTransport": "string describing getting around options",
  "hotelOptions": [
    {
      "name": "Real hotel name",
      "area": "Neighborhood or area",
      "rating": 4.5,
      "pricePerNight": "₹X,XXX",
      "whyRecommended": "Specific reason why this hotel suits the traveler type and interests"
    }
  ],
  "days": [
    {
      "day": 1,
      "date": "Day 1 formatted date",
      "theme": "Descriptive theme for the day",
      "morning": {
        "time": "9:00 AM",
        "activity": "Detailed activity description",
        "place": "Exact place name",
        "travelTo": "Specific transport options (bus route, cab fare, walk time) to reach this place from the hotel",
        "cost": "₹XXX",
        "duration": "2 hrs",
        "tips": "Practical insider tip",
        "googleMapsQuery": "Exact place name + city name for Maps"
      },
      "afternoon": {
        "time": "2:00 PM",
        "activity": "Detailed activity description",
        "place": "Exact place name",
        "travelTo": "Specific transport options to reach this place from the Morning location",
        "cost": "₹XXX",
        "duration": "3 hrs",
        "tips": "Practical insider tip",
        "googleMapsQuery": "Exact place name + city name"
      },
      "evening": {
        "time": "7:00 PM",
        "activity": "Detailed activity description",
        "place": "Exact place name",
        "travelTo": "Specific transport options to reach this place from the Afternoon location",
        "cost": "₹XXX",
        "duration": "2 hrs",
        "tips": "Practical insider tip",
        "googleMapsQuery": "Exact place name + city name"
      },
      "meals": [
        { "type": "Breakfast", "restaurant": "Real restaurant name", "dish": "Specific dish recommendation", "cost": "₹XX" },
        { "type": "Lunch", "restaurant": "Real restaurant name", "dish": "Specific dish recommendation", "cost": "₹XXX" },
        { "type": "Dinner", "restaurant": "Real restaurant name", "dish": "Specific dish recommendation", "cost": "₹XXX" }
      ],
      "dailyCost": "₹X,XXX"
    }
  ],
  "budgetBreakdown": {
    "hotels": "₹XX,XXX",
    "food": "₹XX,XXX",
    "activities": "₹XX,XXX",
    "transport": "₹XX,XXX",
    "misc": "₹XX,XXX"
  },
  "packingList": ["item1", "item2", "item3"],
  "travelTips": ["Detailed tip 1", "Detailed tip 2", "Detailed tip 3"],
  "mustTryFoods": ["food1", "food2", "food3"],
  "safetyTips": ["tip1", "tip2"],
  "emergencyNumbers": { "police": "100", "ambulance": "108", "tourist_helpline": "1800-111-363" }
}
`;

// ─── GENERATE ITINERARY ───────────────────────────────────────────────────────
const generateItinerary = async (req, res, next) => {
  try {
    const { origin, destination, totalDays, budgetTier, budgetAmount, travelerType, travelersCount, interests, startDate } = req.body;

    if (!destination || !totalDays || !budgetTier || !budgetAmount) {
      return res.status(400).json({ success: false, message: "Missing required trip details." });
    }

    const prompt = buildItineraryPrompt({ origin, destination, totalDays, budgetTier, budgetAmount, travelerType, travelersCount, interests, startDate });

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // Strip markdown fences if Gemini adds them despite instructions
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Attempt JSON parse
    let itinerary;
    try {
      itinerary = JSON.parse(text);
    } catch {
      // Try to extract JSON from text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        itinerary = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("AI returned non-JSON response. Please try again.");
      }
    }

    res.json({ success: true, itinerary });
  } catch (error) {
    if (error.message?.includes("SAFETY")) {
      return res.status(400).json({ success: false, message: "Content was blocked by safety filters. Try a different destination." });
    }
    next(error);
  }
};

// ─── AI CHAT ──────────────────────────────────────────────────────────────────
const aiChat = async (req, res, next) => {
  try {
    const { message, tripContext, chatHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    const systemContext = tripContext
      ? `You are an expert travel assistant helping with a trip to ${tripContext.destination} (${tripContext.totalDays} days, ${tripContext.budgetTier} budget, ${tripContext.travelerType} travelers).
         Be specific, helpful, and concise. Answer questions about this trip's itinerary, local tips, alternatives, and travel advice.`
      : "You are an expert travel assistant. Answer questions about travel, destinations, tips, and planning.";

    // Build conversation for Gemini
    const conversationHistory = chatHistory.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemContext,
    });

    const chat = model.startChat({ history: conversationHistory });
    const result = await chat.sendMessage(message);
    const response = result.response.text();

    res.json({ success: true, response });
  } catch (error) {
    next(error);
  }
};

// ─── REGENERATE ITINERARY ─────────────────────────────────────────────────────
const regenerateItinerary = async (req, res, next) => {
  try {
    const Trip = require("../models/Trip");
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });

    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found." });
    }

    const prompt = buildItineraryPrompt({
      origin: trip.origin,
      destination: trip.destination,
      totalDays: trip.totalDays,
      budgetTier: trip.budgetTier,
      budgetAmount: trip.budgetAmount,
      travelerType: trip.travelerType,
      travelersCount: trip.travelersCount,
      interests: trip.interests,
      startDate: trip.startDate,
    });

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let itinerary;
    try {
      itinerary = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) itinerary = JSON.parse(jsonMatch[0]);
      else throw new Error("AI returned non-JSON response. Please try again.");
    }

    // Update the trip with new itinerary
    trip.itinerary = itinerary;
    trip.markModified('itinerary');
    await trip.save();

    res.json({ success: true, itinerary, message: "Itinerary regenerated successfully!" });
  } catch (error) {
    next(error);
  }
};

// ─── ESTIMATE BUDGET ──────────────────────────────────────────────────────────
const estimateBudget = async (req, res, next) => {
  try {
    const { origin, destination, totalDays, budgetTier, travelerType, travelersCount } = req.body;

    if (!destination || !totalDays) {
      return res.status(400).json({ success: false, message: "Missing required trip details for budget estimation." });
    }

    const prompt = `You are a travel budget estimator.
Estimate a total budget in INR (₹) for a trip based on these details:
Origin: ${origin || "Unknown"}
Destination: ${destination}
Duration: ${totalDays} days
Travel Style: ${budgetTier}
Travelers: ${travelersCount} (${travelerType})

Consider the distance between origin and destination for travel cost, accommodation for the given style and days, food, and basic activities.
Return ONLY a valid JSON object with a single key "estimatedBudget" and a numeric value (e.g., {"estimatedBudget": 25000}). Nothing else. No markdown.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\\{[\\s\\S]*\\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      else throw new Error("AI returned non-JSON response.");
    }

    res.json({ success: true, budget: parsed.estimatedBudget || 25000 });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateItinerary, aiChat, regenerateItinerary, estimateBudget };
