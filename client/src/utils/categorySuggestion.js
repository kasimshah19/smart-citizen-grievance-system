// Lightweight keyword-based category suggestion — no external AI service,
// no API key, completely free. Works well because our category list is small
// and fixed, so simple keyword matching is accurate enough.

const CATEGORY_KEYWORDS = {
  "Water Leakage": [
    "water", "pipe", "leak", "leakage", "tap", "supply", "no water",
    "pipeline", "burst", "dripping", "wastage", "overflow",
  ],
  "Road & Potholes": [
    "road", "pothole", "pot hole", "crack", "damaged road", "highway",
    "street damage", "asphalt", "bump", "uneven road",
  ],
  "Garbage Collection": [
    "garbage", "trash", "waste", "rubbish", "not collected", "bin",
    "dustbin", "smell", "rotting", "collection",
  ],
  "Street Light": [
    "street light", "streetlight", "lamp", "light not working",
    "dark street", "bulb", "pole light", "no light",
  ],
  "Open Drainage": [
    "drain", "drainage", "sewage", "sewer", "manhole", "gutter",
    "open drain", "flooding", "stagnant water",
  ],
  "Illegal Dumping": [
    "illegal dump", "dumping", "construction debris", "rubble",
    "unauthorized waste", "dumped",
  ],
};

// Returns { category, score } for the best-matching category, or null if nothing matches well
export function suggestCategory(text) {
  if (!text || text.trim().length < 3) return null;

  const lowerText = text.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        // Longer/more specific keywords count more than short generic ones
        score += keyword.split(" ").length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  }

  if (!bestMatch) return null;

  return { category: bestMatch, score: bestScore };
}