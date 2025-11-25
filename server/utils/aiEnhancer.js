const STRUCTURED_PROMPT_TEMPLATE = `
You are an expert in social media content optimization.
Analyze the user content below and generate a response strictly in JSON format:

{
  "summary": "short explanation of the content",
  "sentiment": "Positive | Neutral | Negative",
  "hashtags": ["keyword1", "keyword2", "keyword3"],
  "key_points": ["suggestion1", "suggestion2"],
  "engagement_prediction": 0
}

Rules:
- Use only DOUBLE QUOTES
- NO markdown, NO backticks, NO codeblock
- hashtags must NOT include '#'
- engagement_prediction must be an integer between 0-100

Content:
`;

const STRUCTURED_RESPONSE_SCHEMA = {
  type: "object",
  required: [
    "summary",
    "sentiment",
    "hashtags",
    "key_points",
    "engagement_prediction",
  ],
  properties: {
    summary: { type: "string" },
    sentiment: { type: "string" },
    hashtags: { type: "array", items: { type: "string" } },
    key_points: { type: "array", items: { type: "string" } },
    engagement_prediction: { type: "integer", minimum: 0, maximum: 100 },
  },
};

// Extract JSON safely from AI output
function extractJson(text) {
  if (!text) return null;
  text = text.replace(/```json|```/gi, "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    text = text.slice(start, end + 1);
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

module.exports.enhanceWithAI = async function (inputText) {
  let apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.warn("❗ No Gemini API key found — skipping AI enhancement");
    return null;
  }

  const fetchFn = globalThis.fetch || (await import("node-fetch")).default;

  // 1️⃣ Get available models for this key
  const listModelsRes = await fetchFn(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  );
  const listModels = await listModelsRes.json();

  const supportedModels = (listModels.models || [])
    .filter((m) =>
      m.supportedGenerationMethods?.includes("generateContent")
    )
    .map((m) => m.name);

  // preference order
  const preferred = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-flash",
    "gemini-pro",
    "gemini-1.5-flash",
  ];

  let selectedModel =
    preferred.find((p) => supportedModels.some((m) => m.includes(p))) ||
    supportedModels.find((m) => m.includes("gemini"));

  if (!selectedModel) {
    console.warn("⚠ No supported Gemini model found for this key");
    return null;
  }

  console.log("🔹 Using Gemini model:", selectedModel);

  // 2️⃣ Generate structured content
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: STRUCTURED_PROMPT_TEMPLATE + inputText }] }],
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
      responseSchema: STRUCTURED_RESPONSE_SCHEMA,
    },
  };

  const res = await fetchFn(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const responseText = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    console.error("❌ Failed parsing AI full response:", responseText);
    return null;
  }

  if (!res.ok) {
    console.error("❌ Gemini API error:", parsed);
    return null;
  }

  const aiText =
    parsed?.candidates?.[0]?.content?.parts?.[0]?.text ??
    parsed?.candidates?.[0]?.output_text ??
    "";

  const structured = extractJson(aiText);
  if (!structured) {
    console.warn("⚠ AI did not return valid structured JSON");
    return null;
  }

  return {
    raw: aiText,
    structured,
    model: selectedModel,
  };
};