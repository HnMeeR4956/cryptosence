const User = require("../models/User");
const FREE_DAILY_LIMIT = 5;
const CG_BASE_URL = process.env.COINGECKO_BASE_URL || "https://api.coingecko.com/api/v3";
const CG_API_KEY = process.env.COINGECKO_API_KEY;
const fetchWithTimeout = (url, options = {}) => fetch(url, { ...options, signal: AbortSignal.timeout(45000) });
const today = () => new Date().toISOString().slice(0, 10);
const usageFor = (user) => ({
  subscriptionStatus: user.subscriptionStatus || "inactive",
  usageCount: user.predictionDay === today() ? user.predictionCount || 0 : 0,
  dailyLimit: FREE_DAILY_LIMIT,
  resetAt: new Date(new Date().setUTCHours(24, 0, 0, 0)).toISOString(),
});
const getUsage = (req, res) => res.json(usageFor(req.user));
function calculateRSI(closePrices, period = 14) {
  if (closePrices.length < period + 1) return null;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closePrices[i] - closePrices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < closePrices.length; i++) {
    const diff = closePrices[i] - closePrices[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);
  return Number(rsi.toFixed(1));
}

function calculateSupportResistance(closePrices, lookback = 30) {
  const recent = closePrices.slice(-lookback);
  if (recent.length === 0) return { support: null, resistance: null };

  return {
    support: Number(Math.min(...recent).toFixed(4)),
    resistance: Number(Math.max(...recent).toFixed(4)),
  };
}

function calculateVolumeTrend(volumes, recentDays = 7) {
  if (volumes.length < recentDays * 2) return null;

  const recent = volumes.slice(-recentDays);
  const prior = volumes.slice(-recentDays * 2, -recentDays);

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const priorAvg = prior.reduce((a, b) => a + b, 0) / prior.length;

  if (priorAvg === 0) return null;

  const percentChange = ((recentAvg - priorAvg) / priorAvg) * 100;
  return {
    recentAvg,
    priorAvg,
    percentChange: Number(percentChange.toFixed(1)),
  };
}

function getRsiSignal(rsi) {
  if (rsi === null) return "Unknown";
  if (rsi >= 70) return "Overbought";
  if (rsi <= 30) return "Oversold";
  return "Neutral";
}



