"use client";

import { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

type SummaryState = {
  text: string;
  loading: boolean;
  error?: string;
};

export default function DashboardPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "recording" | "stopped">("idle");
  const [summary, setSummary] = useState<SummaryState>({
    text: "",
    loading: false,
  });

  // Use env for deployment, fallback to localhost for dev
  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

  useEffect(() => {
    const s = io(socketUrl);
    setSocket(s);

    s.on("partial", (chunk: string) => {
      setTranscript((prev) => prev + (prev ? "\n" : "") + chunk);
    });

    s.on("summary", (data: string) => {
      setSummary({ text: data, loading: false });
      setStatus("stopped");
    });

    return () => {
      s.disconnect();
    };
  }, [socketUrl]);

  const handleStart = () => {
    setTranscript("");
    setSummary({ text: "", loading: false });
    setStatus("recording");

    // In a real app, you'd stream microphone audio -> STT -> socket.
    // For this prototype, we simulate incoming transcript chunks:
    const demoLines = [
      "Speaker 1 opened the meeting and reviewed the sprint goals.",
      "The team discussed blockers related to deployment and logging.",
      "An action item was assigned to Jiten to finalize the ScribeAI prototype.",
      "The team agreed to prepare a demo for stakeholders on Friday.",
    ];

    demoLines.forEach((line, idx) => {
      setTimeout(() => {
        socket?.emit("transcript", line);
      }, 800 * (idx + 1));
    });
  };

  const handleStop = () => {
    if (!socket) return;
    setSummary({ text: "", loading: true });
    setStatus("stopped");
    socket.emit("stop");
  };

  return (
    <main className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-400">
          Real-time audio scribing prototype. Socket.io connection:{" "}
          <span className="font-mono">
            {socket?.connected ? "Connected" : "Disconnected"}
          </span>
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="font-semibold">Recording Controls</h2>
        <div className="flex gap-3">
          <button
            className="btn"
            disabled={!socket || status === "recording"}
            onClick={handleStart}
          >
            Start (simulate meeting)
          </button>
          <button
            className="btn"
            disabled={!socket || status !== "recording"}
            onClick={handleStop}
          >
            Stop & summarize
          </button>
        </div>
        <p className="text-sm text-slate-400">
          Status: <span className="font-mono">{status}</span>
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="font-semibold">Live Transcript</h3>
          <div className="border border-slate-800 rounded-xl p-3 text-sm bg-slate-900/40 min-h-[200px] whitespace-pre-wrap">
            {transcript || <span className="text-slate-500">No transcript yet.</span>}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">AI Summary</h3>
          <div className="border border-slate-800 rounded-xl p-3 text-sm bg-slate-900/40 min-h-[200px] whitespace-pre-wrap">
            {summary.loading && <span className="text-slate-400">Generating summary…</span>}
            {!summary.loading && !summary.text && (
              <span className="text-slate-500">No summary yet.</span>
            )}
            {summary.text && <div>{summary.text}</div>}
          </div>
        </div>
      </section>
    </main>
  );
}
