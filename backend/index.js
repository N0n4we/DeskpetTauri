import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const OPENROUTER_API = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY =
  "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";

// POST /api/chat — 聊天补全
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: "messages required" });

  try {
    const resp = await fetch(OPENROUTER_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "stepfun/step-3.5-flash:free",
        messages,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ error: text });
    }

    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content ?? "";
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/generate-pet — 图片生成桌宠
app.post("/api/generate-pet", async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64)
    return res.status(400).json({ error: "imageBase64 required" });

  try {
    const resp = await fetch(OPENROUTER_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "sourceful/riverflow-v2-pro",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "请将输入图片转换为一张卡通小人图像" },
              { type: "image_url", image_url: { url: imageBase64 } },
            ],
          },
        ],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ error: text });
    }

    const data = await resp.json();
    const msg = data.choices?.[0]?.message;
    if (!msg) return res.status(500).json({ error: "No message in response" });

    // Format 1: message.images[].image_url.url
    if (msg.images?.[0]?.image_url?.url) {
      return res.json({ imageUrl: msg.images[0].image_url.url });
    }
    // Format 2: content is a data URL directly
    if (typeof msg.content === "string" && msg.content.startsWith("data:image")) {
      return res.json({ imageUrl: msg.content });
    }
    // Format 3: content is array with image_url parts
    if (Array.isArray(msg.content)) {
      for (const part of msg.content) {
        if (part.type === "image_url" && part.image_url?.url) {
          return res.json({ imageUrl: part.image_url.url });
        }
      }
    }

    res.status(500).json({ error: "No image in response", raw: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`DeskPet backend running on http://localhost:${PORT}`);
});
