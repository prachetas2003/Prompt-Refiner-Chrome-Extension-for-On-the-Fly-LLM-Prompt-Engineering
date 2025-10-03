/// <reference types="react" />
import { useEffect, useState, useCallback } from "react";

export default function SidePanel() {
  const [input, setInput] = useState("");
  const [refined, setRefined] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Listen for selectedText
  useEffect(() => {
    function handler(msg: any) {
      if (msg.action === "selectedText") {
        setInput(msg.text);
        setRefined("");
        setLoading(true);
        chrome.runtime.sendMessage({ action: "refinePrompt", text: msg.text });
      }
      if (msg.action === "refinedPrompt") {
        setRefined(msg.text);
        setLoading(false);
      }
    }
    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, []);

  const handleCopy = useCallback(() => {
    if (!refined) return;
    navigator.clipboard.writeText(refined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }, [refined]);

  return (
    <div className="p-4 w-full">
      <div className="mb-2 font-semibold text-lg">Prompt Refiner</div>
      {loading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <textarea
          className="w-full h-[60vh] p-2 border rounded"
          value={refined}
          onChange={e => setRefined(e.target.value)}
        />
      )}
      <div className="flex items-center mt-2 gap-2">
        <button
          className="p-2 rounded bg-gray-200 hover:bg-gray-300"
          onClick={handleCopy}
          disabled={!refined}
          title="Copy to clipboard"
        >
          {copied ? "Copied!" : "📋"}
        </button>
        <select className="w-full mt-2" disabled>
          <option>Category (coming soon)</option>
        </select>
      </div>
    </div>
  );
} 