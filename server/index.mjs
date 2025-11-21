import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing. Set it in environment variables.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// In-memory transcript buffer per socket
const transcripts = new Map();

io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);
  transcripts.set(socket.id, "");

  socket.on("transcript", (line) => {
    const prev = transcripts.get(socket.id) || "";
    const updated = prev + (prev ? "\n" : "") + line;
    transcripts.set(socket.id, updated);
    socket.emit("partial", line);
  });

  socket.on("stop", async () => {
    const transcript = transcripts.get(socket.id) || "";
    console.log("🧠 Generating summary for", socket.id);

    if (!transcript.trim()) {
      socket.emit("summary", "⚠ No transcript available to summarize.");
      return;
    }

    const prompt = `
You are an AI meeting assistant. Based on the transcript below, produce:

1. Executive summary (3–5 bullet points)
2. Key decisions
3. Action items (with owners if mentioned)
4. Risks or concerns
5. Important dates or deadlines

Keep it concise and structured.

Transcript:
${transcript}
`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      socket.emit("summary", text);
    } catch (err) {
      console.error("❌ Error calling Gemini:", err);
      socket.emit(
        "summary",
        "⚠ Failed to generate AI summary. Please check server logs or API key."
      );
    } finally {
      transcripts.set(socket.id, "");
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    transcripts.delete(socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Socket.io backend listening on http://localhost:${PORT}`);
});
