import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from 'dotenv';

dotenv.config(); 
const router = express.Router();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/", router);


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/generate-insights", async (req, res) => {
  const regions = req.body.regions;

  if (!Array.isArray(regions)) {
    return res.status(400).json({ error: "Expected 'regions' to be an array" });
  }

  const regionDescriptions = regions.map((region, index) => {
    const {
      id,
      analysis: {
        biomass_mean_MgC_ha = 0,
        forest_loss_pixels = 0,
        soil_carbon_mean = 0,
        rainfall_mean_mm = 0,
      },
      center,
    } = region;

    return `Region ${index + 1} (ID: ${id}) at (${center.lat}, ${center.lng}):
- Biomass: ${biomass_mean_MgC_ha} MgC/ha
- Forest Loss Pixels: ${forest_loss_pixels}
- Soil Carbon: ${soil_carbon_mean} tons/ha
- Rainfall: ${rainfall_mean_mm} mm`;
  }).join("\n\n");

  const prompt = `
You are an environmental analyst. Here are multiple region reports:

${regionDescriptions}

For each region:
1. Summarize its environmental condition.
2. Classify restoration priority: High | Medium | Low
3. Suggest up to 2 restoration zones as:
[
  { "lat": <latitude>, "lng": <longitude>, "radius_km": <number> }
]

Respond with a JSON array of this format:
[
  {
    "id": "region_id",
    "insight": "...",
    "priority": "High|Medium|Low",
    "restoration_zones": [
      { "lat": 12.34, "lng": 56.78, "radius_km": 5 }
    ]
  },
  ...
]
`;

  try {
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const content = chatResponse.choices[0].message.content;

const jsonMatch = content.match(/\[\s*{[\s\S]*}\s*\]/); // matches JSON array

if (!jsonMatch) {
  return res.status(500).json({
    error: "Failed to extract JSON from OpenAI response",
    raw: content,
  });
}

try {
  const parsed = JSON.parse(jsonMatch[0]);
  res.json(parsed);
} catch (err) {
  res.status(500).json({
    error: "Failed to parse extracted JSON",
    raw: jsonMatch[0],
  });
}

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "OpenAI call failed" });
  }
});

export default router;

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
