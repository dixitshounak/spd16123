import { useState, useEffect } from "react";
import axios from "axios";

const OPENWEATHER_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

/**
 * Hook to fetch current weather for a city.
 * @param {string} city - City name
 */
export const useWeather = (city) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city) {
      return;
    }

    if (!OPENWEATHER_KEY || OPENWEATHER_KEY === "your_openweather_api_key_here") {
      // Provide beautiful mock data for demonstration if the user hasn't set up an API key yet
      setWeather({
        temp: 28,
        feelsLike: 32,
        description: "partly cloudy",
        icon: "https://openweathermap.org/img/wn/02d@2x.png",
        humidity: 65,
        windSpeed: 14,
        city: city,
        country: "",
      });
      return;
    }

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_KEY}&units=metric`
        );
        setWeather({
          temp: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          description: data.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
          city: data.name,
          country: data.sys.country,
        });
      } catch (err) {
        setError("Weather unavailable");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city]);

  return { weather, loading, error };
};
