const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/ai/generate', {
      origin: 'Mumbai',
      destination: 'Goa',
      totalDays: 3,
      budgetTier: 'moderate',
      budgetAmount: 20000,
      travelerType: 'solo',
      travelersCount: 1,
      interests: ['beaches'],
      startDate: '2026-06-01'
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("API Error:", err.response?.data || err.message);
  }
}
test();