const predict = async (req, res) => {
  const { coinId } = req.body;
  if (typeof coinId !== "string" || !/^[a-z0-9-]{1,100}$/.test(coinId)) {
    return res.status(400).json({ message: "Select a valid coin" });
  }
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_MODEL = process.env.GEMINI_MODEL;
  if (!GEMINI_API_KEY || !GEMINI_MODEL) {
    return res.status(503).json({ message: "Prediction service is not configured" });
  }
  const day = today();
  let reserved = false;
  try {
    if (req.user.subscriptionStatus !== "active") {
      // One atomic update: concurrent requests cannot exceed the daily allowance.
      const user = await User.findOneAndUpdate({
        _id: req.user._id,
        $expr: { $lt: [{ $cond: [{ $eq: ["$predictionDay", day] }, { $ifNull: ["$predictionCount", 0] }, 0] }, FREE_DAILY_LIMIT] },
      }, [{ $set: {
        predictionDay: day,
        predictionCount: { $add: [{ $cond: [{ $eq: ["$predictionDay", day] }, { $ifNull: ["$predictionCount", 0] }, 0] }, 1] },
      } }], { new: true });
      if (!user) return res.status(429).json({ message: "Daily prediction limit reached. Subscribe for unlimited predictions.", usageCount: FREE_DAILY_LIMIT });
      reserved = true;
    }
    const markets = await fetchWithTimeout(CG_BASE_URL + "/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false", {
      headers: CG_API_KEY ? { "x-cg-demo-api-key": CG_API_KEY } : {},
    });
    if (!markets.ok) throw new Error("Market data unavailable");
    const coins = await markets.json();
    const matched = coins.find(coin => coin.id === coinId);
    if (!matched) throw new Error("Select a coin from the top 100 list");
      // Fetch 30 days of price + volume history for real technical analysis
      const headers = CG_API_KEY ? { "x-cg-demo-api-key": CG_API_KEY } : {};
      const historyRes = await fetchWithTimeout(
        `${CG_BASE_URL}/coins/${matched.id}/market_chart?vs_currency=usd&days=30&interval=daily`,
        { headers }
      );

      if (!historyRes.ok) {
        throw new Error("Failed to fetch price history for analysis");
      }

      const historyData = await historyRes.json();
      const closePrices = (historyData.prices || []).map((p) => p[1]);
      const volumes = (historyData.total_volumes || []).map((v) => v[1]);

      const rsi = calculateRSI(closePrices, 14);
      const { support, resistance } = calculateSupportResistance(closePrices, 30);
      const volumeTrend = calculateVolumeTrend(volumes, 7);
      const rsiSignal = getRsiSignal(rsi);

      const computedIndicators = { rsi, rsiSignal, support, resistance, volumeTrend };


      const prompt = `
You are a cryptocurrency prediction bot. Base your prediction on the REAL technical data below — do not invent numbers, use exactly what is given.

Coin: ${matched.name} (${matched.symbol.toUpperCase()})
Current Price: $${matched.current_price}
RSI (14-day): ${rsi !== null ? rsi : "N/A"} (${rsiSignal})
Support level (30-day low): $${support !== null ? support : "N/A"}
Resistance level (30-day high): $${resistance !== null ? resistance : "N/A"}
7-day Volume trend: ${
        volumeTrend
          ? `${volumeTrend.percentChange > 0 ? "+" : ""}${volumeTrend.percentChange}% vs prior 7 days`
          : "N/A"
      }


Using this RSI, support/resistance, and volume trend, return one complete JSON object.
The action must be BUY, SELL, or HOLD.
The reason must be one complete, short sentence that refers to at least one supplied indicator.
The risk must be one complete, short sentence explaining an important uncertainty.
Do not include markdown, code fences, or extra text.

      `.trim();

      const generationConfig = {
        temperature: 0.1,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            action: {
              type: "STRING",
              enum: ["BUY", "SELL", "HOLD"],
            },
            reason: { type: "STRING" },
            risk: { type: "STRING" },
          },
          required: ["action", "reason", "risk"],
        },
      };

      // Gemini 2.5 Flash uses output tokens for internal thinking unless it is
      // disabled. That can leave no tokens for the short JSON answer.
      if (/gemini-2\.5-(flash|flash-lite)/i.test(GEMINI_MODEL)) {
        generationConfig.thinkingConfig = { thinkingBudget: 0 };
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
            generationConfig,
          }),
        }
      );

      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data?.error?.message || `Request failed with status ${response.status}`
        );
      }

      const candidate = data?.candidates?.[0];

      if (!candidate) {
        throw new Error("Gemini did not return a prediction candidate.");
      }

      const text =
        candidate?.content?.parts
          ?.map((part) => part.text || "")
          .join("")
          .trim() || "";

      if (!text) {
        if (candidate.finishReason === "MAX_TOKENS") {
          throw new Error(
            "Gemini used its token limit without returning an answer. Please try again."
          );
        }
        throw new Error("Gemini returned no text.");
      }

      let prediction;
      try {
        prediction = JSON.parse(text);
      } catch {
        if (candidate.finishReason === "MAX_TOKENS") {
          throw new Error(
            "Gemini stopped before completing the prediction. Please try again."
          );
        }
        throw new Error("Gemini returned an invalid prediction. Please try again.");
      }

      const action = String(prediction.action || "").toUpperCase();
      const reason = String(prediction.reason || "").trim();
      const risk = String(prediction.risk || "").trim();

      if (!["BUY", "SELL", "HOLD"].includes(action) || !reason || !risk) {
        throw new Error("Gemini returned an incomplete prediction. Please try again.");
      }

      if (
        candidate.finishReason &&
        !["STOP", "MAX_TOKENS", "FINISH_REASON_UNSPECIFIED"].includes(
          candidate.finishReason
        )
      ) {
        throw new Error(
          `Gemini could not complete the prediction (${candidate.finishReason}).`
        );
      }


    const user = await User.findById(req.user._id);
    return res.json({ prediction: { action, reason, risk }, indicators: computedIndicators,
      coin: { name: matched.name, symbol: matched.symbol.toUpperCase(), image: matched.image, price: matched.current_price },
      ...usageFor(user),
    });
  } catch (error) {
    if (reserved) {
      await User.updateOne({ _id: req.user._id, predictionDay: day, predictionCount: { $gt: 0 } }, { $inc: { predictionCount: -1 } }).catch(() => {});
    }
    // Do not return provider errors, request URLs, or credentials to the browser.
    return res.status(502).json({ message: "Prediction service is unavailable. Please try again." });
  }
};
module.exports = { predict, getUsage };

