"use client";

import { useState, useEffect } from "react";
import { X, Key, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, Sparkles, RefreshCw } from "lucide-react";

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AISettingsModal({ isOpen, onClose }: AISettingsModalProps) {
  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setGeminiKey(localStorage.getItem("gemini_api_key") || "");
      setGroqKey(localStorage.getItem("groq_api_key") || "");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof window !== "undefined") {
      if (geminiKey.trim()) {
        localStorage.setItem("gemini_api_key", geminiKey.trim());
      } else {
        localStorage.removeItem("gemini_api_key");
      }

      if (groqKey.trim()) {
        localStorage.setItem("groq_api_key", groqKey.trim());
      } else {
        localStorage.removeItem("groq_api_key");
      }
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleTestGemini = async () => {
    if (!geminiKey.trim()) {
      setTestStatus("Please paste a Gemini API Key first.");
      return;
    }

    setIsTesting(true);
    setTestStatus("Connecting to Google Gemini API...");

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey.trim()}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Respond only with: OK" }] }],
        }),
      });

      if (res.ok) {
        setTestStatus("SUCCESS: Live Gemini 1.5 Flash Connected! Multimodal vision and reasoning are active.");
      } else {
        const err = await res.text();
        setTestStatus(`Error (${res.status}): ${err.substring(0, 100)}`);
      }
    } catch (e: any) {
      setTestStatus(`Connection error: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-[#0f172a] border border-slate-700 shadow-2xl p-6 space-y-5 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Live AI Provider Settings</h2>
              <p className="text-xs text-slate-400">Connect real multimodal LLMs for live photo & text analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info card */}
        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-blue-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Client-Side Direct Integration</span>
          </div>
          <p className="leading-relaxed">
            API keys are saved <strong>only in your local browser storage</strong>. They are never sent to any third-party server — calls are made directly from your browser to Google Generative AI or Groq.
          </p>
        </div>

        {/* Gemini Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
              <span>Google Gemini API Key</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-normal">
                Recommended for Vision
              </span>
            </label>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span>Get Free Key (30s)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <input
            type="password"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <p className="text-[11px] text-slate-400">
            Powers real scene computer vision on photos + emergency dispatch triage.
          </p>
        </div>

        {/* Groq Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200">
              Groq API Key (Optional for Llama 3.1)
            </label>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span>Get Free Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <input
            type="password"
            value={groqKey}
            onChange={(e) => setGroqKey(e.target.value)}
            placeholder="gsk_..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Test status banner */}
        {testStatus && (
          <div
            className={`p-3 rounded-xl text-xs font-medium ${
              testStatus.startsWith("SUCCESS")
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                : "bg-amber-500/10 border border-amber-500/30 text-amber-300"
            }`}
          >
            {testStatus}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleTestGemini}
            disabled={isTesting}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white transition flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
            <span>Test Connection</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition shadow-sm"
            >
              {savedSuccess ? "Saved!" : "Save Keys"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
