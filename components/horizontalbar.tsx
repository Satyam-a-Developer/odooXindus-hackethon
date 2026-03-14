'use client';

import React, { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function HorizontalBar() {
  const [search, setSearch] = useState("");
  const [listening, setListening] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const recognitionRef = useRef<any>(null);

  // --- DATABASE FETCH LOGIC ---
  const fetchVoiceResults = async (type: string) => {
    setLoading(true);
    // This fetches from stock_moves, joining the product name
    const { data, error } = await supabase
      .from("stock_moves")
      .select(`
        id,
        quantity,
        warehouse,
        move_type,
        products ( name )
      `)
      .eq("move_type", type) // 'receipt' or 'delivery'
      .limit(5);

    if (error) {
      console.error("Error fetching voice results:", error);
    } else {
      setResults(data || []);
      setShowPopover(true);
    }
    setLoading(false);
  };

  const toggleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false; // Stop after one command
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setSearch(transcript);

      // 🎤 VOICE COMMANDS
      if (transcript.includes("receipt")) {
        fetchVoiceResults("receipt");
      } else if (transcript.includes("delivery")) {
        fetchVoiceResults("delivery");
      }
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognition.start();
    recognitionRef.current = recognition;
  };

  return (
    <div className="w-full h-16 bg-white border-b flex items-center justify-between px-6 relative z-50">
      
      {/* SEARCH BAR */}
      <div className={`flex items-center w-[400px] rounded-lg px-3 py-2 transition-all ${
        listening ? "bg-red-50 ring-2 ring-red-500 shadow-lg" : "bg-gray-100"
      }`}>
        <input
          type="text"
          placeholder={listening ? "Say 'Receipts' or 'Deliveries'..." : "Search inventory..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-sm w-full"
        />
        <button
          onClick={toggleVoiceSearch}
          className={`ml-2 p-1.5 rounded-full transition-colors ${
            listening ? "bg-red-500 text-white animate-pulse" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          🎤
        </button>
      </div>

      {/* SEARCH RESULTS POPOVER */}
      {showPopover && (
        <div className="absolute top-16 left-6 w-96 bg-white border shadow-2xl rounded-xl p-4 mt-2 animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Recent {search.charAt(0).toUpperCase() + search.slice(1)}
            </h3>
            <button onClick={() => setShowPopover(false)} className="text-gray-400 hover:text-black text-lg">✕</button>
          </div>

          {loading ? (
            <div className="p-4 text-center text-sm text-gray-400">Searching database...</div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((item) => (
                <div key={item.id} className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer transition">
                  <p className="font-bold text-sm text-gray-900">{item.products?.name}</p>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-gray-500 uppercase font-mono">{item.warehouse}</span>
                    <span className={`text-xs font-bold ${item.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.quantity > 0 ? '+' : ''}{item.quantity} units
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-400">No records found for "{search}"</div>
          )}
        </div>
      )}
    </div>
  );
}